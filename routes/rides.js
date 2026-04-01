const express = require("express");
const router = express.Router();
const Ride = require("../models/rides");
const User = require("../models/users");
const Booking = require("../models/bookings");

const { checkBody } = require("../modules/checkBody");


router.post("/add", (req, res) => {
  if (!checkBody(req.body, ["departure", "arrival", "date", "price", "placesTotal", "user"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

   // on vérifie que le nombre de places est un nombre positif
  if (req.body.placesTotal <= 0) {
    return res.json({ result: false, error: "Nombre de places invalide" });
  }
 // pareil pour le prix
  if (req.body.price <= 0) {
    return res.json({ result: false, error: "Prix invalide" });
  }

  User.findOne({ token: req.body.user }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    const newRide = new Ride({
      departure: req.body.departure,
      arrival: req.body.arrival,
      date: req.body.date,
      price: req.body.price,
      placesTotal: req.body.placesTotal,
      user: user._id,
    });

    newRide.save().then((data) => {
      res.json({ result: true, ride: data });
    });
  });
});

// récupère les trajets créés par un utilisateur spécifique
router.get("/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token });
  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }
  const ride = await Ride.find({ user: user._id });
  res.json({ result: true, rides: ride });
});


// récupère tous les trajets disponibles avec les infos du conducteur
router.get("/", async (req, res) => {
  const rides = await Ride.find().populate("user", "firstname lastname car"); // pour associer les infos de l'utilisateur (le chauffeur) à chaque trajet
  res.json({ result: true, rides });
});

router.delete("/delete/:rideId", async (req, res) => {
  const user = await User.findOne({ token: req.body.token });
  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }

  const ride = await Ride.deleteOne({ _id: req.params.rideId, user: user._id });
  if (ride.deletedCount > 0) {
    res.json({ result: true, message: "Trajet supprimé" });
  } else {
    res.json({ result: false, error: "Trajet non trouvé ou non autorisé" });
  }
});

module.exports = router;
