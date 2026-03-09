const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  price: Number,
  placesTotal: Number,

  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Ride = mongoose.model("rides", rideSchema);

module.exports = Ride;
