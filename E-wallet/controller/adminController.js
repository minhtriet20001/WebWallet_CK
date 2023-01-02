var supF = require("../untils/supportFunction");
var History = require("../model/history");
var Users = require("../model/user");
const User = require("../model/user");
var nodemailer = require("nodemailer");
require("dotenv").config();

class adminController {
  indexAdmin(req, res, next) {
    if (!req.cookies.access_admin) return res.redirect("/users/logout");
    let status = req.params.status;
    if (status == "") {
      status = "waitConfirm";
    }
    else if (status == "waitConfirm") {
      Users.find({ $or: [{ status: "waitConfirm" }, { status: "waitUpdate" }] })
        .sort({ createdAt: -1 })
        .then((users) => {
          return res.render("indexAdmin", {
            users: supF.mutipleMongooseToObject(users),
          });
        });
    } else if (status == "transfers") {
      History.find({ typeTransaction: "Chuyển tiền" , status: "Đang chờ duyệt"})
        .sort({ createdAt: -1 })
        .then((histories) => {
          return res.render("admin_transfer", {
            histories: supF.mutipleMongooseToObject(histories),
          });
        });
    } else if (status == "withdraw") {
      History.find({ typeTransaction: "Rút tiền",  status: "Đang chờ duyệt"})
        .sort({ createdAt: -1 })
        .then((histories) => {
          return res.render("admin_withdraw", {
            histories: supF.mutipleMongooseToObject(histories),
          });
        });
    } else {
      Users.find({ status: status })
        .sort({ createdAt: -1 })
        .then((users) => {
          return res.render("indexAdmin", {
            users: supF.mutipleMongooseToObject(users),
          });
        });
    }
  }

  indexUser(req, res, next) {
    if (!req.cookies.access_admin) return res.redirect("/users/logout");
    let name = req.params.username;
    Users.findOne({ username: name }).then((user) => {
      History.find({email: user.email}).then((history) => {
        let histories = supF.mutipleMongooseToObject(history);
        return res.render("view_user", { ...supF.mongooseToObject(user), histories: histories});
      });
    });
  }

  destroyUser(req, res, next) {
    let username = req.body.post;
    Users.updateOne({username: username}, {$set: {status: "destroy"}}).then((user) => res.json(
        {success: true }
    )).catch(err => res.json({err: err}))
  }

  updateUser(req, res, next) {
    let username = req.body.post;
    Users.updateOne({username: username}, {$set: {status: "waitUpdate"}}).then((user) => res.json(
        {success: true }
    )).catch(err => res.json({err: err}))
  }

  acceptUser(req, res, next) {
    let username = req.body.post;
    Users.updateOne({username: username}, {$set: {status: "confirmed"}}).then((user) => res.json(
        {success: true }
    )).catch(err => res.json({err: err}))
  }

  unlockUser(req, res, next) {
    let username = req.body.post;
    Users.updateOne({username: username}, {$set: {status: "confirmed", countFailed: 0}}).then((user) => res.json(
        {success: true }
    )).catch(err => res.json({err: err}))
  }

  updateWithdraw(req, res, next) {
    let codeID = req.body.post;
    History.findOne({codeID: codeID}).then(async (history) => {
        let user = await Users.findOne({email: history.email});
        if (parseInt(user.balance) < parseInt(history.balance)) {
            return res.json({err: 'Số dư hiện tại của người dùng không đủ để phê duyệt đơn rút tiền này'});
        }
        Users.updateOne({email: user.email}, {$set: {balance: parseInt(user.balance) - parseInt(history.balance)}}).then((users) => {
            History.updateOne({codeID: codeID}, {$set: {status: "Thành công", currentBalance: parseInt(user.balance) - parseInt(history.balance)}}).then((history) => {
                return res.json({success: true})
            }).catch(err => res.json({err: err}));
        }).catch(err => res.json({err: err}))
    }).catch(err => res.json({err: err}))
  }

  updateTransfer(req, res, next) {
    let codeID = req.body.post;
    History.findOne({codeID: codeID}).then(async (history) => {
        let user = await Users.findOne({email: history.email});
        let receiveUser = await Users.findOne({email: history.user_re_email});
        let feeMoney = history.side == "send" ? parseInt(history.balance) + parseInt(history.fee) : parseInt(history.balance);
        let feeRe = history.side == "send" ? 0 : parseInt(history.fee);
        if (parseInt(user.balance) < feeMoney) {
            return res.json({err: 'Số dư hiện tại của người dùng không đủ để phê duyệt đơn chuyển tiền này'});
        }
        if (parseInt(receiveUser.balance) < feeRe) {
            return res.json({err: 'Số dư hiện tại của người nhận không đủ để phê duyệt đơn chuyển tiền này'});
        }
        Users.updateOne({email: user.email}, {$set: {balance: parseInt(user.balance) - feeMoney}}).then((users) => {
            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.GMAIL,
                  pass: process.env.PASS,
                },
              });

              var mailOptions = {
                from: process.env.GMAIL,
                to: receiveUser.email,
                subject: "E-WALLET - NHẬN TIỀN",
                text: `Bạn đã nhận được số tiền : ${history.balance} VND từ ${user.fullname}, phí dịch vụ là: ${history.fee}`,
              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                    Users.updateOne({email: receiveUser.email}, {$set: {balance: parseInt(receiveUser.balance) + (parseInt(history.balance) - feeRe)}}).then((reUser) => {
                        History.updateOne({codeID: codeID}, {$set: {status: "Thành công", currentBalance: parseInt(user.balance) - feeMoney }}).then((history) => {
                            return res.json({success: true});
                        }).catch(err => res.json({err: err}));
                    })
                }
              });
        }).catch(err => res.json({err: err}))
    }).catch(err => res.json({err: err}))
  }
}

module.exports = new adminController();
