const express = require('express')
const router = express.Router()
const controller = require('../controller/groupInvestment/group.controller');
const validate = require('../validations/groupInvestment/group.validation')
const auth = require('../middleware/auth')

router.post('/create', auth.checkAuth, validate.create, controller.create)
router.get('/get-all-data', auth.checkAuth, validate.getAllData, controller.getAllData)
router.get('/group-overview', auth.checkAuth, validate.groupOverview, controller.groupOverview)
router.get('/dashboard', auth.checkAuth, controller.dashBoard)
router.put('/update', auth.checkAuth, validate.update, controller.update)
router.put('/update-monthly-target', auth.checkAuth, validate.updateMonthlyTarget, controller.updateMonthlyTarget)

module.exports = router