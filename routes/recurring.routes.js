const express = require('express')
const router = express.Router()
const controller = require('../controller/recurring.controller');
const validate = require('../validations/recurring.validation')
const auth = require('../middleware/auth')

router.post('/create', auth.checkAuth, validate.create, controller.create)
router.get('/get-all-data', auth.checkAuth, validate.getAllData, controller.getAllData)
router.put('/update', auth.checkAuth, validate.update, controller.update)
router.put('/update-status', auth.checkAuth, validate.update, controller.delete)

module.exports = router