var Users = require("../model/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  isImage(url) {
    return /[\/.](gif|jpg|jpeg|tiff|png)$/i.test(url);
  },

  checkUserExist(username) {
    Users.findOne({ username: username })
      .then((data) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
      });
    return false;
  },
  makePassword() {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateAccesssToken(useremail) {
    return jwt.sign(useremail, process.env.TOKEN_SECRET, {
      expiresIn: "3600s",
    });
  },

  mutipleMongooseToObject(mongooses) {
    return mongooses.map((mongoose) => mongoose.toObject());
  },

  mongooseToObject(mongoose) {
    return mongoose ? mongoose.toObject() : mongoose;
  },
};
