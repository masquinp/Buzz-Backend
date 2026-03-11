const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  note: String,
  message: String,
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // on récupère l'id de la personne qui poste l'avis
  reviewed: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // on récupère l'id de la personne qui reçoit l'avis (le chauffeur du trajet)
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "rides" }, 
});

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
