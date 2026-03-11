const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    username: String,
    message: String,
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "bookings" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true },
);

const Message = mongoose.model("messages", messageSchema);
module.exports = Message;
