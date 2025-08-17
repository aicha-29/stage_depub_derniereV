const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
<<<<<<< HEAD
const authMiddleware = require("../middlewares/auth.middleware");
router.post("/login", authController.login);

// Dans vos routes d'authentification
router.get('/verify-token', authMiddleware, (req, res) => {
  res.json({ valid: true });
});
=======

router.post("/login", authController.login);

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
module.exports = router;
