const express = require('express');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const transactionRoutes = require('./transaction.routes');
const budgetRoutes = require('./budget.routes');
const fileUploadRoutes = require('./fileUpload.routes');
const recurringRoutes = require('./recurring.routes');


//Group Investment 
const groupRoutes = require('../routes/group.routes')
const groupMemberRoutes = require('../routes/groupMember.routes')
const investmentRoutes = require('../routes/investment.routes')
const goldPriceRoutes = require('../routes/goldPrice.routes')

module.exports = (app) => {
    app.use('/userAuth', userRoutes)
    app.use('/category', categoryRoutes)
    app.use('/transaction', transactionRoutes)
    app.use('/budget', budgetRoutes)
    app.use('/fileUpload', fileUploadRoutes)
    app.use('/recurring', recurringRoutes)

    //Group Investment
    app.use('/group', groupRoutes)
    app.use('/groupMember', groupMemberRoutes)
    app.use('/investment', investmentRoutes)
    app.use('/goldPrice', goldPriceRoutes)

}


