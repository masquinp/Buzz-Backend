const express = require("express");
const router = express.Router();
const Payment = require("../models/payments");
const User = require("../models/users");

router.get("/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    Payment.find({ user: user._id })
      .populate("booking")
      .then((getPayments) => {
        res.json({ result: true, payments: getPayments });
      });
  });
});

router.post("/add", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    Payment.findOne({ booking: req.body.booking, user: user._id }).then(
      (existingPayment) => {
        if (existingPayment) {
          return res.json({
            result: false,
            error: "Vous avez déjà payé ce trajet",
          });
        }

        const newPayment = new Payment({
          amount: req.body.amount,
          status: req.body.status, // || "pending",
          booking: req.body.booking,
          user: user._id,
        });

        newPayment.save().then((savedPayment) => {
          res.json({ result: true, payment: savedPayment });
        });
      },
    );
  });
});

module.exports = router;
