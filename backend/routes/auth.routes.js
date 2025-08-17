const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
router.post("/login", authController.login);

// Dans vos routes d'authentification
router.get('/verify-token', authMiddleware, (req, res) => {
  res.json({ valid: true });
});
module.exports = router;
