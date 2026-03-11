const express = require("express");
const router = express.Router();
const Ride = require("../models/rides");
const User = require("../models/users"); 
const Booking = require("../models/bookings");

router.post("/add", (req, res) => {
  const { departure, arrival, date, price, placesTotal, user } = req.body;

  if (!departure || !arrival || !date || !price || !placesTotal || !user) {
    return res.json({ result: false, error: "Remplir tous les champs." });
  }

  if (placesTotal <= 0) {
    return res.json({
      result: false,
      error: "Nombre de places disponibleinvalide",
    });
  }

  User.findOne({ token: user }).then((userData) => {
    if (!userData) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    const newRide = new Ride({
      departure,
      arrival,
      date,
      price,
      placesTotal,
      user: userData._id,
    });

    newRide.save().then((data) => {
      res.json({ result: true, ride: data });
    });
  });
});

router.get("/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token });
  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }
  const ride = await Ride.find({ user: user._id }); 
  res.json({ result: true, rides: ride });
});

router.get("/", async (req, res) => {
  const rides = await Ride.find().populate("user", "firstname lastname car");
  res.json({ result: true, rides });
});

router.delete("/delete/:rideId", async (req, res) => {
  const ride = await Ride.deleteOne({ _id: req.params.rideId });
  if (ride.deletedCount > 0) {
    res.json({ result: true, message: "Trajet supprimé" });
  } else {
    res.json({ result: false, error: "Trajet non trouvé" });
  }
});

module.exports = router;
