const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  content: { type: String, required: true },
  e_f: { type: String, required: true },
  e_t: { type: String, required: true },
  sent: { type: Date },
});

module.exports = mongoose.model("Message", userSchema);
