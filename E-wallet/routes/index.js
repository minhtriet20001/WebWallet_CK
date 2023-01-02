var express = require("express");
var authenticateToken = require("../apis/token");
var supF = require("../untils/supportFunction");
var Users = require("../model/user");
var History = require("../model/history");
var router = express.Router();
var cookieParser = require("cookie-parser");
router.use(cookieParser());

/* GET home page. */
router.get("/", authenticateToken, function (req, res, next) {
  let user = supF.mongooseToObject(req.session.user);
  let status = req.session.msg;
  delete req.session.msg;
  console.log(user.status);
  res.render("index", {
    ...user,
    layout: false,
    status: status,
    confirm:
      user.status != "confirmed"
        ? { msg: "Chờ xác minh", status: "warning" }
        : { msg: "Đã xác minh", status: "success" },
  });
});

router.get("/listuser", (req, res) => {
  Users.find({}, function (err, users) {
    return res.json({ data: users });
  });
});

router.get("/history", (req, res) => {
  let history = new History({
    codeID: "000000",
    typeTransaction: "Nạp tiền",
    email: "nhock@gmail.com",
    status: "Đang duyệt",
    fee: 0,
    balance: 0,
    message: "aaaaaaaaaaaaaaaa",
    currentBalance: 0,
    Other: null,
  });
  history
    .save()
    .then(function (user) {
      return res.json({ data: user });
    })
    .catch(function (err) {
      return res.json({ error: err });
    });
});

router.get("/recharge", authenticateToken, function (req, res, next) {
  let user = supF.mongooseToObject(req.session.user);
  return res.render("recharge", {
    ...user,
    layout: false,
    confirm:
      user.status != "confirmed"
        ? { msg: "Chờ xác minh", status: "warning" }
        : { msg: "Đã xác minh", status: "success" },
  });
});

router.get("/withdrawal", authenticateToken, function (req, res, next) {
  let user = supF.mongooseToObject(req.session.user);
  return res.render("withdrawal", {
    ...user,
    layout: false,
    confirm:
      user.status != "confirmed"
        ? { msg: "Chờ xác minh", status: "warning" }
        : { msg: "Đã xác minh", status: "success" },
  });
});

router.get("/tranfers", authenticateToken, function (req, res, next) {
  let user = supF.mongooseToObject(req.session.user);
  return res.render("transfer", {
    ...user,
    layout: false,
    confirm:
      user.status != "confirmed"
        ? { msg: "Chờ xác minh", status: "warning" }
        : { msg: "Đã xác minh", status: "success" },
  });
});

router.get("/cards", authenticateToken, function (req, res, next) {
  let user = supF.mongooseToObject(req.session.user);
  return res.render("buycard", {
    ...user,
    layout: false,
    confirm:
      user.status != "confirmed"
        ? { msg: "Chờ xác minh", status: "warning" }
        : { msg: "Đã xác minh", status: "success" },
  });
});

module.exports = router;
