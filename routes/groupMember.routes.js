const express = require('express')
const router = express.Router()
const controller = require('../controller/groupInvestment/groupMember.controller');
const validate = require('../validations/groupInvestment/groupMember.validation')
const auth = require('../middleware/auth')

router.post('/inviteMembers', auth.checkAuth, validate.inviteMembers, controller.inviteMembers)
router.post('/inviteResponse', auth.checkAuth, validate.inviteResponse, controller.respondToGroupInvite)
router.get('/get-all-data', auth.checkAuth, validate.getAllData, controller.getAllData)
router.get('/get-notifications', auth.checkAuth, validate.getAllData, controller.getNotification)
router.get('/member-transaction-details', auth.checkAuth, validate.memberAmountDetails, controller.memberAmountDetails)
router.put('/update', auth.checkAuth, validate.update, controller.update)

module.exports = router