var express = require("express");
const multer = require('multer');
const upload = multer({ dest: './public/images/' });
var authenticateToken = require("../apis/token");
var cookieParser = require("cookie-parser");
var router = express.Router();
router.use(cookieParser());
var userController = require("../controller/userController");
const cpUpload = upload.fields([{ name: 'frontImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }]);

// User Login
router.get("/login", userController.indexLogin);
router.post('/login', userController.validationLogin, userController.userLogin);

// User Register
router.get("/register", userController.indexRegister);
router.post(
  "/register",
  cpUpload,
  userController.validationRegister,
  userController.userRegister
);

//User change password first time
router.post('/changePassWordFirstTime', userController.userChangePassWordFirstTime);

// User Logout
router.get('/logout', userController.userLogout);

// User's Profile
router.get('/profile', authenticateToken, userController.detailUser);

//User change password
router.get('/changePassword', authenticateToken, userController.indexChangePassword);
router.post('/changePassword', authenticateToken, userController.validationChangePassword, userController.userChangePassword);

// User update CM
router.get('/updateCM', authenticateToken, userController.indexUpdateCM);
router.post('/updateCM', authenticateToken, cpUpload, userController.validationUpdateCM, userController.userUpdateCM);

// User History
router.get('/history', authenticateToken, userController.indexHistory);

//User forget password
router.get('/forgetEmail', userController.indexForgetEmail);
router.post('/forgetEmail', userController.userForgetEmail);
router.get('/otpChangePW', userController.indexOTP);
router.post('/otpChangePW', userController.userEnterOTP);
router.get('/resetPasswordOTP', userController.indexResetPasswordOTP);
router.post('/resetPasswordOTP', userController.userResetPasswordOTP);

// User recharge
router.post('/recharge', authenticateToken, userController.validationRecharge, userController.userRecharge);

// User tranfers 
router.post('/phonenumber', authenticateToken, userController.getPhoneNumer);
router.post('/fee', authenticateToken, userController.getFee);
router.post('/transfer', authenticateToken, userController.usersendTransfers);
router.get('/transferOTP', authenticateToken, userController.indexTransferOTP);
router.post('/transferOTP', authenticateToken, userController.userEnterTransferOTP);

//User withdrawal
router.post('/withdrawal', authenticateToken, userController.validationWithdrawal, userController.userWithdrawal);

router.post('/buycard', authenticateToken, userController.userBuyNumberCard);
module.exports = router;
