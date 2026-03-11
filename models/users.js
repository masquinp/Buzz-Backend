const mongoose = require("mongoose");

const carSchema = mongoose.Schema({
  brand: String,
  color: String,
  model: String,
  nbSeats: Number,
  licencePlate: {
    type: String,
    uppercase: true, // Transforme automatiquement "ab-123-cd" en "AB-123-CD"
    trim: true, // Enlève les espaces inutiles avant ou après
  },
});

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  username: {
    type: String,
    unique: true, // Assure que le nom d'utilisateur est unique
    required: true, // Le nom d'utilisateur est obligatoire
    trim: true, // Enlève les espaces inutiles avant ou après
  },
  password: String,
  email: {
    type: String,
    unique: true, // Assure que l'email est unique
    required: true, // L'email est obligatoire
    trim: true, // Enlève les espaces inutiles avant ou après
  },

  token: String,
  car: carSchema,
  photos: [String], // pour upload les photos
  avatar: { type: String, default: 'monImage' }
});

const User = mongoose.model("users", userSchema);

module.exports = User;
