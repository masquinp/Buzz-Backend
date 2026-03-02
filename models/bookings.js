const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  message: String,
  status : String,
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "rides" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
