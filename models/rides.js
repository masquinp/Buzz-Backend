const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  price: String,   //price en String c'est pas pratique pour calculer

  placesTotal: { type: Number, required: true, min: 1 },
  placesLeft: { type: Number, required: true, min: 0 },   //places en Number (au lieu de String)

  // coût total estimé du trajet quand la personne reserve (centimes)
    totalCost: { type: Number, required: true, min: 1 },

   status: {
      type: String,
      enum: ["open", "started", "completed", "cancelled"],
      default: "open",
      index: true,
    },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "drivers" },
},
{ timestamps: true }
);


const Ride = mongoose.model("rides", rideSchema);

module.exports = Ride;