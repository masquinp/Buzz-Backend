const express = require("express"); //librairie qui permet de creer des routes (API backend)
const router = express.Router(); //va contenir toutes les routes liées aux rides et sera branche dans app.js
const Ride = require("../models/rides"); // import du modele Ride pour pouvoir creer un trajet, lire un trajet ou supprimer un trajet
const User = require("../models/users"); //pour retrouver un utilisateur avec son token
const Booking = require("../models/bookings");

router.post("/add", (req, res) => {
  const { departure, arrival, date, price, placesTotal, user } = req.body;

  if (!departure || !arrival || !date || !price || !placesTotal || !user) {
    return res.json({ result: false, error: "Remplir tous les champs." });
  }

  if (!placesTotal || placesTotal <= 0) {
    //verifie que placesTotal est un nombre valide et positif
    //placesTotal <= 0 verifie si 0 ou negatif
    return res.json({ result: false, error: "placesTotal invalide" });
  }

  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }
  const newRide = new Ride({
    departure: req.body.departure,
    arrival: req.body.arrival,
    date: req.body.date,
    price: req.body.price,
    placesTotal: req.body.placesTotal,

    user: User._id,
    car: User.car,
  });

  newRide.save().then((data) => {
    res.json({ result: true, ride: data });
  });
});

router.get("/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token });
  if (!user) {
    return res.json({ result: false, error: "Utilisateur non trouvé" });
  }
  const ride = await Ride.find({ user: user._id }); //récupère tous les rides créés par cet utilisateur
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
