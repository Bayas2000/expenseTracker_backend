const express = require('express');
const router = express.Router();
const controller = require('../controller/user.controller');
const validate = require('../validations/user.valid')
const auth = require('../middleware/auth')

router.post('/signup', validate.signup, controller.signup);
router.post('/login', validate.login, controller.login);
router.get('/get-user', auth.checkAuth, controller.userDetails);
router.post('/logout', auth.checkAuth, controller.logOut)
router.put('/update-profile', validate.updateProfile, auth.checkAuth, controller.updateProfile)
module.exports = router;
