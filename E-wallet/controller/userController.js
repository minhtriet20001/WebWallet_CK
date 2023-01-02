var Users = require("../model/user");
const session = require("express-session");
var supF = require("../untils/supportFunction");
var History = require("../model/history");
var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
var fs = require("fs");
const { format } = require("path");
const saltRounds = 10;
require("dotenv").config();

class userController {
  indexLogin(req, res, next) {
    if (req.session.isloginged) {
      return res.redirect("/");
    }
    return res.render("login");
  }

  indexRegister(req, res, next) {
    if (req.session.isloginged) {
      return res.redirect("/");
    }
    return res.render("register");
  }

  async validationRegister(req, res, next) {
    let msg = "";
    let name = req.body.username.trim();
    let birthdate = req.body.birthdate;
    let phonenumber = req.body.phonenumber;
    let yearBD = birthdate.split("-");
    let currentYear = new Date().getFullYear();
    let imagesCM = req.files;
    let frontImageCM = imagesCM.frontImage[0];
    let backImageCM = imagesCM.backImage[0];
    let checkfrontImage = supF.isImage(frontImageCM.originalname);
    let checkbackImage = supF.isImage(backImageCM.originalname);
    let regexFullName =
      /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/gm;

    let userEmail = await Users.findOne({ email: req.body.email });
    let userPhoneNumber = await Users.findOne({ phone: phonenumber });

    if (userEmail) {
      msg = "Email đã được đăng ký, Vui lòng chọn email khác";
    } else if (userPhoneNumber) {
      msg =
        "Số điện thoại này đã được đăng ký, Vui lòng chọn số điện thoại khác";
    } else if (!regexFullName.test(name)) {
      msg = "Họ và tên không hợp lệ";
    } else if (currentYear - parseInt(yearBD) < 14) {
      msg =
        "Bạn phải đủ 14 tuổi mới được đăng kí, vui lòng chọn ngày sinh hợp lệ";
    } else if (!/^[0-9]{10}$/g.test(phonenumber)) {
      msg = "Số điện thoại phải là các chữ số và có 10 chữ số";
    } else if (!checkfrontImage || !checkbackImage) {
      msg = checkfrontImage
        ? "Ảnh mặt sau "
        : "Ảnh mặt trước " +
          "không hợp lệ, chỉ hỗ trợ các loại ảnh gif,jpg,jpeg,tiff,png";
    } else if (frontImageCM.size > 20480000 || backImageCM.size > 20480000) {
      msg =
        frontImageCM.size > 20480000
          ? "Ảnh mặt sau "
          : "Ảnh mặt trước " + "không hợp lệ, chỉ hỗ trợ ảnh dưới 20MB";
    }

    if (msg) {
      fs.rmSync("./public/images/" + frontImageCM.filename);
      fs.rmSync("./public/images/" + backImageCM.filename);
      return res.render("register", {
        ...req.body,
        success: false,
        msg: msg,
      });
    }
    next();
  }

  validationLogin(req, res, next) {
    let username = req.body.username.trim();
    let password = req.body.password;
    if (username == "admin" && password == "123456") {
      res.cookie("access_admin", true, {
        maxAge: 360000000000000, // thời gian sống
        httpOnly: true, // chỉ có http mới đọc được token
        //secure: true; //ssl nếu có, nếu chạy localhost thì comment nó lại
      });
      req.session.save();
      return res.redirect("/admin");
    }
    Users.findOne({ username: username }, (error, user) => {
      if (error) {
        return res.render("login", { success: false, msg: error });
      }
      if (!error && !user) {
        return res.render("login", {
          ...req.body,
          msg: "Tên đăng nhập không chính xác",
        });
      }
      if (user.countFailed == 10) {
        return res.render("login", {
          ...req.body,
          success: false,
          msg: `Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút`,
        });
      }
      //kiểm tra nếu count = 10 thì là đang khoá tạm thời
      if (user.countFailed == 6) {
        return res.render("login", {
          ...req.body,
          success: false,
          msg: `Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản`,
        });
      }
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const token =
            "Bearer " + supF.generateAccesssToken({ email: user.email });
          res.cookie("access_token", token, {
            maxAge: 365 * 24 * 60 * 60 * 100, // thời gian sống
            httpOnly: true, // chỉ có http mới đọc được token
            //secure: true; //ssl nếu có, nếu chạy localhost thì comment nó lại
          });
          return next();
        }
        const failed = user.countFailed;
        if (failed == 2) {
          //Khoá tạm thời set count = 10
          Users.updateOne(
            { username: username },
            { $set: { countFailed: 10 } },
            (err, status) => {
              if (err) {
                return res.render("login", { success: false, msg: err });
              }
            }
          );
          //Mở khoá tài khoản sau 1 phút, trả count về 3
          var lockAccountOneMinute = setTimeout(function () {
            Users.updateOne(
              { username: username },
              { $set: { countFailed: 3 } },
              (err, status) => {
                if (err) {
                  return res.render("login", { success: false, msg: err });
                }
              }
            );
            console.log(`unlock ${username} !`);
          }, 60000);

          return res.render("login", {
            ...req.body,
            success: false,
            msg: `Tài khoản đã bị khoá trong 1 phút! Nếu bạn tiếp tục nhập sai thêm 3 lần nữa sẽ bị khoá vĩnh viễn!`,
          });
        } else if (failed >= 5) {
          Users.updateOne(
            { username: username },
            { $set: { countFailed: 6, status: "bannedMany" } },
            (err, status) => {
              if (err) {
                return res.render("login", { success: false, msg: err });
              }
            }
          );
          return res.render("login", {
            ...req.body,
            success: false,
            msg: "Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản",
          });
        } else {
          Users.updateOne(
            { username: username },
            { $set: { countFailed: failed + 1 } },
            (err, status) => {
              if (err) {
                return res.render("login", { success: false, msg: err });
              }
            }
          );
          return res.render("login", {
            ...req.body,
            success: false,
            msg: `Bạn đã nhập sai mật khẩu ${failed + 1} lần!!!`,
          });
        }
      });
    });
  }

  async userLogin(req, res, next) {
    let username = req.body.username;
    const token = req.cookies.access_token;
    Users.updateOne(
      { username: username },
      { $set: { countFailed: 0 } },
      (err, status) => {
        if (err) {
          return res.render("login", { success: false, msg: err });
        }
      }
    );
    let user = await Users.findOne({ username: username });
    if (user.status == "destroy") {
      return res.render("login", {
        success: false,
        msg: "tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008",
      });
    }
    req.session.isloginged = true;
    return res.redirect("/");
  }

  async userRegister(req, res, next) {
    let imagesCM = req.files;
    let name = req.body.username.trim();
    let email = req.body.email.trim();
    let birthdate = req.body.birthdate.toString();
    let address = req.body.address.trim();
    let phonenumber = req.body.phonenumber;
    let frontImageCM = imagesCM.frontImage[0];
    let backImageCM = imagesCM.backImage[0];
    let username = Math.random() * (9999999999 - 1000000000) + 1000000000;
    while (supF.checkUserExist(username)) {
      username = Math.random() * (9999999999 - 1000000000) + 1000000000;
    }
    username = parseInt(username);
    let temp = supF.makePassword();
    let newDir = "./public/images/" + username + "/";
    let pathFrontImageMongoose =
      "/images/" + username + "/" + frontImageCM.originalname;
    let pathBackImageMongoose =
      "/images/" + username + "/" + backImageCM.originalname;
    fs.mkdirSync(newDir);
    if (fs.existsSync(newDir)) {
      fs.renameSync(
        frontImageCM.path,
        newDir + frontImageCM.originalname,
        function (err) {
          if (err) return res.status(500).json({ success: false, msg: err });
        }
      );
      fs.renameSync(
        backImageCM.path,
        newDir + backImageCM.originalname,
        function (err) {
          if (err) return res.status(500).json({ success: false, msg: err });
        }
      );
    }

    await bcrypt.hash(temp, saltRounds).then(function (hash) {
      if (!hash) {
        req.session.msg = "Có lỗi khi trong quá trình đăng kí";
        return res.json({
          success: false,
        });
      }
      let us = new Users({
        roles: "user",
        username: username,
        password: hash,
        phone: phonenumber,
        email: email,
        fullname: name,
        balance: 0,
        address: address,
        birthday: birthdate,
        cmndfront: pathFrontImageMongoose,
        cmndback: pathBackImageMongoose,
        countlogin: 0,
        countFailed: 0,
        status: "waitConfirm",
        timeswithdrawal: {
          date: 0,
          times: 0,
        },
      });
      us.save((err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, msg: "Đăng kí thất bại" });
        }
        console.log(process.env.GMAIL);
        console.log(process.env.PASS);

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL,
            pass: process.env.PASS,
          },
        });

        var mailOptions = {
          from: process.env.GMAIL,
          to: email,
          subject: "E-WALLET - Tạo tài khoản thành công",
          text: `Thông tin tài khoản của bạn:
                  Tên người dùng: ${username}
                  Mật khẩu: ${temp}
              `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        req.session.notify = true;
        return res.status(200).redirect("/notifys/register");
      });
    });
  }

  userLogout(req, res) {
    res.clearCookie("access_token");
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  }

  userChangePassWordFirstTime(req, res, next) {
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const username = req.session.user.username;
    if (newPassword.length < 6 || confirmPassword.length < 6)
      return res.render("firstlogin", {
        msg: "Mật khẩu phải là một chuỗi gồm 6 ký tự trở lên",
      });
    if (newPassword != confirmPassword)
      return res.render("firstlogin", {
        msg: "Mật khẩu nhập lại không trùng khớp",
      });
    bcrypt.hash(newPassword, saltRounds, function (error, hash) {
      if (error) {
        return res.json({
          username: username,
          success: false,
          msg: "Đổi mật khẩu thất bại",
        });
      }
      Users.updateOne(
        { username: username },
        { $set: { password: hash, countlogin: 1 } },
        (err, status) => {
          if (err) {
            console.log(err);
            return res.json({
              username: username,
              success: false,
              msg: "Đổi mật khẩu thất bại",
            });
          }
          return res.redirect("/");
        }
      );
    });
  }

  detailUser(req, res, next) {
    let status = "";
    let icon = "";
    let isUpdate = false;
    let user = supF.mongooseToObject(req.session.user);
    if (user.status == "waitConfirm") {
      status = "Đang chờ xác nhận";
      icon = `<i class="bi bi-hourglass-split img-account-profile-wait"></i>`;
    } else if (user.status == "waitUpdate") {
      status = "Cập nhật CMND/CCCD";
      icon = `<i class="bi bi-box-arrow-in-down img-account-profile-update"></i>`;
      isUpdate = true;
    } else {
      status = "Tài khoản đã xác minh";
      icon = `<i class="bi bi bi-check-circle-fill img-account-profile-success"></i>`;
    }

    return res.render("profile", {
      ...user,
      layout: false,
      status: status,
      icon: icon,
      isUpdate: isUpdate,
    });
  }

  indexChangePassword(req, res, next) {
    let user = supF.mongooseToObject(req.session.user);
    return res.render("changePassword", { ...user, layout: false });
  }

  validationChangePassword(req, res, next) {
    let user = supF.mongooseToObject(req.session.user);
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    bcrypt.compare(oldPassword, user.password).then(function (result) {
      if (result) {
        if (newPassword.length < 6 || confirmPassword.length < 6)
          return res.render("changePassword", {
            msg: "Mật khẩu mới phải là một chuỗi gồm 6 ký tự trở lên",
            ...user,
            layout: false,
          });
        if (newPassword != confirmPassword)
          return res.render("changePassword", {
            msg: "Mật khẩu xác nhận không trùng khớp",
            ...user,
            layout: false,
          });
        next();
      } else
        return res.render("changePassword", {
          msg: "Mật khẩu hiện tại không chính xác",
          ...user,
          layout: false,
        });
    });
  }

  userChangePassword(req, res, next) {
    let user = req.session.user;
    const newPassword = req.body.newPassword;

    bcrypt.hash(newPassword, saltRounds, function (error, hash) {
      if (error) {
        return res.json({
          username: user.username,
          success: false,
          msg: "Đổi mật khẩu thất bại",
        });
      }
      Users.updateOne(
        { username: user.username },
        { $set: { password: hash } },
        (err, status) => {
          if (err) {
            console.log(err);
            return res.json({
              username: user.username,
              success: false,
              msg: "Đổi mật khẩu thất bại",
            });
          }
          req.session.notify = true;
          return res.redirect("/notifys/changepassword");
        }
      );
    });
  }

  indexUpdateCM(req, res, next) {
    let user = supF.mongooseToObject(req.session.user);
    return res.render("updateCM", { ...user, layout: false });
  }

  validationUpdateCM(req, res, next) {
    let msg = "";
    let user = supF.mongooseToObject(req.session.user);
    let imagesCM = req.files;
    let frontImageCM = imagesCM.frontImage[0];
    let backImageCM = imagesCM.backImage[0];
    let checkfrontImage = supF.isImage(frontImageCM.originalname);
    let checkbackImage = supF.isImage(backImageCM.originalname);

    if (!checkfrontImage || !checkbackImage) {
      msg = checkfrontImage
        ? "Ảnh mặt sau "
        : "Ảnh mặt trước " +
          "không hợp lệ, chỉ hỗ trợ các loại ảnh gif,jpg,jpeg,tiff,png";
    } else if (frontImageCM.size > 20480000 || backImageCM.size > 20480000) {
      msg =
        frontImageCM.size > 20480000
          ? "Ảnh mặt sau "
          : "Ảnh mặt trước " + "không hợp lệ, chỉ hỗ trợ ảnh dưới 20MB";
    }
    if (msg) {
      fs.rmSync("./public/images/" + frontImageCM.filename);
      fs.rmSync("./public/images/" + backImageCM.filename);
      return res.render("updateCM", {
        success: false,
        msg: msg,
        layout: false,
        ...user,
      });
    }
    next();
  }

  userUpdateCM(req, res, next) {
    let user = req.session.user;
    let imagesCM = req.files;
    let frontImageCM = imagesCM.frontImage[0];
    let backImageCM = imagesCM.backImage[0];
    let dir = "./public/images/" + user.username;
    let newPathFrontImageCM = dir + "/" + frontImageCM.originalname;
    let newPathBackImageCM = dir + "/" + backImageCM.originalname;
    let pathFrontImageMongoose =
      "/images/" + user.username + "/" + frontImageCM.originalname;
    let pathBackImageMongoose =
      "/images/" + user.username + "/" + backImageCM.originalname;
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true });
      fs.mkdirSync(dir);
      if (fs.existsSync(dir)) {
        fs.renameSync(frontImageCM.path, newPathFrontImageCM, function (err) {
          if (err) return res.status(500).json({ success: false, msg: err });
        });
        fs.renameSync(backImageCM.path, newPathBackImageCM, function (err) {
          if (err) return res.status(500).json({ success: false, msg: err });
        });
        if (
          fs.existsSync(newPathFrontImageCM) &&
          fs.existsSync(newPathBackImageCM)
        ) {
          Users.updateOne(
            { username: user.username },
            {
              $set: {
                cmndfront: pathFrontImageMongoose,
                cmndback: pathBackImageMongoose,
                status: "waitConfirm",
              },
            },
            (err, status) => {
              if (err) {
                console.log(err);
                return res.json({
                  username: user.username,
                  success: false,
                  msg: "Cập nhật ảnh chứng minh thất bại",
                });
              }
              req.session.notify = true;
              return res.redirect("/notifys/updateCM");
            }
          );
        }
      }
    }
  }

  indexForgetEmail(req, res, next) {
    if (req.session.isloginged) {
      return res.redirect("/");
    }
    return res.render("forgetEmail");
  }

  userForgetEmail(req, res, next) {
    let email = req.body.email;
    Users.findOne({ email: email }, (err, user) => {
      if (err) return res.json({ msg: err });
      if (!err && !user)
        return res.render("forgetEmail", {
          msg: "Không tồn tại tài khoản này, vui lòng nhập đúng email",
        });
      let otp = Math.random() * (999999 - 100000) + 100000;
      otp = parseInt(otp);
      console.log(process.env.GMAIL);
      console.log(process.env.PASS);

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL,
          pass: process.env.PASS,
        },
      });

      var mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "E-WALLET - MÃ OTP KHÔI PHỤC MẬT KHẨU",
        text: `OTP CODE: ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          req.session.otp = otp;
          req.session.email = email;
          var OTPtime = setTimeout(function () {
            delete req.session.otp;
            req.session.save();
            console.log(`${otp} đã hết hạn`);
          }, 60000);
          return res.redirect("/users/otpChangePW");
        }
      });
    });
  }

  indexOTP(req, res, next) {
    let email = req.session.email;
    if (req.session.isloginged) {
      return res.redirect("/");
    }
    if (req.session.otp) return res.render("codeOTP", { email: email });
    else return res.redirect("/users/login");
  }

  userEnterOTP(req, res, next) {
    let ot1 = req.body.otp1;
    let ot2 = req.body.otp2;
    let ot3 = req.body.otp3;
    let ot4 = req.body.otp4;
    let ot5 = req.body.otp5;
    let ot6 = req.body.otp6;
    let otp = ot1 + ot2 + ot3 + ot4 + ot5 + ot6;
    otp = parseInt(otp);
    if (!req.session.otp) {
      return res.render("codeOTP", { msg: "Mã OTP đã hết hạn" });
    }
    if (otp != req.session.otp) {
      return res.render("codeOTP", { msg: "Mã OTP không chính xác" });
    }
    req.session.notify = true;
    return res.redirect("/users/resetPasswordOTP");
  }

  indexResetPasswordOTP(req, res, next) {
    if (req.session.isloginged) {
      return res.redirect("/");
    }
    if (req.session.otp) return res.render("resetpasswordOTP");
    else return res.redirect("/users/login");
  }

  userResetPasswordOTP(req, res, next) {
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let email = req.session.email;
    if (newPassword.length < 6 || confirmPassword.length < 6)
      return res.render("firstlogin", {
        msg: "Mật khẩu phải là một chuỗi gồm 6 ký tự trở lên",
      });
    if (newPassword != confirmPassword)
      return res.render("firstlogin", {
        msg: "Mật khẩu nhập lại không trùng khớp",
      });
    bcrypt.hash(newPassword, saltRounds, function (error, hash) {
      if (error) {
        return res.json({
          email: email,
          success: false,
          msg: "Đổi mật khẩu thất bại",
        });
      }
      Users.updateOne(
        { email: email },
        { $set: { password: hash, countlogin: 1 } },
        (err, status) => {
          if (err) {
            console.log(err);
            return res.json({
              email: email,
              success: false,
              msg: "Đổi mật khẩu thất bại",
            });
          }
          return res.redirect("/notifys/changepasswordOTP");
        }
      );
    });
  }

  validationRecharge(req, res, next) {
    let msg = "";
    let user = supF.mongooseToObject(req.session.user);
    let listCardNumber = [111111, 222222, 333333];
    let listEXP = ["10/10/2022", "11/11/2022", "12/12/2022"];
    let listCVV = [411, 443, 577];
    let cardNumber = req.body.cardNumber;
    cardNumber = parseInt(cardNumber);
    let exp = req.body.expiry;
    let dateEXP = exp.toString().split("-");
    let expDate = dateEXP[2] + "/" + dateEXP[1] + "/" + dateEXP[0];
    let CVV = req.body.codeCVV;
    let cardNumberIndex = listCardNumber.indexOf(cardNumber);
    let expIndex = listEXP.indexOf(expDate);
    let cvvIndex = listCVV.indexOf(parseInt(CVV));
    if (
      isNaN(cardNumber) ||
      cardNumber.toString().length < 6 ||
      cardNumber.toString().length > 6
    ) {
      msg = "Vui lòng nhập đúng định dạng card, bao gồm 6 chữ số";
    } else if (cardNumber.toString().length == 6) {
      if (cardNumberIndex == -1) {
        msg = "Thẻ này không được hỗ trợ";
      } else if (expIndex != cardNumberIndex) {
        msg = "Ngày hết hạn không trùng khớp với thẻ vừa nhập";
      } else if (cvvIndex != cardNumberIndex) {
        msg = "Thông tin mã CVV không trùng khớp với thẻ vừa nhập";
      }
    }
    if (msg) {
      return res.render("recharge", {
        layout: false,
        ...user,
        msg: msg,
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    } else {
      next();
    }
  }

  userRecharge(req, res, next) {
    let amountMoney = req.body.money;
    let user = supF.mongooseToObject(req.session.user);
    let listCardNumber = [111111, 222222, 333333];
    let cardNumber = req.body.cardNumber;
    cardNumber = parseInt(cardNumber);
    let cardNumberIndex = listCardNumber.indexOf(cardNumber);
    let codeTransaction =
      Math.random() * (99999999999 - 10000000000) + 10000000000;
    let afterBalance = user.balance + parseFloat(amountMoney);
    if (parseFloat(amountMoney) <= 0)
      return res.render("recharge", {
        layout: false,
        ...user,
        msg: "Vui lòng nhập số tiền hợp lệ",
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    if (cardNumberIndex == 1 && parseFloat(amountMoney) > 1000000)
      return res.render("recharge", {
        ...user,
        layout: false,
        msg: "Bạn chỉ có thể nạp 1 triệu mỗi lần với thẻ này",
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    if (cardNumberIndex == 2)
      return res.render("recharge", {
        ...user,
        layout: false,
        msg: "Thẻ hết tiền",
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    Users.updateOne(
      { username: user.username },
      { $set: { balance: afterBalance } },
      function (err, status) {
        if (err) {
          return res.json({
            username: user.username,
            success: false,
            msg: "Nạp tiền thất bại",
          });
        }
        let history = new History({
          codeID: parseInt(codeTransaction).toString(),
          typeTransaction: "Nạp tiền",
          email: user.email,
          status: "Thành công",
          fee: 0,
          balance: parseFloat(amountMoney),
          message: `Tài khoản của bạn đã được nạp vào ${parseFloat(
            amountMoney
          )} số dư hiện tại của bạn là ${afterBalance}`,
          currentBalance: afterBalance,
          Other: null,
        });
        history
          .save()
          .then(function (history) {
            return res.redirect("/");
          })
          .catch(function (err) {
            return res.json({ error: err });
          });
      }
    );
  }

  validationWithdrawal(req, res, next) {
    let msg = "";
    let user = supF.mongooseToObject(req.session.user);
    let withdrawalMoney = req.body.withdrawal;
    let listCardNumber = [111111, 222222, 333333];
    let listEXP = ["10/10/2022", "11/11/2022", "12/12/2022"];
    let listCVV = [411, 443, 577];
    let cardNumber = req.body.cardNumber;
    cardNumber = parseInt(cardNumber);
    let exp = req.body.expiry;
    let dateEXP = exp.toString().split("-");
    let expDate = dateEXP[2] + "/" + dateEXP[1] + "/" + dateEXP[0];
    let CVV = req.body.codeCVV;
    let cardNumberIndex = listCardNumber.indexOf(cardNumber);
    let expIndex = listEXP.indexOf(expDate);
    let cvvIndex = listCVV.indexOf(parseInt(CVV));

    if (
      isNaN(cardNumber) ||
      cardNumber.toString().length < 6 ||
      cardNumber.toString().length > 6
    ) {
      msg = "Vui lòng nhập đúng định dạng card, bao gồm 6 chữ số";
    } else if (cardNumber.toString().length == 6) {
      if (cardNumberIndex == -1) {
        msg = "Thông tin thẻ không hợp lệ";
      } else if (cardNumberIndex == 2 || cardNumberIndex == 3) {
        msg = "Thẻ này không được hỗ trợ để rút tiền";
      } else if (expIndex != cardNumberIndex) {
        msg = "Ngày hết hạn không trùng khớp với thẻ vừa nhập";
      } else if (cvvIndex != cardNumberIndex) {
        msg = "Thông tin mã CVV không trùng khớp với thẻ vừa nhập";
      } else if (
        parseFloat(withdrawalMoney) % 50000 != 0 ||
        parseFloat(withdrawalMoney) <= 0
      ) {
        msg = "Số tiền rút phải là bội số của 50000 VND và hợp lệ";
      }
    }
    if (user.balance <= parseFloat(withdrawalMoney)) {
      msg = "Số dư tài khoản phải lớn hơn số tiền cần chuyển 5% VND";
    }
    if (msg) {
      return res.render("withdrawal", { ...user, msg: msg, layout: false });
    } else {
      let currentDate = new Date().getDate();
      Users.findOne({ username: user.username })
        .then(function (user) {
          if (
            user.timeswithdrawal.times >= 2 &&
            user.timeswithdrawal.date == currentDate
          )
            return res.render("withdrawal", {
              msg: "Bạn chỉ được rút tiền tối đa 2 lần trong ngày",
              ...user,
              layout: false,
            });
          else if (user.timeswithdrawal.date <= currentDate) {
            Users.updateOne(
              { username: user.username },
              { $set: { timeswithdrawal: { times: 0, date: currentDate } } }
            )
              .then((user) => {
                next();
              })
              .catch((err) => res.json({ error: err }));
          }
        })
        .catch((err) => res.json({ error: err }));
    }
  }

  userWithdrawal(req, res, next) {
    let user = req.session.user;
    let note = req.body.note;
    let withdrawalMoney = req.body.withdrawal;
    withdrawalMoney = parseInt(withdrawalMoney);
    let fee = (withdrawalMoney * 5) / 100;
    let times = user.timeswithdrawal.times;
    let afterMoney = user.balance - (withdrawalMoney + fee);
    let codeTransaction =
      Math.random() * (99999999999 - 10000000000) + 10000000000;
    let history = new History({
      codeID: parseInt(codeTransaction).toString(),
      typeTransaction: "Rút tiền",
      email: user.email,
      status: withdrawalMoney > 5000000 ? "Đang chờ duyệt" : "Thành công",
      fee: fee,
      balance: withdrawalMoney,
      message: `${note}`,
      currentBalance: afterMoney,
      Other: null,
    });
    if (withdrawalMoney <= 5000000) {
      Users.updateOne(
        { username: user.username },
        {
          $set: {
            balance: afterMoney,
            timeswithdrawal: { times: times + 1, date: new Date().getDate() },
          },
        }
      )
        .then((user) => {
          history
            .save()
            .then(function (history) {
              return res.redirect("/");
            })
            .catch(function (err) {
              return res.json({ error: err });
            });
        })
        .catch(function (err) {
          return res.json({ error: err });
        });
    } else {
      history
        .save()
        .then(function (history) {
          return res.redirect("/");
        })
        .catch(function (err) {
          return res.json({ error: err });
        });
    }
  }

  getPhoneNumer(req, res, next) {
    let users = req.session.user;
    let phone = req.body.post;
    Users.findOne({ phone: phone })
      .then((user) => {
        if (!user) {
          return res.json({ name: "Số điện thoại không chính xác" });
        }
        if (user) return res.json({ name: user.fullname });
      })
      .catch((err) => res.json({ msg: err }));
  }

  getFee(req, res, next) {
    let fee = (parseInt(req.body.post) * 5) / 100;
    return res.json({ fee: fee > 0 ? fee : fee * -1 });
  }

  async usersendTransfers(req, res, next) {
    let msg = "";
    let user = supF.mongooseToObject(req.session.user);
    let phone = req.body.phone;
    let money = req.body.money;
    let note = req.body.note;
    let sideFee = req.body.sideFee;
    let fee = (parseInt(money) * 5) / 100;
    let order = {
      phone: phone,
      money: money,
      note: note,
      sideFee: sideFee,
      fee: fee,
    };
    let users = await Users.findOne({ phone: phone });
    if (!users) {
      msg = "Số điện thoại không chính xác";
    } else if (user.phone == phone) {
      msg = "Số điện thoại không phù hợp";
    } else if (user.balance <= money) {
      msg = "Số dư tài khoản phải lớn hơn số tiền cần chuyển 5% VND";
    } else if (parseFloat(money) % 10000 != 0 || parseFloat(money) <= 0) {
      msg = "Số tiền chuyển phải là bội số của 10000 VND và hợp lệ";
    }
    if (msg) {
      return res.render("transfer", { ...user, msg: msg, layout: false });
    } else {
      let otp = Math.random() * (999999 - 100000) + 100000;
      otp = parseInt(otp);
      console.log(process.env.GMAIL);
      console.log(process.env.PASS);

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL,
          pass: process.env.PASS,
        },
      });

      var mailOptions = {
        from: process.env.GMAIL,
        to: user.email,
        subject: "E-WALLET - MÃ OTP XÁC NHẬN CHUYỂN TIỀN",
        text: `OTP CODE: ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          req.session.otp = otp;
          req.session.order = order;
          var OTPtime = setTimeout(function () {
            delete req.session.otp;
            req.session.save();
            console.log(`${otp} đã hết hạn`);
          }, 60000);
          return res.redirect("/users/transferOTP");
        }
      });
    }
  }

  indexTransferOTP(req, res, next) {
    if (!req.session.otp) {
      delete req.session.order;
      req.session.save();
      return res.render("/");
    }
    let user = supF.mongooseToObject(req.session.user);
    return res.render("codeTranfersOTP", { ...user });
  }

  async userEnterTransferOTP(req, res, next) {
    let order = req.session.order;
    let user = supF.mongooseToObject(req.session.user);
    let fullname = user.fullname;
    let codeTransaction =
      Math.random() * (99999999999 - 10000000000) + 10000000000;
    let ot1 = req.body.otp1;
    let ot2 = req.body.otp2;
    let ot3 = req.body.otp3;
    let ot4 = req.body.otp4;
    let ot5 = req.body.otp5;
    let ot6 = req.body.otp6;
    let otp = ot1 + ot2 + ot3 + ot4 + ot5 + ot6;
    let afterMoneySend = 0;
    let afterMoneyReceive = 0;
    let users = await Users.findOne({ phone: order.phone });
    if (order.sideFee == "send") {
      afterMoneySend =
        user.balance - (parseInt(order.money) + parseInt(order.fee));
      console.log(afterMoneySend);
      afterMoneyReceive = users.balance + parseInt(order.money);
    } else {
      afterMoneySend = user.balance - parseInt(order.money);
      afterMoneyReceive =
        users.balance + (parseInt(order.money) - parseInt(order.fee));
    }
    otp = parseInt(otp);
    if (!req.session.otp) {
      delete req.session.order;
      req.session.save();
      return res.render("codeTranfersOTP", { msg: "Mã OTP đã hết hạn" });
    }
    if (otp != req.session.otp) {
      return res.render("codeTranfersOTP", { msg: "Mã OTP không chính xác" });
    }
    req.session.notify = true;
    let history = new History({
      codeID: parseInt(codeTransaction).toString(),
      typeTransaction: "Chuyển tiền",
      user_re_email: users.email,
      email: user.email,
      status: order.money > 5000000 ? "Đang chờ duyệt" : "Thành công",
      fee: order.fee,
      balance: order.money,
      message: `${order.note}`,
      currentBalance: afterMoneySend,
      side: order.sideFee,
      Other: null,
    });
    if (order.money <= 5000000) {
      Users.updateOne(
        { username: user.username },
        { $set: { balance: afterMoneySend } }
      )
        .then((user) => {
          Users.updateOne(
            { phone: order.phone },
            { $set: { balance: afterMoneyReceive } }
          ).then((user) => {
            Users.findOne({ phone: order.phone }).then((user) => {
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.GMAIL,
                  pass: process.env.PASS,
                },
              });

              var mailOptions = {
                from: process.env.GMAIL,
                to: user.email,
                subject: "E-WALLET - NHẬN TIỀN",
                text: `Bạn đã nhận được số tiền : ${order.money} VND từ ${fullname}, phí dịch vụ là: ${order.fee}`,
              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  history
                    .save()
                    .then(function (history) {
                      return res.redirect("/notifys/transfer");
                    })
                    .catch(function (err) {
                      return res.json({ error: err });
                    });
                }
              });
            });
          });
        })
        .catch(function (err) {
          return res.json({ error: err });
        });
    } else {
      history
        .save()
        .then(function (history) {
          return res.redirect("/notifys/transfer");
        })
        .catch(function (err) {
          return res.json({ error: err });
        });
    }
  }

  userBuyNumberCard(req, res, next) {
    let user = supF.mongooseToObject(req.session.user);
    let email = user.email;
    let infoOrderCard = req.body;
    let nameCard = infoOrderCard.nameCard;
    let priceCard = infoOrderCard.priceCard;
    let listBuyCard = [];
    let numberCard = parseInt(infoOrderCard.numberCard);
    let feeBuy = parseInt(priceCard) * numberCard;
    let afterMoney = user.balance - feeBuy;
    let codeCard = 0;
    let codeTransaction =
      Math.random() * (99999999999 - 10000000000) + 10000000000;
    codeTransaction = parseInt(codeTransaction);
    if (nameCard == "") {
      return res.json({ msg: "Vui lòng chọn loại thẻ" });
    }
    if (infoOrderCard.priceCard == "") {
      return res.json({ msg: "Vui lòng chọn giá thẻ" });
    }
    if (nameCard == "viettel") {
      codeCard = 11111;
    } else if (nameCard == "mobifone") {
      codeCard = 22222;
    } else {
      codeCard = 33333;
    }
    if (user.balance < feeBuy) {
      return res.json({ msg: "Số dư tài khoản không đủ" });
    }
    for (let i = 0; i < numberCard; i++) {
      let codeBuyCard = Math.random() * (99999 - 10000) + 10000;
      let code = codeCard.toString() + parseInt(codeBuyCard).toString();
      listBuyCard.push(code);
    }
    let orderBuyCard = {
      codeTransaction: codeTransaction,
      status: "Thành công",
      nameCard: nameCard,
      quantity: numberCard,
      sumFeeBuy: feeBuy,
      listBuyCard: listBuyCard,
    };
    Users.updateOne({ user: user.username }, { $set: { balance: afterMoney } })
      .then((user) => {
        let history = new History({
          codeID: codeTransaction,
          typeTransaction: "Mua thẻ",
          email: email,
          status: "Thành công",
          fee: 0,
          balance: feeBuy,
          message: "Bạn đã mua thẻ thành công",
          currentBalance: afterMoney,
          Other: {
            codePhone: listBuyCard,
            nameTelecom: nameCard,
            price: priceCard,
          },
        });
        history
          .save()
          .then((result) => {
            return res.json({ order: orderBuyCard });
          })
          .catch((error) => {
            return res.json({ err: error });
          });
      })
      .catch((error) => {
        return res.json({ err: error });
      });
  }

  indexHistory(req, res, next) {
    let user = supF.mongooseToObject(req.session.user);
    History.find({ email: user.email }).then((histories) => {
      let history = supF.mutipleMongooseToObject(histories);
      return res.render("history", {
        histories: history,
        layout: false,
        ...user,
      });
    });
  }
}
module.exports = new userController();
