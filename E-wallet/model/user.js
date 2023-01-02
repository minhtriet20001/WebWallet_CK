var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  roles: {
    type: String,
  },
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  birthday: {
    type: String,
  },
  address: {
    type: String,
  },
  cmndfront: {
    type: String,
  },
  cmndback: {
    type: String,
  },
  fullname: {
    type: String,
  },
  balance: {
    type: Number
  }, 
  countlogin: {
    type: String,
  },
  status: {
    type: String,
  },
  //1. waitConfirm 2. confirmed 3.waitUpdate 4. bannedMany
  countFailed: {
    type: Number,
  },
  timeswithdrawal: {
    date: Number,
    times: Number
  }
}, { timestamps: true });

var User = mongoose.model("User", userSchema);

module.exports = User;
