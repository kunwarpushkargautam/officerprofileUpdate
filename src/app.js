require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
require("./db/connection");
const hbs = require("hbs");
const { json } = require("express");
const url = require("url");
const bcrypt = require("bcryptjs");
const Register = require("./models/userRegisterSchema");
const Help = require("./models/helpSchema");
const auth = require("./auth");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partial_path);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg"
    ) {
      callback(null, true);
    } else {
      console.log("only jpg and png file supported");
      callback(null, false);
    }
  },
  limits: {
    fields: 5,
    fieldNameSize: 100,
    fieldSize: 30000,
    fileSize: 15000000,
  },
});

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

app.get("/", (req, res) => {
  const token = req.cookies.jwt;
  console.log(token);
  if (token) {
    res.redirect("/profile");
  } else {
    res.render("login");
  }
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/logout", auth, async (req, res) => {
  try {
    // console.log(req.user, "pehle ka");
    res.clearCookie("jwt");
    await req.user.save();
    // console.log(req.user, "baad ka");
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/users", (req, res) => {
  Register.find()
    .then((result) => {
      res.status(200).json({
        alloffficers: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
app.get("/querry", (req, res) => {
  Help.find()
    .then((result) => {
      res.status(200).json({
        allquerry: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

app.get("/profile", auth, (req, res) => {
  // console.log(req.user.image);

  const bdaydates = {
    year: req.bdate[3],
    month: req.bdate[1],
    date: req.bdate[2],
  };

  res.render("index", {
    userData: req.user,

    bdaydates: bdaydates,
  });
});

app.post("/profilepic", [auth, upload.single("image")], (req, res) => {
  console.log("req",req.user);
  const userUpdateId = req.user._id.toString();

  console.log("update wala image");
  const image = req.file.filename;
  console.log(image);

  Register.findByIdAndUpdate(
    userUpdateId,
    {
      image: image,
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + userUpdateId,
        });
      }
      res.redirect("/profile");
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "user not found with id " + userUpdateId,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + userUpdateId,
      });
    });
});
app.post("/profile", [auth, upload.single("image")], (req, res) => {
  console.log("ye mila",req.user);
  const userUpdateId = req.user._id.toString();
  const {
    currentPost,
    currentDepartment,
    postCity,
    postState,
    postPeriod,
    marital,
    homeCity,
    homeDist,
    homeState,
    height,
    degree,
    university,
    recruitmentType,
    appointmentYear,
    twitterProfile,
    facebookProfile,
    instagramProfile,
  } = req.body;

  // console.log("update wala dabba");

  Register.findByIdAndUpdate(
    userUpdateId,
    {
      currentPost: currentPost,
      currentDepartment: currentDepartment,
      postCity: postCity,
      postState: postState,

      information: {
        postPeriod: postPeriod,
        marital: marital,
        homeCity: homeCity,
        homeDist: homeDist,
        homeState: homeState,
        height: height,
        degree: degree,
        university: university,
        recruitmentType: recruitmentType,
        appointmentYear: appointmentYear,
        twitter: twitterProfile,
        facebook: facebookProfile,
        instagram: instagramProfile,
      },
      // image:image,
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + userUpdateId,
        });
      }
      res.redirect("/profile");
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "user not found with id " + userUpdateId,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + userUpdateId,
      });
    });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  const token = req.cookies.jwt;
  // console.log(token);
  if (token) {
    res.redirect("/profile");
  } else {
    res.render("login");
  }
});

app.post("/signup", upload.single("image"), async (req, res) => {
  try {
    const password = req.body.password;
    const cnfPassword = req.body.confirmPassword;
    if (password === cnfPassword) {
      const registerOfficer = new Register({
        fullname: req.body.fullname,
        dob: req.body.dob,
        email: req.body.email,
        post: req.body.currentPost,
        department: req.body.currentDepartment,
        postCity: req.body.postCity,
        postState: req.body.postState,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });
      if (req.file) {
        // console.log(req.file);
      }
      // console.log("before token");
      const token = await registerOfficer.generateAuthToken();
      // console.log("after token");
      //cookies adding
      console.log("before cookie");
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 18000000),
        // httpOnly: true,  //uncommenting this led to cookie save problem
        // secure:true
      });
      console.log("after cookie");
      const registedOfficer = await registerOfficer.save();
      // console.log("before render");
      res.status(201).render("index");
      res.redirect("/profile");
    } else {
      res.send("Password are not same");
    }
  } catch (err) {
    console.log(" catched error");
    console.log(err);
    res.status(400).render("signup", {
      message: "oops! something went unexpected",
      textColor: "text-danger",
      borderColor: "border-danger",
    });
  }
});

app.get("/resetPassword", auth, (req, res) => {
  try {
    res.render("password");
  } catch (err) {
    res.render("error", {
      error: "something went wrong",
      statusCode: "400",
      desMsg: "Please try again after some time",
      link: "/resetPassword",
      btnName: "Reset Password",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const logInEmail = req.body.email;
    const password = req.body.password;
    console.log(logInEmail);
    const userdetails = await Register.findOne({ email: logInEmail });
    const isPasswordMatching = await bcrypt.compare(
      password,
      userdetails.password
    );
    const token = await userdetails.generateAuthToken();
    const saveCookie = () => {
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 18000000),
        // httpOnly: true,
        // secure:true
      });
    };
    if (isPasswordMatching) {
      // console.log("ok till here");
      saveCookie();
      res.status(201);

      res.redirect("/profile");
    } else {
      res.status(400).render("login", {
        message: "Password Invalid",
        textColor: "text-danger",
        borderColor: "border-danger",
      });
    }
  } catch (error) {
    res.status(400).render("login", {
      message: "Invalid login details",
      textColor: "text-danger",
      borderColor: "border-danger",
    });
  }
});

app.post("/resetPassword", auth, async (req, res) => {
  const password = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const cNewPassword = req.body.cNewPassword;
  console.log(password, newPassword, cNewPassword);
  const email = req.user.email;
  const userUpdateId = req.user._id.toString();
  const userdetails = await Register.findOne({ _id: userUpdateId });
  console.log(userdetails, "kaam kar rha hai");
  const isPasswordMatching = await bcrypt.compare(
    password,
    userdetails.password
  );
  if (isPasswordMatching) {
    if (newPassword === cNewPassword) {
      Register.findById(userUpdateId, function (err, doc) {
        if (err) return false;
        doc.password = newPassword;
        doc.confirmPassword = cNewPassword;
        doc.save();
      });
      res.status(201).redirect("/profile");
    } else {
      res.status(400).render("password", {
        changeStatus: "Passwords are Not Matching",
        textColor: "text-danger",
        borderColor: "border-danger",
      });
    }
  } else {
    res.status(400).render("password", {
      changeStatus: "Current Password is wrong",
      textColor: "text-danger",
      borderColor: "border-danger",
    });

    console.log("current password is wrong");
  }
  console.log(isPasswordMatching);
});

app.post("/help", async (req, res) => {
  try {
    let querrymail = req.body.querrymail;
    let querrysubject = req.body.querrysubject;
    let querrytext = req.body.querrytext;

    const queryUserDetails = await Register.findOne({ email: querrymail });
    console.log("queryUserDetails");
    console.log(queryUserDetails);
    if (querrymail != null && querrysubject != null && querrytext != null) {
      if (queryUserDetails != null) {
        const helpQuerry = new Help({
          userid: queryUserDetails._id,
          email: querrymail,
          topic: querrysubject,
          message: querrytext,
        });
        let helpquerry = await helpQuerry.save();

        res.status(201).render("help", {
          message: "Querry Submitted, we will reply soon",
          textColor: "text-success",
          borderColor: "border-success",
        });
      } else {
        const helpQuerry = new Help({
          email: querrymail,
          topic: querrysubject,
          message: querrytext,
        });
        let helpquerry = await helpQuerry.save();

        res.status(201).render("login", {
          message: "Querry Submitted, we will reply soon!!",
          textColor: "text-success",
          borderColor: "border-success",
        });
        // res.redirect("/login");
      }
    } else {
      res.status(400).render("help", {
        message: "Please fill all details",
        textColor: "text-warning",
        borderColor: "border-warning",
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/reset-password-link", (req, res) => {
  res.render("reset-password-link");
});

app.post("/reset-password-link", (req, res) => {
  console.log(req.body.email);
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    Register.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).render("reset-password-link", {
          message: "user dont exist with this email",
          textColor: "text-danger",
          borderColor: "border-danger",
        });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "officershelpdesk@gmail.com",
          subject: "password reset",
          html: `
          <h1>Your Password change Request</h1>
          <p>click this <a href="http://localhost:3000/reset-password/${token}">link</a></p>`,
        });
        res.render("login", {
          message: "Reset link sent on Your mail",
          textColor: "text-success",
          borderColor: "border-success",
        });
      });
    });
  });
});
var sentToken = "";
app.get("/reset-password/:token", (req, res) => {
  sentToken = req.params.token;

  res.render("resetPassword");
});

app.post("/reset-password", (req, res) => {
  var queryString = url.parse(req.url, true);
  console.log(queryString);

  // const sentToken = req.cookies.pass.toString();
  const newPassword = req.body.newPassword;
  const cNewPassword = req.body.cNewPassword;
  if (newPassword === cNewPassword) {
    console.log(sentToken);
    console.log("good pass matching");
    Register.findOne({
      resetToken: sentToken,
      expireToken: { $gt: Date.now() },
    })
      .then((user) => {
        console.log(user);
        if (!user) {
          res.status(422).render("error", {
            error: "Try again session expired",
            statusCode: "422",
            desMsg: "link expired.. request it again!!",
            link: "/reset-password-link",
            btnName: "Reset Link",
          });
        }
        console.log("before hash");
        bcrypt.hash(newPassword, 12).then((hashedpassword) => {
          console.log("setting password");
          user.password = newPassword;
          user.confirmPassword = cNewPassword;
          user.resetToken = undefined;
          user.expireToken = undefined;
          console.log("before saving");
          user.save().then((saveduser) => {
            res.render("login", {
              message: "password updated , Login now",
              textColor: "text-success",
              borderColor: "border-success",
            });
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.listen(port, () => {
  console.log(`page served at port ${port}`);
});
