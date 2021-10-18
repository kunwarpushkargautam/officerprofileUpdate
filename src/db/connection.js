const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/officer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection ok");
  })
  .catch((e) => {
    console.log(e);
  });
