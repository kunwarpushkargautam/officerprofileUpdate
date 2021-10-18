const jwt = require("jsonwebtoken");
const Register = require("./models/userRegisterSchema");

const auth = async (req, res, next) => {
  try {
    
      const token = req.cookies.jwt;

      const verifyUser = jwt.verify(token, "hiithisismedeveloperkunwarpushkargautamthankyou");
      // console.log(token);
      // console.log(verifyUser);
      const user = await Register.findOne({ _id: verifyUser._id });
      // console.log(user);
      req.user = user;
      req.token = token;
      req.pdate =user.information.postPeriod.toString().split("-");
      req.adate =user.information.appointmentYear.toString().split("-");
      req.bdate =user.dob.toString().split(" ");
      
    
    next();
  } catch (error) {

    res.redirect('login');
    console.log(error.toString());
  }
};

module.exports = auth;
