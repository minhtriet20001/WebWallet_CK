var mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
  codeID: {
    type: String
  },
  typeTransaction : {
    type: String
  },
  user_re_email: String, 
  email: {
    type: String
  },
  status:{
    type: String
  },
  fee : {
    type: Number
  },
  balance: {
    type: Number
  },
  message: {
    type: String
  },
  currentBalance: {
    type: String
  },
  side: String,
  Other: {
    codePhone: [String], 
    nameTelecom: String, 
    price: Number,
  }
}, { timestamps: true });

var History = mongoose.model("History", historySchema);

module.exports = History;
