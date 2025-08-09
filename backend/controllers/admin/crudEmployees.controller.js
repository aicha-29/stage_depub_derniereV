const User = require("../../models/user");
const Project = require("../../models/project");
const Task = require("../../models/task");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Notification = require('../../models/notification');
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const {
  uploadUserPhoto,
  processUserPhoto,
} = require("../../middlewares/upload");

exports.getAllEmployeesWithProjects = async (req, res) => {
  try {
    const employees = await User.find({
      $or: [{ role: "employee" }, { role: "manager" }],
    })
      .select(
        " _id name position profilePhoto profilePhotoThumb email cin role "
      ) // Ajout de profilePhotoThumb
      .lean();

    const employeesWithProjects = await Promise.all(
      employees.map(async (employee) => {
        const projects = await Project.find({ assignedEmployees: employee._id })
          .select("logo")
          .lean();

        // Construire les URLs complets pour les photos
        const baseUrl = `${req.protocol}://${req.get("host")}/public/`;

        return {
          ...employee,
          profilePhoto: employee.profilePhoto
            ? baseUrl + employee.profilePhoto
            : null,
          profilePhotoThumb: employee.profilePhotoThumb
            ? baseUrl + employee.profilePhotoThumb
            : null,
          projects: projects.map((project) => ({
            logo: project.logo ? baseUrl + project.logo : null,
            thumbnail: project.thumbnail ? baseUrl + project.thumbnail : null,
          })),
        };
      })
    );

    res.status(200).json(employeesWithProjects);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error while fetching employees" });
  }
};

//details d'un employe

exports.getEmployeeDetails = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const baseUrl = `${req.protocol}://${req.get("host")}/public/`;

    // Récupérer les détails de l'employé
    const employee = await User.findById(employeeId)
      .select(
        " _id name position email cin profilePhoto profilePhotoThumb role"
      )
      .lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Récupérer les projets assignés avec plus de détails
    const projects = await Project.find({ assignedEmployees: employeeId })
      .select(
        "_id name company priority status priority progression assignedEmployees logo thumbnail"
      )
      .lean();

    // Formater la réponse
    const response = {
      employee: {
        ...employee,
        profilePhoto: employee.profilePhoto
          ? baseUrl + employee.profilePhoto
          : null,
        profilePhotoThumb: employee.profilePhotoThumb
          ? baseUrl + employee.profilePhotoThumb
          : null,
      },
      projects: projects.map((project) => ({
        _id: project._id,
        name: project.name,
        company: project.company,
        priority: project.priority,
        status: project.status,
        priority: project.priority,
        assignedEmployees: project.assignedEmployees || [],
        progression: project.progression,
        logo: project.logo ? baseUrl + project.logo : null,
        thumbnail: project.thumbnail ? baseUrl + project.thumbnail : null,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({
      message: "Server error while fetching employee details",
      error: error.message,
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    // Middleware pour gérer l'upload de photo
    uploadUserPhoto(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Erreur de Multer (ex: fichier trop volumineux)
        return res.status(400).json({ message: err.message });
      } else if (err) {
        // Autres erreurs
        return res.status(400).json({ message: err.message });
      }

      // Traitement de la photo si elle existe
      if (req.file) {
        await processUserPhoto(req, res, () => {});
      }

      // Validation des données requises
      const { name, email, password, position, cin, role } = req.body;
      if (!name || !email || !position || !cin || !password || !role) {
        // Supprimer le fichier uploadé si la validation échoue
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "Tous les champs obligatoires doivent être remplis",
        });
      }

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const existingCin = await User.findOne({ cin });
      if (existingCin) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Cet cin est déjà utilisé" });
      }
      // Créer le nouvel employé
      const newEmployee = new User({
        name,
        email,
        password,
        position,
        cin,
        role, // Définit automatiquement le rôle
        profilePhoto: req.file?.profilePhoto || null,
        profilePhotoThumb: req.file?.profilePhotoThumb || null,
      });

      // Sauvegarder dans la base de données
      await newEmployee.save();

          // Créer une notification
      const notification = new Notification({
        recipient: newEmployee._id,
        message: `Bienvenue dans l'équipe DEVPUB, ${newEmployee.name}! Votre compte a été créé.`,
        type: 'account_created'
      });
      await notification.save();

         // Notifier tous les managers
      const managers = await User.find({ role: 'manager' });
      managers.forEach(async (manager) => {
        const managerNotification = new Notification({
          recipient: manager._id,
          message: `Un nouvel employé a été ajouté: ${newEmployee.name}`,
          type: 'new_employee'
        });
        await managerNotification.save();
        
        // Émettre l'événement Socket.IO
        const io = req.app.get('io');
        io.to(`user_${manager._id}`).emit('new_notification', managerNotification);
      });


      // Réponse avec les données créées (sans le mot de passe)
      const employeeResponse = newEmployee.toObject();
      delete employeeResponse.password;

      res.status(201).json({
        message: "Employé créé avec succès",
        employee: employeeResponse,
      });
    });
  } catch (error) {
    // Nettoyage en cas d'erreur
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error creating employee:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de l'employé",
      error: error.message,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employeeId = req.params.id;

    // 1. Vérifier si l'employé existe
    const employee = await User.findById(employeeId).session(session);
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // 2. Supprimer les fichiers de photo de profil s'ils existent
    if (
      employee.profilePhoto &&
      employee.profilePhoto !== "default-avatar.png"
    ) {
      const photoPath = path.join("public", employee.profilePhoto);
      const thumbPath = employee.profilePhotoThumb
        ? path.join("public", employee.profilePhotoThumb)
        : null;

      if (thumbPath) {
        // Supprime les deux fichiers en parallèle
        await Promise.all([
          fs.promises
            .unlink(photoPath)
            .catch((err) => console.error("Error deleting photo:", err)),
          fs.promises
            .unlink(thumbPath)
            .catch((err) => console.error("Error deleting thumbnail:", err)),
        ]);
      } else {
        // Supprime uniquement la photo si la miniature n'existe pas
        await fs.promises
          .unlink(photoPath)
          .catch((err) => console.error("Error deleting photo:", err));
      }
    }

    // 3. Retirer l'employé des projets assignés
    await Project.updateMany(
      { assignedEmployees: employeeId },
      { $pull: { assignedEmployees: employeeId } },
      { session }
    );

    // 4. Mettre à jour les tâches assignées (les désassigner)
    /* await Task.updateMany(
      { assignedTo: employeeId },
      { $set: { assignedTo: null } },
      { session }
    );*/
    await Task.deleteMany({ assignedTo: employeeId }, { session });

    // 5. Supprimer l'employé
    await User.deleteOne({ _id: employeeId }).session(session);

    // 6. Valider la transaction
  


      // Créer des notifications pour tous les employés et managers
    const usersToNotify = await User.find({
      $or: [{ role: 'employee' }, { role: 'manager' }],
      _id: { $ne: employeeId }
    });

     usersToNotify.forEach(async (user) => {
      const notification = new Notification({
        recipient: user._id,
        message: `L'employé ${employee.name} a été supprimé du système de DEVPUB.`,
        type: 'employee_deleted'
      });
      await notification.save();
      
      // Émettre l'événement Socket.IO
      const io = req.app.get('io');
      io.to(`user_${user._id}`).emit('new_notification', notification);
    });


      await session.commitTransaction();
    res.status(200).json({
      message: "Employé supprimé avec succès",
      deletedEmployee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await session.abortTransaction();

    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'employé",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: "Employé non trouvé" });
  }
const baseUrl=`${req.protocol}://${req.get("host")}/public/`;
  // Préparer les updates
  const updates = {
    name: req.body.name,
    email: req.body.email || employee.email,
    position: req.body.position || employee.position,
    cin: req.body.cin || employee.cin,
    role: req.body.role || employee.role,
    removePhoto: req.body.removePhoto === "true" ? true : false,
    updatedAt: new Date(),
  };

  // Gestion de la suppression des anciennes photos
  const oldPhoto = employee.profilePhoto;
  //const oldThumb = employee.profilePhotoThumb;

  // Gestion de la photo
  if (req.file?.profilePhoto) {
    // Utiliser directement le chemin du middleware
    updates.profilePhoto = req.file.profilePhoto;
    updates.profilePhotoThumb = req.file.profilePhotoThumb;

    // Supprimer les anciennes photos si elles existent et ne sont pas des photos par défaut
    if (oldPhoto) {
      const fullPhotoPath = path.join("public", oldPhoto);
      //const fullThumbPath = path.join('public', oldThumb);

      if (fs.existsSync(fullPhotoPath)) fs.unlinkSync(fullPhotoPath);
      else
        res.json({
          message: "photo n'existe pas physiquemnt su le path indiquer",
        });
      // if (fs.existsSync(fullThumbPath)) fs.unlinkSync(fullThumbPath);
    }
  } else if (updates.removePhoto) {
    updates.profilePhoto = null;
    // updates.profilePhotoThumb = "";

    // Supprimer les anciennes photos si elles existent et ne sont pas des photos par défaut
    if (oldPhoto) {
      const fullPhotoPath = path.join("public", oldPhoto);
      // const fullThumbPath = path.join('public', oldThumb);

      if (fs.existsSync(fullPhotoPath)) fs.unlinkSync(fullPhotoPath);
      // if (fs.existsSync(fullThumbPath)) fs.unlinkSync(fullThumbPath);
    }
  }

  // Mise à jour
  const updatedEmployee = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  }).select("-password");

  // Préparer la réponse sans reconstruire l'URL
  const response = updatedEmployee.toObject();
  response.profilePhoto=response.profilePhoto?baseUrl+response.profilePhoto:response.profilePhoto;

   // Créer une notification pour l'employé
  const notification = new Notification({
    recipient: employee._id,
    message: `Votre profil a été mis à jour par l'administrateur.`,
    type: 'profile_updated'
  });
  await notification.save();
  
    // Émettre l'événement Socket.IO
  const io = req.app.get('io');
  io.to(`user_${employee._id}`).emit('employee_updated', response);
  io.to(`user_${employee._id}`).emit('new_notification', notification);
  
  

    // Notification pour tous les managers
  const managers = await User.find({ role: 'manager' }).select('_id');
  managers.forEach(manager => {
    const managerNotification = new Notification({
      recipient: manager._id,
      sender: req.user._id,
      message: `Le profil de ${employee.name} a été modifié`,
      type: 'employee_update'
    });
    managerNotification.save();
    io.to(`user_${manager._id}`).emit('new_notification', managerNotification);
  });



  res.status(200).json({
    message: "Employé mis à jour avec succès",
    employee: response,
  });
});

// Ajout de la réinitialisation du mot de passe
exports.resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const employee = await User.findById(id);
  if (!employee) {
    return res.status(404).json({ message: "Employé non trouvé" });
  }

  employee.password = newPassword;

  await employee.save();

  res.status(200).json({
    message: "Mot de passe réinitialisé avec succès",
  });
});

