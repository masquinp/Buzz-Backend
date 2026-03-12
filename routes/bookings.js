var express = require("express");
var router = express.Router();

const Booking = require("../models/bookings");
const User = require("../models/users");
const Ride = require("../models/rides");

router.get("/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((user) => {
    if (!user) {
      // Si aucun utilisateur n'est trouvé avec ce token, on retourne une erreur
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    Booking.find({ user: user._id })
      // .populate("ride") // on récupère les infos du trajet associé à chaque réservation
      // .populate("ride.user", "firstname lastname avatar") // on récupère les infos du conducteur associé à chaque trajet
      .populate({
        path: "ride",
        populate: {
          path: "user",
          select: "firstname lastname avatar car",
        },
      })
      .then((getBookings) => {
        res.json({ result: true, bookings: getBookings });
      });
  });
});

router.post("/add", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    //  On vérifie si la réservation existe déjà
    Booking.findOne({ ride: req.body.ride, user: user._id }).then(
      (existingBooking) => {
        if (existingBooking) {
          return res.json({
            result: false,
            error: "Vous avez déjà réservé ce trajet",
          });
        } // si on a déjà une réservation pour ce trajet et cet utilisateur, on retourne une erreur

        const newBooking = new Booking({
          message: req.body.message,
          seatsBooked: req.body.seatsBooked,
          ride: req.body.ride,
          user: user._id,
        });
        newBooking.save().then((savedBooking) => {
          res.json({ result: true, booking: savedBooking });
        });
      },
    );
  });
});

router.delete("/delete/:bookingId", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    // On utilise le token passé dans l'URL (params) pour savoir qui supprime la réservation, et on utilise l'ID de la réservation pour savoir laquelle supprimer
    Booking.deleteOne({ _id: req.params.bookingId, user: user._id }).then(
      (data) => {
        // deletedCount vaut 1 si quelqu'un a été supprimé, 0 sinon
        if (data.deletedCount > 0) {
          res.json({
            result: true,
            message: "Réservation supprimée avec succès",
          });
        } else {
          res.json({
            result: false,
            error: "Réservation non trouvée ou non autorisée",
          });
        }
      },
    );
  });
});

// à utiliser côté conducteur pour accepter/refuser une réservation (et à l'améliorer)
router.put("/updateStatus", (req, res) => {
  // On cherche le booking par son ID envoyé dans le body
  Booking.findById(req.body.bookingId).then((data) => {
    if (data) {
      data.status = req.body.status; // On met à jour le statut
      data.save().then((updatedBooking) => {
        res.json({ result: true, booking: updatedBooking });
      });
    } else {
      res.json({ result: false, error: "Booking non trouvé" });
    }
  });
});

module.exports = router;
