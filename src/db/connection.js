const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://myselfmrkunwar:abcdef123@cluster0.hmcj0.mongodb.net/OfficerProfile?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useFindAndModify:false
  })
  .then(() => {
    console.log("connection ok");
  })
  .catch((e) => {
    console.log(e);
  });
//mongodb+srv://myselfmrkunwar:myselfmrkunwar@cluster0.hmcj0.mongodb.net/OfficerProfile