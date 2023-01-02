var express = require('express');
var authenticateToken = require("../apis/token");
var notifyController = require("../controller/notifyController");
var router = express.Router();
var cookieParser = require('cookie-parser');

router.use(cookieParser());

router.get("/register", notifyController.indexNotifyRegister);
router.get("/changepassword", notifyController.indexNotifyChangePassword);
router.get("/changepasswordOTP", notifyController.indexNotifyChangePasswordOTP);
router.get("/updateCM", authenticateToken, notifyController.indexNotifyUpdateCM);
router.get("/transfer", authenticateToken, notifyController.indexNotifyTransfer);
module.exports = router;