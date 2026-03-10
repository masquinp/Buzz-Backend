const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    amount: Number,
    status: String, // "pending", "accepted", "rejected"
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "bookings" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true },
); // ajoute automatiquement createdAt et updatedAt

const Payment = mongoose.model("payments", paymentSchema);

module.exports = Payment;
