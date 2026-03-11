const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    username: String,
    message: String,
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "bookings" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // pour savoir qui a envoyé le message
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // pour savoir qui doit recevoir le message
  },
  { timestamps: true },
);

const Message = mongoose.model("messages", messageSchema);
module.exports = Message;
