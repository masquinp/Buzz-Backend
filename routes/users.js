var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

router.post("/signup", (req, res) => {
  if (
    !checkBody(req.body, [
      // les champs obligatoires pour s'inscrire sont :
      "firstname",
      "lastname",
      "username",
      "email",
      "password",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // un utilisateur ne peut pas s'inscrire avec un nom d'utilisateur ou un email déjà utilisé par quelqu'un d'autre
  User.findOne({ username: req.body.username }).then((username) => {
    if (username !== null) {
      return res.json({ result: false, error: "Nom d'utilisateur déjà pris" });
    }

    User.findOne({ email: req.body.email }).then((email) => {
      if (email !== null) {
        return res.json({ result: false, error: "Email déjà utilisé" });
      }

      const hash = bcrypt.hashSync(req.body.password, 10); // on hash le mot de passe pour le stocker de manière sécurisée dans la base de données

      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: hash, // on stocke le mot de passe de manière sécurisée grâce à bcrypt
        token: uid2(32),
        car: {
          brand: req.body.brand,
          model: req.body.model,
          color: req.body.color,
          nbSeats: req.body.nbSeats,
          licencePlate: req.body.licencePlate,
        },
      });

      newUser.save().then((newDoc) => {
        res.json({
          result: true,
          token: newDoc.token,
          user: { _id: newDoc._id, email: newDoc.email },
        });
      });
    });
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // bycrypt.compareSync() permet de comparer le mot de passe entré par l'utilisateur (en clair) avec le hash enregistré dans la base de données
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        user: {
          _id: data._id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          username: data.username,
          car: data.car,
          avatar: data.avatar,
          photos: data.photos,
        },
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.delete("/delete/:token", (req, res) => {
  // On utilise le token passé dans l'URL (params) pour savoir qui supprimer
  User.deleteOne({ token: req.params.token }).then((data) => {
    // deletedCount vaut 1 si quelqu'un a été supprimé, 0 sinon
    if (data.deletedCount > 0) {
      res.json({ result: true, message: "Compte supprimé avec succès" });
    } else {
      res.json({ result: false, error: "Utilisateur non trouvé" });
    }
  });
});

router.post("/addCar", (req, res) => {
  // on vérifie si tous les champs sont bien remplis dans le req.body
  if (
    !checkBody(req.body, [
      "token",
      "brand",
      "model",
      "color",
      "nbSeats",
      "licencePlate",
    ])
  ) {
    res.json({ result: false, error: "Champs manquants" });
    return; // on arrête tout si un champ manque
  }

  // on cherche l'utilisateur dans la base de données grâce à son token
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) {
      // si on a trouvé l'utilisateur (data n'est pas nul) :

      // on remplit l'objet "car" de cet utilisateur avec les infos reçues du frontend
      data.car = {
        brand: req.body.brand,
        model: req.body.model,
        color: req.body.color,
        nbSeats: req.body.nbSeats,
        licencePlate: req.body.licencePlate,
      };

      // 3. On sauvegarde les modifications dans la base de données
      data.save().then((updatedUser) => {
        // On renvoie une réponse positive avec les nouvelles infos de la voiture
        res.json({ result: true, car: updatedUser.car });
      });
    } else {
      // Si "data" est nul, c'est que le token n'existe pas
      res.json({ result: false, error: "Utilisateur non trouvé" });
    }
  });
});

router.post("/upload", (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`; // on crée un chemin temporaire pour stocker la photo reçue du frontend avant de l'uploader sur Cloudinary

  req.files.photoFromFront.mv(photoPath).then(() => {
    cloudinary.uploader.upload(photoPath).then((resultCloudinary) => {
      fs.unlinkSync(photoPath); // on supprime la photo du dossier tmp après l'avoir uploadée sur Cloudinary
      User.findOne({ token: req.body.token }).then((user) => {
        // on ajoute la nouvelle URL à la fin du tableau photos existant
        user.photos = [...user.photos, resultCloudinary.secure_url];
        // On sauvegarde l'utilisateur avec la nouvelle photo
        user.save().then(() => {
          res.json({ result: true, url: resultCloudinary.secure_url });
        });
      });
    });
  });
});

router.delete("/deletePicture", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    user.photos = user.photos.filter((photo) => photo !== req.body.url);
    user.save().then(() => {
      res.json({ result: true });
    });
  });
});

router.post("/update", async (req, res) => {
  const updateData = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
  };

  if (req.body.password) {
    const hash = bcrypt.hashSync(req.body.password, 10);
    updateData.password = hash;
  }

  const user = await User.findOne({ token: req.body.token });

  const result = await User.updateOne({ token: req.body.token }, updateData);
  if (result.modifiedCount > 0) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
});

module.exports = router;
