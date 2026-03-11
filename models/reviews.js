const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  note: String,
  message: String,
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "rides" }, // type ObjectId pour lier au document correspondant dans la collection "rides"
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // type ObjectId pour lier au document correspondant dans la collection "users"
});

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
