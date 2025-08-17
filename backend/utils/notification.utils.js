const Notification = require('../models/notification');
const User = require('../models/user');

// Fonction pour envoyer des notifications
async function sendNotification({
  recipientId,
  senderId = null,
  projectId = null,
  message,
  type,
  io
}) {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      project: projectId,
      message,
      type
    });

    const savedNotification = await notification.save();
    
    // Envoyer la notification en temps réel via Socket.IO avec toutes les données
    const recipientSocketRoom = `user_${recipientId}`;
    io.to(recipientSocketRoom).emit('new_notification', {
      ...savedNotification.toObject(), // Inclut toutes les propriétés
      _id: savedNotification._id,     // ID explicite
      createdAt: savedNotification.createdAt // Date de création
    });

    return savedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

async function notifyManagersAndAdmins({ 
  message, 
  type,  
  projectId = null, 
  userId, 
  io 
}) {
  try {
    // 1. Trouver les managers et admins concernés
    const recipients = await User.find({
      role: { $in: ['admin', 'manager'] },
      _id: { $ne: userId } // Exclure l'utilisateur actuel
    }).select('_id name email');

    if (recipients.length === 0) {
      console.log('Aucun admin/manager à notifier');
      return [];
    }

    // 2. Créer les notifications
    const notifications = await Promise.all(
      recipients.map(async user => {
        const notification = await Notification.create({
          recipient: user._id,
          message,
          type,
          project: projectId,
          read: false
        });

        // 3. Envoyer chaque notification en temps réel avec toutes les données
        const userRoom = `user_${user._id}`;
        io.to(userRoom).emit('new_notification', {
          ...notification.toObject(), // Toutes les propriétés
          _id: notification._id,     // ID explicite
          createdAt: notification.createdAt // Date de création
        });

        return notification;
      })
    );

    console.log(`Notifié ${recipients.length} admin(s)/manager(s)`);
    return notifications;

  } catch (error) {
    console.error('Erreur notification managers/admins:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  notifyManagersAndAdmins
};