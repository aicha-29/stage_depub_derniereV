
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const messageController = require("../controllers/message.controller");



// Envoyer un message
router.post("/", authMiddleware, messageController.sendMessage);

router.put("/mark-single-read/:messageId", authMiddleware, messageController.markSingleAsRead);

router.get("/users",authMiddleware, messageController.getAllUsers);
// Récupérer la conversation avec un utilisateur
router.get("/conversation/:userId", authMiddleware , messageController.getConversation);

// Récupérer la liste des conversations
router.get("/conversations", authMiddleware , messageController.getConversations);

// Marquer les messages comme lus
router.put("/mark-as-read/:senderId", authMiddleware , messageController.markAsRead);

// Recherche d'utilisateurs pour la messagerie
router.get("/search-users", authMiddleware ,messageController.searchUsers);

router.delete('/conversation/:userId', authMiddleware, messageController.deleteConversation);

module.exports = router;