const mongoose = require("mongoose");

const dailyValidationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  allTasksCompleted: {
    type: Boolean,
    required: true
  },
  validatedAt: {
    type: Date,
    default: Date.now
  }
});

// Empêcher les validations multiples pour le même jour par le même utilisateur
dailyValidationSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyValidation", dailyValidationSchema);