const mongoose = require("mongoose");

const helpSchema = new mongoose.Schema(
  {
    userid: {
      type:Schema.Types.ObjectId,ref:"RegisteredOfficers",
      required: true,
    },
    message: {
      type: String,
      required:true
    },
    topic:{
      type: String,
      required:true
    }
  },
  { timestamps: true }
);

const Help = new mongoose.model("HelpQuerry", helpSchema);
module.exports = Help;
