const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    amount: Number,
    status: String, // "pending", "accepted", "rejected"
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "bookings" }, // pour savoir à quelle réservation ce paiement est associé
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // pour savoir qui a effectué le paiement
  },
  { timestamps: true },
); // ajoute automatiquement createdAt et updatedAt

const Payment = mongoose.model("payments", paymentSchema);

module.exports = Payment;
