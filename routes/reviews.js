const express = require("express");
const router = express.Router();
const Review = require("../models/reviews");
const Ride = require("../models/rides");
const User = require("../models/users");

router.post("/add", async (req, res) => {
  const user = await User.findOne({ token: req.body.token });
  if (!user)
    return res.json({ result: false, error: "Utilisateur non trouvé" });

  // On récupère le trajet pour avoir l'id du chauffeur
  const ride = await Ride.findOne({ _id: req.body.ride });
  if (!ride) return res.json({ result: false, error: "Trajet non trouvé" });

  const newReview = new Review({
    note: req.body.note,
    message: req.body.message,
    ride: req.body.ride,
    reviewer: user._id, // celui qui poste l'avis
    reviewed: ride.user, // le chauffeur qui reçoit l'avis
  });

  const review = await newReview.save();
  res.json({ result: true, review });
});

router.get("/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token });
  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }

  // Les reviews que cet utilisateur a reçues
  const reviews = await Review.find({ reviewed: user._id })
    .populate("ride")
    .populate("reviewer", "username firstname lastname avatar")
    .populate("reviewed", "username firstname lastname avatar");

  res.json({ result: true, reviews });
});

router.delete("/delete/:reviewId", async (req, res) => {
  const user = await User.findOne({ token: req.body.token });
  if (!user)
    return res.json({ result: false, error: "Utilisateur non trouvé" });

  // On vérifie que la review appartient bien à cet utilisateur
  const review = await Review.findOne({
    _id: req.params.reviewId,
    reviewer: user._id,
  });
  if (!review)
    return res.json({
      result: false,
      error: "Review non trouvée",
    });

  await Review.deleteOne({ _id: req.params.reviewId });
  res.json({ result: true, message: "Review supprimée" });
});

module.exports = router;
