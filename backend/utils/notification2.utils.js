const Notification = require('../models/notification');
const User = require('../models/user');

// Fonction pour envoyer des notifications
async function sendNotification2({
  recipientId,
  senderId = null,
  projectId = null,
  message,
  type,
  io,
  oldValues = {},
  newValues = {},
  changes=[]
}) {
  try {
     let finalMessage = message;
      if (changes.length > 0) {
     if (type === 'long_task_updated') {
        if (oldValues.status && newValues.status && newValues.status !== oldValues.status) {
          finalMessage += `\n- Statut : ${oldValues.status} → ${newValues.status}`;
        }
        
        // Pour la progression
        if (oldValues.progress !== undefined && newValues.progress !== undefined && 
            newValues.progress !== oldValues.progress) {
          finalMessage += `\n- Progression : ${oldValues.progress}% → ${newValues.progress}%`;
        }
        // Pour le projet - PARTIE CORRIGÉE
        if (oldValues.project && newValues.project && newValues.project?.id.toString() !=  oldValues.project?.id.toString() ) {
          finalMessage += `\n- Projet : "${oldValues.project.name}" → "${newValues.project.name}"`;
        }
          }
        }
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      project: projectId, // Ajout du champ taskId si nécessaire
      message:finalMessage,
      type
    });

    const savedNotification = await notification.save();
    
    // Envoyer la notification en temps réel via Socket.IO avec toutes les données
    const recipientSocketRoom = `user_${recipientId}`;
    io.to(recipientSocketRoom).emit('new_notification', {
      ...savedNotification.toObject(),
      _id: savedNotification._id,
      createdAt: savedNotification.createdAt
    });

    return savedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

async function notifyManagersAndAdmins2({ 
  message, 
  type,  
  assignedTo=null,
  projectId = null, 
  userId = null,
  taskId = null,
  changes = [],
  oldValues = {},
  newValues = {},
  io 
}) {
  try {
    // 1. Trouver les managers et admins concernés
    const recipients = await User.find({
      role: { $in: ["admin", "manager"] },
      ...(userId ? { _id: { $ne: userId } } : {}) // Exclure l'utilisateur actuel si userId est fourni
    }).select('_id name email');

const isIdAbsent = !recipients.some(user => user._id.equals(assignedTo)); 

    if (recipients.length === 0) {
      console.log('Aucun admin/manager à notifier');
      return [];
    }
    console.log(recipients);
if(isIdAbsent)
    // 2. Créer les notifications
   { const notifications = await Promise.all(
      recipients.map(async user => {
        // Construire le message détaillé si des changements sont spécifiés
        let finalMessage = message;
        if (changes.length > 0) {
          const changesText = changes.join(', ').replace(/, ([^,]*)$/, ' et $1');
          finalMessage = message;
          
          // Vous pouvez ajouter plus de détails si nécessaire
          if (type === 'long_task_updated') {
            if (oldValues.status && newValues.status &&newValues.status !=oldValues.status) {
              finalMessage += ` Statut changé de "${oldValues.status}" à "${newValues.status}".`;
            }
            if (oldValues.progress && newValues.progress && newValues.progress !== oldValues.progress) {
              finalMessage += ` Progression passée de ${oldValues.progress}% à ${newValues.progress}%.`;
            }
            if(oldValues.project && newValues.project && newValues.project?.id.toString() !=oldValues.project?.id.toString()){
              finalMessage += ` projet passée de ${oldValues.project.name}  à ${newValues.project.name}.`;
            }
          }
        }

        const notification = await Notification.create({
          recipient: user._id,
          message: finalMessage,
          type,
          project: projectId,
          read: false
        });

        // 3. Envoyer chaque notification en temps réel
        const userRoom = `user_${user._id}`;
        io.to(userRoom).emit('new_notification', {
          ...notification.toObject(),
          _id: notification._id,
          createdAt: notification.createdAt
        });

        return notification;
      })
    );

    console.log(`Notifié ${recipients.length} admin(s)/manager(s)`);
    return notifications;}

  } catch (error) {
    console.error('Erreur notification managers/admins:', error);
    throw error;
  }
}

module.exports = {
  sendNotification2,
  notifyManagersAndAdmins2
};