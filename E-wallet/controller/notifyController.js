var supF = require("../untils/supportFunction");

class notifyController {
  indexNotifyRegister(req, res, next) {
    if (req.session.notify) {
      req.session.notify = false;
      return res.render("notify");
    }
    return res.redirect("/");
  }
  indexNotifyChangePassword(req, res, next) {
    if (req.session.notify) {
      let user = req.session.user;
      req.session.notify = false;
      return res.render("notifyCP", {
        ...user,
        layout: false,
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    }
    return res.redirect("/");
  }

  indexNotifyUpdateCM(req, res, next) {
    if (req.session.notify) {
      let user = supF.mongooseToObject(req.session.user);
      req.session.notify = false;
      return res.render("notifyUD", {
        ...user,
        layout: false,
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    }
    return res.redirect("/");
  }
  indexNotifyChangePasswordOTP(req, res, next) {
    if (req.session.notify) {
      let user = supF.mongooseToObject(req.session.user);
      req.session.notify = false;
      return res.render("notifyOTP", { ...user });
    }
    return res.redirect("/");
  }

  indexNotifyTransfer(req, res, next) {
    if (req.session.notify) {
      let user = supF.mongooseToObject(req.session.user);
      req.session.notify = false;
      return res.render("notifyTransfer", {
        ...user,
        layout: false,
        confirm:
          user.status != "confirmed"
            ? { msg: "Chờ xác minh", status: "warning" }
            : { msg: "Đã xác minh", status: "success" },
      });
    }
    return res.redirect("/");
  }
}

module.exports = new notifyController();
