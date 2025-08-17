const Task = require("../../models/task");
const Project = require("../../models/project");
const User =require("../../models/user");
const mongoose = require("mongoose");
const DailyValidation = require("../../models/dailyValidation.model");
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


exports.getEmployeTask = async (req, res) => {
  try {
   
     const io=req.app.get('io');
    await checkLateTasks(io);
    const employeId = req.user._id;
    const tasks = await Task.find({ assignedTo: employeId })
      .populate({
        path: "project",
        select: "name company logo priority progression",
      })
      .populate("assignedTo", "name email profilePhoto")
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Erreur lors de la récupération des taches ", error);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.createDailyTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
   const io = req.app.get('io');

  try {
    const {
      title,
      description,

      status,

      projectId,
      assignedToId,
      progress,
      intervention,
    } = req.body;

    // 1. Validation des données
    if (!title || !projectId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Title and project are required" });
    }

    // 2. Vérification que le projet existe
    const projectExists = await Project.findById(projectId).session(session);
    if (!projectExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // 4. Création de la tâche
    const newTask = new Task({
      title,
      description: description || "",
      type: "daily",
      status: status || "pending",
      project: projectId,
      assignedTo: req.user._id,
      progress: progress || 0,
      intervention: intervention || "on_site",
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    const savedTask = await newTask.save({ session });
 
  const populatedTask = await Task.findById(savedTask._id).session(session)
    .populate({
      path: "project",
      select: "_id name company logo priority progression", // tu ajoutes les champs que tu veux
    })
    .populate({
      path: "assignedTo",
      select: "_id name profilePhoto position",
    });
       
      
     
      await checkLateTasks(io);
       
      io.emit('task_created', populatedTask);
   
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
        assignedToId: savedTask.assignedTo,
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


exports.deleteEmployeTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const io = req.app.get('io');

  try {
    const taskId = req.params.taskId;
    const userId = req.user._id;

    // 1. Vérifier que la tâche existe et récupérer le projet associé
    const task = await Task.findById(taskId)
    .populate('assignedTo', 'name')
      .populate('project', 'name').session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Vous n'avez pas le droit de supprimer cette tâche" });
    }
       // 2. Notifier si c'est une tâche longue
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
    await Task.deleteOne({ _id: taskId }).session(session);
     io.emit('task_deleted', taskId);

    const projectId = task.project;
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
    // Vérifier si toutes les tâches quotidiennes sont complétées après suppression
      await checkLateTasks(io);
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
exports.updateEmployeTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user._id;
  const session = await mongoose.startSession();
  session.startTransaction();
  const io = req.app.get('io');

  try {
    const {
      title,
      description,
      type,
      status,
      deadline,
      projectId,
      createdById,
      progress,
      intervention,
    } = req.body;

    const task = await Task.findById(taskId)
       .populate('assignedTo', 'name')
       .populate('project', '_id name')
       .populate('createdBy', 'name')
       .session(session);

    





    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    if (type && !["daily", "long"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task type" });
    }

    if (
      status &&
      !["pending", "inProgress", "completed", "late"].includes(status)
    ) {
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
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
    }

    if (projectId) {
      const projectExists = await Project.findById(projectId).session(session);
      if (!projectExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Project not found" });
      }
    }

    if (createdById) {
      const userExists = await User.findById(createdById).session(session);
      if (!userExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "utilisateur non trouvé" });
      }
    }

         // Détecter les changements pour les notifications
        const changes = [];
        const oldValues = {
          title: task.title,
          description: task.description,
          status: task.status,
          progress: task.progress,
          intervention: task.intervention,
          project:{
            name:task.project.name,
            id:task.project._id
          }
        };
         // Vérification des modifications
    if (title && title !== task.title) changes.push('titre');
    if (description !== undefined && description !== task.description) changes.push('description');
    if (status && status !== task.status) changes.push('statut');
    if (progress !== undefined && progress !== task.progress) changes.push('progression');
    if (intervention && intervention !== task.intervention) changes.push('type d\'intervention');
    if (projectId && projectId.toString() !== task.project?._id.toString()) changes.push('projet'); 

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (type) task.type = type;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;
    if (projectId) {
      task.project = projectId;
    }
    if (createdById) {
      task.createdBy = createdById;
    }
    if (progress !== undefined) task.progress = progress;
    if (intervention) task.intervention = intervention;
    task.updatedAt = new Date();

    if (task.type === "daily") {
      task.deadline = undefined;
    }

    if (
      task.deadline &&
      new Date() > task.deadline &&
      task.status !== "completed"
    ) {
      task.status = "late";
    }

    const updatedTask = await task.save({ session });
    const populatedTask1 = await Task.findById(updatedTask._id).session(session)
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
    
    await checkLateTasks(io);
          // Notifications seulement si c'est une tâche longue et qu'il y a des changements
    if (task.type === 'long' && changes.length > 0) {
      const updater = await User.findById(userId).session(session);
      
      // Message détaillant les modifications
      const changesMessage = changes.join(', ').replace(/, ([^,]*)$/, ' et $1');
      const baseMessage = `La tâche longue "${task.title}" (projet: ${populatedTask1.project?.name || 'sans projet'}) a été modifiée par ${updater.name}`;
      const detailedMessage = `${baseMessage}. Modifications: ${changesMessage}.`;
       // Notification aux managers et admins
      await notifyManagersAndAdmins2({
        message: detailedMessage,
        type: 'long_task_updated',
        taskId: populatedTask1._id,
        userId: req.user._id,
        projectId: populatedTask1.project?._id,
        changes: changes,
        oldValues: oldValues,
        newValues: {
          title: populatedTask1.title,
          description: populatedTask1.description,
          status: populatedTask1.status,
          progress: populatedTask1.progress,
          intervention: populatedTask1.intervention,
          project:{
            id:populatedTask1.project._id,
            name:populatedTask1.project.name
          }
        },
        io
      });
         // Notification à l'assigné si ce n'est pas lui qui a fait la modification
      if (populatedTask1.assignedTo && !populatedTask1.assignedTo._id.equals(userId) ) {
        await sendNotification2({
          recipientId: task.assignedTo._id,
          message: `Votre tâche "${task.title}" a été modifiée par ${updater.name} (${changesMessage})`,
          type: 'task_updated',
          taskId: task._id,
          projectId: task.project?._id,
          io,
          oldValues: oldValues,
              newValues: {
                title: task.title,
                description: task.description,
                status:task.status,
                progress:task.progress,
                intervention: task.intervention,
                project:{
                  id:task.project._id,
                  name:task.project.name}
              }
        });
      }
    }






      // Notifier si la tâche est marquée comme complète
    if (status === 'completed') {
      if (task.type === 'long') {
        await notifyManagersAndAdmins({
          message: `La tâche longue "${task.title}" a été complétée par ${req.user.name}`,
          type: 'task_completed',
          projectId: task.project,
          userId:userId,
          io
        });
      }
       
    }

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

  // Formater les URLs des images
  const baseUrl = `${req.protocol}://${req.get("host")}/public`;
  const formattedTask = {
    ...populatedTask,
    project: populatedTask.project ? {
      ...populatedTask.project,
      logo: populatedTask.project.logo ? populatedTask.project.logo: null,
      name: populatedTask.project.name || "Projet sans nom",
      company: populatedTask.project.company || "Inconnu"
    } : null,
    assignedTo: populatedTask.assignedTo ? {
      ...populatedTask.assignedTo,
      profilePhoto: populatedTask.assignedTo.profilePhoto ? populatedTask.assignedTo.profilePhoto : null,
      name: populatedTask.assignedTo.name || "Non assigné"
    } : null
  };
  
  await checkLateTasks(io);
   io.emit('task_updated', formattedTask);
  // Émettre l'événement avec la tâche complètement formatée
 
  // Vérifier si toutes les tâches quotidiennes sont complétées
  





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
        createdById: updatedTask.createdBy,
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

exports.toggleFavorites = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    // Vérifie que l'utilisateur est bien le créateur de la tâche
    if (!task.assignedTo.equals(userId)) {
      return res.status(403).json({
        message: "Seul les employees assignees a la tâche peut effectuer cette action",
      });
    }

    task.isFavorite = !task.isFavorite;
    await task.save();

    res.status(200).json({
       isFavorite: task.isFavorite, 
      message: task.isFavorite
        ? "Tâche favorisée avec succès"
        : "Tâche retirée des favoris avec succès",
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getFavoriteTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      assignedTo: userId,
      isFavorite: true,
    })
      .populate("project", "_id name progression status logo priority company")
      .populate("assignedTo", "_id name position profilePhoto")
      .populate("createdBy", "_id name email");

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.validateDay = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const io = req.app.get('io');
  const userId = req.user._id;

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Vérifier si l'utilisateur a déjà validé cette journée
    const existingValidation = await DailyValidation.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).session(session);

    if (existingValidation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Vous avez déjà validé cette journée" });
    }

    // Récupérer toutes les tâches quotidiennes de l'utilisateur pour aujourd'hui
    const dailyTasks = await Task.find({
      assignedTo: userId,
      type: 'daily',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).session(session);

    const allCompleted = dailyTasks.length > 0 && 
      dailyTasks.every(task => task.status === 'completed');

    // Enregistrer la validation
    const validation = new DailyValidation({
      userId,
      date: now,
      allTasksCompleted:allCompleted
    });

    await validation.save({ session });

    // Notifier en fonction du statut des tâches
    const user = await User.findById(userId).session(session);
    
    if (allCompleted) {
      await notifyManagersAndAdmins({
        message: `${user.name} a validé sa journée avec toutes les tâches complétées (${now.toLocaleDateString()})`,
        type: 'day_validated',
        userId: userId,
        status: 'completed',
        io
      });
    } else if (dailyTasks.length > 0  && !allCompleted) {
      const incompleteCount = dailyTasks.filter(t => t.status !== 'completed').length;
      await notifyManagersAndAdmins({
        message: `${user.name} a validé sa journée mais n'a pas complété ${incompleteCount} tâche(s) sur ${dailyTasks.length}`,
        type: 'day_validated',
        userId: userId,
        status: 'incomplete',
        io
      });
    }
    else{
        await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Vous n'avez aucune  tache a valider pour cette journée" });

    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      allCompleted,
      message: allCompleted 
        ? "Journée validée avec succès - Toutes les tâches sont complétées" 
        : "Journée validée - Certaines tâches ne sont pas complétées"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error validating day:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.cancelDayValidation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const io = req.app.get('io');
  const userId = req.user._id;

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Supprimer la validation existante
    const result = await DailyValidation.deleteOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).session(session);

    if (result.deletedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Aucune validation trouvée pour aujourd'hui" });
    }

    // Notifier les administrateurs
    const user = await User.findById(userId).session(session);
    await notifyManagersAndAdmins({
      message: `${user.name} a annulé sa validation de journée (${now.toLocaleDateString()})`,
      type: 'day_validation_cancelled',
      userId: null,
      io
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Validation de journée annulée avec succès"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling day validation:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

