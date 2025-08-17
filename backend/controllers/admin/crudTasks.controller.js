const Task = require("../../models/task");
const Project = require("../../models/project");
const User = require("../../models/user");
const mongoose = require("mongoose");
const path = require("path");
<<<<<<< HEAD
const { sendNotification, notifyManagersAndAdmins } = require("../../utils/notification.utils");
const { sendNotification2, notifyManagersAndAdmins2 } = require("../../utils/notification2.utils");

async function checkLateTasks(io) {
  try {
    const now = new Date();
    
    // Trouver les tâches qui:
    // 1. Sont de type 'long'
    // 2. Ont un deadline dépassé
    // 3. Ne sont pas encore complétées
    // 4. N'ont pas encore été notifiées comme étant en retard (nouveau champ à ajouter)
    const lateTasks = await Task.find({
      type: 'long',
      deadline: { $lt: now },
      status: { $nin: ["completed"] },
      lateNotificationSent: { $ne: true } // Nouveau champ pour suivre si la notification a été envoyée
    }).populate('assignedTo', 'name email');

    for (const task of lateTasks) {
      // Mettre à jour le statut de la tâche si ce n'est pas déjà fait
      if (task.status !== 'late') {
        task.status = 'late';
      }
      
      // Marquer que la notification a été envoyée
      task.lateNotificationSent = true;
      await task.save();

      // Notifier les admins/managers
      await notifyManagersAndAdmins({
        message: `La tâche "${task.title}" assignée à ${task.assignedTo?.name || 'un employé'} est en retard`,
        type: 'task_late',
        taskId: task._id,
        userId: task.assignedTo?._id,
        projectId: task.project,
        io
      });

      // Notifier l'employé concerné si la tâche est assignée
      if (task.assignedTo) {
        await sendNotification({
          recipientId: task.assignedTo._id,
          message: `Votre tâche "${task.title}" est en retard`,
          type: 'task_late',
          taskId: task._id,
          io
        });
      }
    }
  } catch (error) {
    console.error('Error checking late tasks:', error);
  }
}



exports.getAllTasks = async (req, res) => {
  try {
  
    const now = new Date();
     const io = req.app.get('io');
     await checkLateTasks(io);
=======

exports.getAllTasks = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/public/`;
    const now = new Date();
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

    // 1. Mettre à jour les tâches en retard
    await Task.bulkWrite([
      {
        updateMany: {
          filter: {
            type: "long",
            deadline: { $lt: now },
            status: { $nin: ["completed", "late"] },
          },
          update: { $set: { status: "late" } },
        },
      },
    ]);

    // 2. Récupérer les tâches avec leurs relations
    const tasks = await Task.find({})
      .populate({
        path: "project",
        select: "_id name company logo priority progression",
      })
      .populate({
        path: "assignedTo",
        select: "_id profilePhoto name position",
      })
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Formatage avec protection contre les valeurs nulles
    const formattedTasks = tasks.map((task) => {
      const project = task.project || {};
      const assignedTo = task.assignedTo || {};

      // chemins images
      const projectLogoPath = project.logo
<<<<<<< HEAD
        ? project.logo
        : null;

      const profilePhotoPath = assignedTo.profilePhoto
        ? assignedTo.profilePhoto
=======
        ? `${baseUrl}/${project.logo}`
        : null;

      const profilePhotoPath = assignedTo.profilePhoto
        ? `${baseUrl}/${assignedTo.profilePhoto}`
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
        : null;

      return {
        ...task,
        project: project._id
          ? {
              _id: project._id,
              name: project.name || "Projet sans nom",
              company: project.company || "Inconnu",
              logo: projectLogoPath,
              priority: project.priority,
              progression: project.progression,
            }
          : null,
        assignedTo: assignedTo._id
          ? {
              _id: assignedTo._id,
              profilePhoto: profilePhotoPath,
              name: assignedTo.name,
              position: assignedTo.position,
            }
          : null,
      };
    });

    res.status(200).json(formattedTasks);
  } catch (err) {
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message,
    });
  }
};

exports.createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
<<<<<<< HEAD
  const io = req.app.get('io');
  const baseUrl= `${req.protocol}://${req.get("host")}/public/`
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

  try {
    const {
      title,
      description,
      type,
      status,
      deadline,
      projectId,
      assignedToId,
      progress,
      intervention,
    } = req.body;
<<<<<<< HEAD
  
    await checkLateTasks(io);
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    // 1. Validation des données
    if (!title || !type || !projectId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Title, type and project are required" });
    }

    if (type === "long" && !deadline) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Deadline is required for long tasks" });
    }

    // 2. Vérification que le projet existe
    const projectExists = await Project.findById(projectId).session(session);
    if (!projectExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // 3. Vérification que l'utilisateur assigné existe (si fourni)
    let assignedUser = null;
    if (assignedToId) {
      assignedUser = await User.findById(assignedToId).session(session);
      if (!assignedUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    // 4. Création de la tâche
    const newTask = new Task({
      title,
      description: description || "",
      type,
      status: status || "pending",
      deadline: type === "long" ? deadline : undefined, //si tu mis tache journaliere avec deadline il va pas se stocker en backend (deadline)
      project: projectId,
      assignedTo: assignedToId || undefined,
      progress: progress || 0,
      intervention: intervention || "on_site",
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    const savedTask = await newTask.save({ session });

<<<<<<< HEAD
 
    // 🔹 Recharger avec populate pour inclure les infos du projet et de l’employé assigné
const populatedTask = await Task.findById(savedTask._id).session(session)
  .populate({
    path: "project",
    select: "_id name company logo priority progression", // tu ajoutes les champs que tu veux
  })
  .populate({
    path: "assignedTo",
    select: "_id profilePhoto name position",
  });
   
 let profilePhoto = null;
if (populatedTask.assignedTo) {
  profilePhoto = populatedTask.assignedTo.profilePhoto
    ?  populatedTask.assignedTo.profilePhoto
    : null;
  populatedTask.assignedTo.profilePhoto = profilePhoto;
}
console.log("populatedTask:", populatedTask); 
    

     io.emit('task_created', populatedTask);
      const sender = await User.findById(req.user._id).select("name");
        if (assignedToId) {
      await sendNotification({
        recipientId: assignedToId,
        senderId: req.user._id,
        projectId: projectId,
        message: `Une nouvelle tâche "${title}" vous a été assignée par ${sender.name}`,
        type: 'task_assigned',
        io
      });
    }
    

=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: savedTask._id,
        title: savedTask.title,
        type: savedTask.type,
        status: savedTask.status,
        projectId: savedTask.project,
        assignedToId: savedTask.assignedTo || null,
        createdBy: savedTask.createdBy,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      message: "Server error while creating task",
      error: err.message,
    });
  }
};
exports.updateTask = async (req, res) => {
<<<<<<< HEAD
  const userId = req.user._id;
  const session = await mongoose.startSession();
  session.startTransaction();
  const io = req.app.get('io');
  const sender = await User.findById(req.user._id).select("name");

  // Fonction utilitaire pour vérifier si on doit notifier un utilisateur
  const shouldNotifyUser = async (userId) => {
    const user = await User.findById(userId).session(session).select('role');
    return !['admin', 'manager'].includes(user.role);
  };
=======
  const session = await mongoose.startSession();
  session.startTransaction();
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      status,
      deadline,
      projectId,
      assignedToId,
      progress,
      intervention,
    } = req.body;

<<<<<<< HEAD
    await checkLateTasks(io);

    const task = await Task.findById(id).populate({
      path: "assignedTo",
      select: "_id name",
    }).populate({
      path: "project",
      select: "_id name",
    }).populate({
      path: "createdBy",
      select: "_id name",
    }).session(session);

=======
    const task = await Task.findById(id).session(session);
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

<<<<<<< HEAD
    // Validations des champs
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (type && !["daily", "long"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task type" });
    }

<<<<<<< HEAD
    if (status && !["pending", "inProgress", "completed", "late"].includes(status)) {
=======
    if (
      status &&
      !["pending", "inProgress", "completed", "late"].includes(status)
    ) {
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task status" });
    }

    if (intervention && !["remote", "on_site"].includes(intervention)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid intervention type" });
    }

    if (progress && (progress < 0 || progress > 100)) {
      await session.abortTransaction();
      session.endSession();
<<<<<<< HEAD
      return res.status(400).json({ message: "Progress must be between 0 and 100" });
=======
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    }

    if (projectId) {
      const projectExists = await Project.findById(projectId).session(session);
      if (!projectExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Project not found" });
      }
    }

    if (assignedToId) {
      const userExists = await User.findById(assignedToId).session(session);
      if (!userExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

<<<<<<< HEAD
    const previousAssignedTo = task.assignedTo;
    const assignmentChanged = assignedToId && !task.assignedTo?.equals(assignedToId);
    const unassigned = !assignedToId && task.assignedTo;

    // Détection des changements pour les notifications
    const changes = [];
    const oldValues = {
      title: task.title,
      description: task.description,
      status: task.status,
      progress: task.progress,
      intervention: task.intervention,
      project: {
        id: task.project._id || null,
        name: task.project.name || "sans projet"
      }
    };

    if (title && title !== task.title) changes.push('titre');
    if (description !== undefined && description !== task.description) changes.push('description');
    if (status && status !== task.status) changes.push('statut');
    if (progress !== undefined && progress !== task.progress) changes.push('progression');
    if (intervention && intervention !== task.intervention) changes.push('type d\'intervention');
    if (projectId && projectId.toString() !== task.project?._id.toString()) changes.push('projet');

    // Mise à jour des champs de la tâche
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (type) task.type = type;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;
<<<<<<< HEAD
    if (projectId) task.project = projectId;
    if (assignedToId) task.assignedTo = assignedToId;
=======
    if (projectId) {
      task.project = projectId;
    }
    if (assignedToId) {
      task.assignedTo = assignedToId; // Permet de désassigner en envoyant null
    }
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (progress !== undefined) task.progress = progress;
    if (intervention) task.intervention = intervention;
    task.updatedAt = new Date();

    if (task.type === "daily") {
      task.deadline = undefined;
    }

<<<<<<< HEAD
    if (task.deadline && new Date() > task.deadline && task.status !== "completed") {
=======
    if (
      task.deadline &&
      new Date() > task.deadline &&
      task.status !== "completed"
    ) {
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      task.status = "late";
    }

    const updatedTask = await task.save({ session });
<<<<<<< HEAD
    await checkLateTasks(io);

    // Récupération de la tâche mise à jour avec toutes les relations
    const populatedTask = await Task.findById(updatedTask._id).session(session)
      .populate({
        path: "project",
        select: "_id name company logo priority progression",
      })
      .populate({
        path: "assignedTo",
        select: "_id profilePhoto name position",
      })
      .populate("createdBy", "_id name email")
      .lean();

    // Formatage de la tâche pour les notifications
    const formattedTask = {
      ...populatedTask,
      project: populatedTask.project ? {
        ...populatedTask.project,
        logo: populatedTask.project.logo ? populatedTask.project.logo : null,
        name: populatedTask.project.name || "Projet sans nom",
        company: populatedTask.project.company || "Inconnu"
      } : null,
      assignedTo: populatedTask.assignedTo ? {
        ...populatedTask.assignedTo,
        profilePhoto: populatedTask.assignedTo.profilePhoto ? populatedTask.assignedTo.profilePhoto : null,
        name: populatedTask.assignedTo.name || "Non assigné"
      } : null
    };

    // Notifications pour les tâches longues
    if (task.type === 'long' && changes.length > 0) {
      const updater = await User.findById(userId).session(session);
      
      // Ne notifier les managers/admins que si la modification ne vient pas d'un admin/manager
      if (!['admin', 'manager'].includes(req.user.role)) {
        await notifyManagersAndAdmins2({
          message: `La tâche longue "${populatedTask.title}" (projet: ${populatedTask.project.name || 'sans projet'}) a été modifiée par ${updater.name}. Modifications: ${changes.join(', ').replace(/, ([^,]*)$/, ' et $1')}.`,
          type: 'long_task_updated',
          taskId: task._id,
          userId: userId,
          assignedTo: populatedTask.assignedTo?._id,
          projectId: populatedTask.project?._id,
          changes: changes,
          oldValues: oldValues,
          newValues: {
            title: populatedTask.title,
            description: populatedTask.description,
            status: populatedTask.status,
            progress: populatedTask.progress,
            intervention: populatedTask.intervention,
            project: {
              id: populatedTask.project._id || null,
              name: populatedTask.project.name || "sans projet"
            }
          },
          io
        });
      }

      // Notification à l'assigné si différent du modificateur et n'est pas admin/manager
      if (populatedTask.assignedTo && !populatedTask.assignedTo._id.equals(userId)) {
        if (await shouldNotifyUser(populatedTask.assignedTo._id)) {
          await sendNotification2({
            recipientId: populatedTask.assignedTo._id,
            message: `Votre tâche "${populatedTask.title}" longue a été modifiée par ${updater.name} (${changes.join(', ').replace(/, ([^,]*)$/, ' et $1')})`,
            type: 'long_task_updated',
            taskId: populatedTask._id,
            projectId: populatedTask.project?._id,
            io,
            changes: changes,
            oldValues: oldValues,
            newValues: {
              title: populatedTask.title,
              description: populatedTask.description,
              status: populatedTask.status,
              progress: populatedTask.progress,
              intervention: populatedTask.intervention,
              project: {
                name: populatedTask.project.name,
                id: populatedTask.project._id
              }
            }
          });
        }
      }
    }

    // Notification si tâche marquée comme complète
    if (status === 'completed' && populatedTask.type === 'long') {
      await notifyManagersAndAdmins({
        senderId: req.user._id,
        message: `La tâche longue "${populatedTask.title}" a été complétée par ${req.user.name}`,
        type: 'task_completed',
        projectId: populatedTask.project._id,
        io
      });
    }

    // Notification pour les tâches daily
    if (populatedTask.assignedTo && !populatedTask.assignedTo._id.equals(req.user._id) && task.status === "daily") {
      if (await shouldNotifyUser(populatedTask.assignedTo._id)) {
        await sendNotification({
          recipientId: populatedTask.assignedTo._id,
          senderId: req.user._id,
          projectId: populatedTask.project._id,
          message: `La tâche "${populatedTask.title}" journalière a été mise à jour par "${sender.name}"`,
          type: 'task_updated',
          io
        });
      }
    }

    // Gestion des changements d'assignation
    if (assignedToId) {
      if (assignmentChanged) {
        // Notifier l'ancien assigné (si différent du modificateur et n'est pas admin/manager)
        if (previousAssignedTo && !previousAssignedTo.equals(req.user._id)) {
          if (await shouldNotifyUser(previousAssignedTo)) {
            await sendNotification({
              recipientId: previousAssignedTo,
              senderId: req.user._id,
              projectId: populatedTask.project._id,
              message: `Vous avez été désassigné de la tâche "${populatedTask.title}" de la part de "${sender.name}"`,
              type: 'task_unassigned',
              io
            });
          }
          io.to(`user_${previousAssignedTo}`).emit("desassigner_tache", formattedTask);
        }

        // Notifier le nouvel assigné (s'il n'est pas admin/manager)
        if (await shouldNotifyUser(assignedToId)) {
          await sendNotification({
            recipientId: assignedToId,
            senderId: req.user._id,
            projectId: populatedTask.project._id,
            message: `La tâche "${populatedTask.title}" vous a été assignée de la part de "${sender.name}"`,
            type: 'task_assigned',
            io
          });
        }
        io.to(`user_${assignedToId}`).emit("assigner_tache", formattedTask);
      }
    } else if (unassigned && !previousAssignedTo.equals(req.user._id)) {
      if (await shouldNotifyUser(previousAssignedTo)) {
        await sendNotification({
          recipientId: previousAssignedTo,
          senderId: req.user._id,
          projectId: populatedTask.project._id,
          message: `Vous avez été désassigné de la tâche "${populatedTask.title}" de la part de "${sender.name}"`,
          type: 'task_unassigned',
          io
        });
      }
      io.to(`user_${previousAssignedTo}`).emit("desassigner_tache", formattedTask);
    }

    // Émission de l'événement de mise à jour
    io.emit('task_updated', formattedTask);
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        type: updatedTask.type,
        status: updatedTask.status,
        deadline: updatedTask.deadline,
        projectId: updatedTask.project,
        assignedToId: updatedTask.assignedTo,
        progress: updatedTask.progress,
        intervention: updatedTask.intervention,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: "Server error while updating task",
      error: err.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
<<<<<<< HEAD
    const io = req.app.get('io');
   
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  try {
    const { id } = req.params;

    // 1. Vérifier que la tâche existe et récupérer le projet associé
<<<<<<< HEAD
    const task = await Task.findById(id).populate('assignedTo', 'name')
      .populate('project', 'name').session(session);
=======
    const task = await Task.findById(id).session(session);
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
<<<<<<< HEAD
     const projectId = task.project;
    
    await checkLateTasks(io);

   
     
     // Notifier l'assigné (si existant)
    if (task.assignedTo) {
      await sendNotification({
        recipientId: task.assignedTo,
        senderId: req.user._id,
        projectId: task.project,
        message: `La tâche "${task.title}" a été supprimée par "${req.user.name}"`,
        type: 'task_deleted',
        io
      });
    }

      if (task.type === 'long') {
          await notifyManagersAndAdmins({
            message: `La tâche longue "${task.title}" (projet: ${task.project?.name || 'sans projet'}) a été supprimée par ${req.user.name}`,
            type: 'long_task_deleted',
            userId: userId,
            projectId: task.project?._id,
            io
          });
        }
      

    // 2. Supprimer la tâche
    await Task.deleteOne({ _id: id }).session(session);
    
     io.emit('task_deleted', id);
=======

    const projectId = task.project;

    // 2. Supprimer la tâche
    await Task.deleteOne({ _id: id }).session(session);

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    // 3. Mettre à jour la progression du projet
    const project = await Project.findById(projectId).session(session);
    if (project) {
      // Récupérer toutes les tâches restantes du projet
      const remainingTasks = await Task.find({ project: projectId }).session(
        session
      );

      if (remainingTasks.length > 0) {
        // Calculer la nouvelle progression
        const completedCount = remainingTasks.filter(
          (t) => t.status === "completed"
        ).length;
        project.progression = Math.round(
          (completedCount / remainingTasks.length) * 100
        );

        // Mettre à jour le statut du projet si nécessaire
        if (project.progression === 100) {
          project.status = "completed";
        } else if (project.status === "completed") {
          project.status = "active";
        }
      } else {
        // Si plus de tâches, réinitialiser la progression
        project.progression = 0;
        project.status = "active";
      }

      await project.save({ session });
    }

    // 4. Valider la transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Tâche supprimée avec succès",
      affectedProject: projectId,
      newProgression: project?.progression || 0,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "CastError") {
      return res.status(400).json({ message: "ID de tâche invalide" });
    }

    res.status(500).json({
      message: "Erreur lors de la suppression de la tâche",
      error: err.message,
    });
  }
};
