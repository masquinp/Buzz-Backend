const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  message: String,
  seatsBooked: Number, // nombre de places réservées
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }, // statut de la réservation
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "rides" }, // référence au trajet associée
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // référence à l'utilisateur qui a fait la réservation
}, { timestamps: true }); // ajoute automatiquement createdAt et updatedAt

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
