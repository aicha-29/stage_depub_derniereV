// controllers/message.controller.js
const Message = require("../models/message.model");
const User = require("../models/user");




exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    // Créer le message
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    // Populer les détails de l'expéditeur et du destinataire
    await message.populate([
      { path: 'sender', select: 'name role position profilePhoto' },
      { path: 'recipient', select: 'name role position profilePhoto' }
    ]);

    // Envoyer le message via Socket.IO
    const io = req.app.get("io");
    
    // Envoyer au destinataire
    io.to(`user_${recipientId}`).emit("newMessage", message);
    
    // Envoyer à l'expéditeur
    io.to(`user_${req.user._id}`).emit("newMessage", message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// exports.getConversation = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       $or: [
//         { sender: req.user._id, recipient: req.params.userId },
//         { sender: req.params.userId, recipient: req.user._id }
//       ]
//     })
//     .sort("createdAt")
//     .populate("sender", "name role position profilePhoto");

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// Dans message.controller.js
exports.getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
    .sort("createdAt")
    .populate("sender", "name role position profilePhoto")
    .populate("recipient", "name role position profilePhoto"); // Peuplez le destinataire aussi

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ["$sender", req.user._id] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: "$$ROOT"
        }
      },
      // Ajout d'un match pour exclure l'utilisateur courant
      {
        $match: {
          otherUser: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $last: "$lastMessage" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$lastMessage.recipient", req.user._id] },
                  { $eq: ["$lastMessage.read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          "user._id": 1,
          "user.name": 1,
          "user.role": 1,
          "user.position": 1,
          "user.profilePhoto": 1,
          lastMessage: 1,
          unreadCount: 1
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        recipient: req.user._id,
        read: false
      },
      { $set: { read: true } }
    );

    // Récupérer les messages mis à jour pour les renvoyer via socket
    const updatedMessages = await Message.find({
      sender: req.params.senderId,
      recipient: req.user._id
    }).populate('sender', 'name role position profilePhoto');

    // Émettre l'événement socket
    const io = req.app.get("io");
    io.to(`user_${req.user._id}`).emit('messagesMarkedAsRead', {
      senderId: req.params.senderId,
      messages: updatedMessages
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.markSingleAsRead = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $set: { read: true } },
      { new: true }
    ).populate([
      { path: 'sender', select: 'name role position profilePhoto' },
      { path: 'recipient', select: 'name role position profilePhoto' }
    ]);

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Notifier via Socket.IO
    const io = req.app.get("io");
    io.to(`user_${req.user._id}`).emit('messageRead', updatedMessage);
    io.to(`user_${updatedMessage.sender._id}`).emit('messageRead', updatedMessage);

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { position: { $regex: query, $options: "i" } },
        { role: { $regex: query, $options: "i" } }
      ]
    }).select("name role position profilePhoto");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    }).select("name role position profilePhoto");
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Supprimer tous les messages entre les deux utilisateurs
    await Message.deleteMany({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    });

    // Émettre un événement socket pour informer les clients
    const io = req.app.get("io");
    io.to(`user_${req.user._id}`).emit('conversationDeleted', { userId });
    io.to(`user_${userId}`).emit('conversationDeleted', { userId: req.user._id });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
