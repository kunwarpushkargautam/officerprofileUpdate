require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
require("./db/connection");
const hbs = require("hbs");
const { json } = require("express");
const bcrypt = require("bcryptjs");
const Register = require("./models/userRegisterSchema");
const auth = require("./auth");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser());
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
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
      callback(null, true);
    } else {
      console.log("only jpg and png file supported");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user,"pehle ka");
    res.clearCookie("jwt");
    await req.user.save();
    console.log(req.user,"baad ka");
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/profile", auth, (req, res) => {
  console.log(req.user.image);
  // const postdates = {
  //   year: req.pdate[0],
  //   month: req.pdate[1],
  // };
  // const appointdates = {
  //   year: req.adate[0],
  //   month: req.adate[1],
  // };
  const bdaydates = {
    year: req.bdate[3],
    month: req.bdate[1],
    date: req.bdate[2],
  };

  res.render("index", {
    userData: req.user,
    // postPeriod: postdates,
    // appointdates: appointdates,
    bdaydates: bdaydates,
  });
});

app.post("/profilepic", [auth, upload.single("image")], (req, res) => {
  console.log("ye mila");
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
  console.log("ye mila");
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
  } = req.body;

  console.log("update wala dabba");

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
  res.render("login");
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

        // clear

        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });
      if (req.file) {
        console.log(req.file);
      }

      const token = await registerOfficer.generateAuthToken();

      //cookies adding

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 18000000),
        httpOnly: true,
        // secure:true
      });

      const registedOfficer = await registerOfficer.save();

      res.status(201).render("index");
      res.redirect("/profile");
    } else {
      res.send("Password are not same");
    }
  } catch (err) {
    res.status(400).send(err);
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
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 18000000),
      httpOnly: true,
      // secure:true
    });

    if (isPasswordMatching) {
      console.log("ok till here");
      res.status(201);
      res.redirect("/profile");
    } else {
      res.send("password error");
    }
  } catch (error) {
    res.status(400).send("Invalid login details");
  }
});

app.listen(port, () => {
  console.log(`page served at port ${port}`);
});
