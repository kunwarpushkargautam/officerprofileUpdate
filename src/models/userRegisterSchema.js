const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  dob: {
    type: Date,
  },
  email: {
    type: String,

    unique: true,
  },
  post: {
    type: String,
  },
  department: {
    type: String,
  },

  postCity: {
    type: String,
  },
  postState: {
    type: String,
  },
  information: {
    postPeriod: {
      type: String,
      default: "NA",
    },
    // personal details starts here
    marital: {
      type: String,
      default: "NA",
    },
    height: {
      type: Number,
      default: 0,
    },
    homeCity: {
      type: String,
      default: "NA",
    },
    homeDist: {
      type: String,
      default: "NA",
    },
    homeState: {
      type: String,
      default: "NA",
    },
    //educational Details
    degree: {
      type: String,
      default: "NA",
    },
    university: {
      type: String,
      default: "NA",
    },

    //recruitment details
    recruitmentType: {
      type: String,
      default: "NA",
      //
    },
    appointmentYear: {
      type: String,
      default: "NA",
      //
    },
    twitter: {
      type: String,
      default: "NA",
      //
    },
    facebook: {
      type: String,
      default: "NA",
      //
    },
    instagram: {
      type: String,
      default: "NA",
      //
    },
  },
  password: {
    type: String,
    required:true,
    minlength:8
  },
  confirmPassword: {
    type: String,
    required:true,
    minlength:8
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  image: { 
    type: String,
    default:"aw.jpg"
  },
  granted:{
    type:Boolean,
    default:false
  }
},{timestamps:true});

registerSchema.methods.generateAuthToken = async function () {
  try {
    // console.log(this._id);
    const token = jwt.sign(
      { _id: this._id.toString() },
      "hiithisismedeveloperkunwarpushkargautamthankyou"
    );
    // console.log(token);
    this.tokens = this.tokens.concat({ token: token });
    // console.log(this.tokens)
    await this.save(); //discussion will be made on it
    return token;
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

registerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    // this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
  }

  next();
});

const Register = new mongoose.model("RegisteredOfficer", registerSchema);
module.exports = Register;
