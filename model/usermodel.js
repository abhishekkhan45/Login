const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    unique: true ,
    require:true,
  },
  userpassword: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("WEB", userSchema);
