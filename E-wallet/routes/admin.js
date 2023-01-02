var express = require("express");
var cookieParser = require("cookie-parser");
var router = express.Router();
router.use(cookieParser());
var adminController = require("../controller/adminController");


router.get('/viewUser/:username', adminController.indexUser);
router.get('/', (req, res, next) => {
    if(!req.cookies.access_admin) return res.redirect('users/logout');
    return res.redirect('/admin/waitConfirm');
})
router.put('/destroy', adminController.destroyUser);
router.put('/update', adminController.updateUser);
router.put('/accept', adminController.acceptUser);
router.put('/unlock', adminController.unlockUser);
router.put('/acceptWithdraw', adminController.updateWithdraw);
router.put('/acceptTransfer', adminController.updateTransfer);

router.get('/:status', adminController.indexAdmin);
module.exports = router;
