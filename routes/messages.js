const express = require("express");
const router = express.Router();
const Message = require("../models/messages");
const User = require("../models/users");

router.post("/add", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    const newMessage = new Message({
      username: user.username,
      message: req.body.message,
      booking: req.body.booking,
      user: user._id,
    });

    newMessage.save().then((savedMessage) => {
      // On populate l'user pour renvoyer ses infos au frontend
      savedMessage
        .populate("user", "username firstname lastname")
        .then((populatedMessage) => {
          res.json({ result: true, message: populatedMessage });
        });
    });
  });
});

// Récupérer les messages d'un trajet
router.get("/:bookingId", (req, res) => {
  // Si bookingId est undefined ou manquant, on arrête
  if (!req.params.bookingId || req.params.bookingId === "undefined") {
    return res.json({ result: false, error: "bookingId manquant" });
  }
  Message.find({ booking: req.params.bookingId })
    .populate("user", "username firstname lastname")
    .sort({ createdAt: 1 }) // On trie du plus ancien au plus récent pour afficher dans le bon ordre
    .then((messages) => {
      res.json({ result: true, messages });
    });
});

router.get("/conversations/:token", (req, res) => {
  // On récupère l'utilisateur via son token
  User.findOne({ token: req.params.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    // On cherche tous les messages où l'utilisateur est impliqué
    Message.find({ user: user._id })
      .populate("user", "username firstname lastname")
      .populate("booking")
      .sort({ createdAt: -1 }) // du plus récent au plus ancien
      .then((messages) => {
        res.json({ result: true, messages });
      });
  });
});

module.exports = router;
