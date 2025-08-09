const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const Notification = require('../models/notification');

// Récupérer les notifications de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('project', 'name');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer une notification comme lue
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    // Émettre l'événement
    req.app.get('io').to(`user_${req.user._id}`).emit('notification_updated', {
      action: 'mark_as_read',
      notificationId: notification._id
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer toutes les notifications comme lues
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

     // Émettre l'événement
    req.app.get('io').to(`user_${req.user._id}`).emit('notification_updated', {
      action: 'mark_all_read',
      userId: req.user._id
    });

    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.get('/employee', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      $or: [
        { type: 'account_created' },
        { type: 'profile_updated' },
        { type: 'employee_deleted' }
      ]
    })
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Supprimer une notification spécifique
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ msg: 'Notification non trouvée' });
    }


        // Émettre l'événement
    req.app.get('io').to(`user_${req.user._id}`).emit('notification_updated', {
      action: 'delete',
      notificationId: req.params.id
    });


    res.json({ msg: 'Notification supprimée' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification non trouvée' });
    }
    res.status(500).send('Erreur serveur');
  }
});

// Supprimer plusieurs notifications sélectionnées
router.delete("/delete/delete-multiple", authMiddleware, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ msg: 'Liste des IDs de notifications invalide' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
       recipient: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Aucune notification trouvée à supprimer' });
    }
    req.app.get('io').to(`user_${req.user._id}`).emit('notification_updated', {
      action: 'delete_multiple',
      notificationIds: notificationIds
    });


    

    res.json({ msg: `${result.deletedCount} notification(s) supprimée(s)` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});




module.exports = router;