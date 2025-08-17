const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
<<<<<<< HEAD
        enum: [
      'project_created', 
      'project_updated', 
      'project_deleted', 
      'task_assigned',
      'task_unassigned',
      'task_updated',
      'task_completed',
      'task_deleted',
      'project_unassigned',
      'project_assigned',
      'profile_updated',
      'account_created',
      'new_employee',
      'employee_update',
      'employee_deleted',
      'task_late',
      'day_validated',
      'day_validation_cancelled',
      'long_task_deleted',
      'long_task_updated'
    ],
=======
    enum: ['project_created', 'project_updated', 'project_deleted', 'task_assigned',"profile_updated","account_created","new_employee","employee_update","employee_deleted","project_unassigned","project_assigned"],
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
<<<<<<< HEAD
// Index pour améliorer les performances des requêtes
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
module.exports = mongoose.model('Notification', NotificationSchema);