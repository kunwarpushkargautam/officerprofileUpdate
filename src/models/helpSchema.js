const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "RegisteredOfficer",
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Help = new mongoose.model("HelpQuerry", helpSchema);
module.exports = Help;
