const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  message: String,
  status: String, // "pending", "accepted", "rejected"
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "rides" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
}, { timestamps: true }); // ajoute automatiquement createdAt et updatedAt

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
