var User = require("../model/user");
const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  let paths = [
    "/recharge",
    "/withdrawal",
    "/tranfers",
    "/cards",
    "/changePassword",
    "/history",
    "/transferOTP",
  ];
  const reqToken = req.cookies.access_token;
  const token = reqToken && reqToken.split(" ")[1];

  if (token == null) return res.redirect("/users/login");

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).redirect("/users/login");
    User.findOne({ email: user.email }, (error, user) => {
      if (error) {
        return res.json({ success: false, msg: error });
      }
      if (!error && !user) {
        return res.json({
          success: false,
          msg: "Email xác thực token không chính xác",
        });
      }
      if (user.status == "destroy") return res.redirect("users/logout");
      req.session.user = user;
      req.session.save();
      if (user.countlogin === "0") {
        return res.render("firstlogin");
      }
      if (
        (user.status == "waitConfirm" || user.status == "waitUpdate") &&
        paths.includes(req.url)
      ) {
        req.session.msg =
          "Tính năng này chỉ dành cho các tài khoản đã được xác minh";
        return res.redirect("/");
      }
      next();
    });
  });
}
module.exports = authenticateToken;
