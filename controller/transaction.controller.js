const { default: mongoose } = require('mongoose')
const response = require('../helper/response')
const transactionService = require('../service/transaction.service')
const { getDateFilter } = require('../helper/commonFunctions')
const moment = require('moment')
const transactionModel = require('../models/transaction.model')
const { Types } = mongoose
const { ObjectId } = Types

module.exports.create = async (req, res) => {
    try {
        const { ...inputData } = req.body
        const result = await transactionService.create(req, inputData)
        if (result._id) {
            response.successResponse(res, 'Expenses Created SuccessFully', result)
        } else return response.errorResponse(res, 'Expenses Creation Failed')
    } catch (error) {
        console.error('Controller Expenses Error:', error);
        response.catchError(res, 'Catch Error In Expenses', error.message)
    }
}

module.exports.getAllData = async (req, res) => {
    try {
        const { categoryId, searchFilter, dateFilter } = req.query
        const userId = req.userId
        let categoryIds = [];
        let filterDate = {};

        if (dateFilter) {
            const currentDate = moment().startOf('day')
            if (dateFilter === 'today') {
                filterDate = {
                    transactionDate: {
                        $gte: currentDate.toDate(),
                        $lte: moment(currentDate).endOf('day').toDate()
                    }
                }
            } else if (dateFilter === 'yesterday') {
                filterDate = {
                    transactionDate: {
                        $gte: moment(currentDate).subtract(1, 'days').startOf('day').toDate(),
                        $lte: moment(currentDate).subtract(1, 'days').endOf('day').toDate()
                    }
                };
            } else if (dateFilter === 'thisMonth') {
                filterDate = {
                    transactionDate: {
                        $gte: moment(currentDate).startOf('month').toDate(),
                        $lte: moment(currentDate).endOf('day').toDate()
                    }
                }
            } else if (dateFilter === 'thisYear') {
                filterDate = {
                    transactionDate: {
                        $gte: moment(currentDate).startOf('year').toDate(),
                        $lte: moment(currentDate).endOf('day').toDate()
                    }
                }
            }
        }

        if (searchFilter) {
            categoryIds = await transactionService.getCategoryIdsBySearch(searchFilter);
        }

        const mainFilter = {
            ...(categoryId ? { categoryId: new ObjectId(categoryId) } : {}),
            ...(searchFilter?.length > 0 && categoryIds.length > 0 ? { categoryId: { $in: categoryIds } } : {}),
            ...(userId ? { createdBy: new ObjectId(userId) } : {}),
            ...filterDate
        }
        const data = await transactionService.getAllData(mainFilter)
        response.successResponse(res, 'Expenses Data List Fetch SuccesFully', data)
    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}

module.exports.transactionHistory = async (req, res) => {
    try {
        const { dateFilter } = req.query
        const userId = req.userId
        let totalIncome = 0
        let totalExpense = 0
        const filterDate = await getDateFilter(dateFilter)
        const currencySymbol = '$'
        const mainFilter = {
            ...(userId ? { createdBy: userId } : {}),
            ...filterDate
        }
        const history = await transactionService.history(mainFilter)
        if (history.length) {
            const balanceWithCurrency = history[0].balance < 0 ?
                `-${currencySymbol}${Math.abs(history[0].balance)}` :
                `${currencySymbol}${history[0].balance}`
            response.successResponse(res, 'History Fetch Successfully', { myEarnings: `${currencySymbol}${history[0].myEarnings}`, myExpenses: `${currencySymbol}${history[0].myExpenses}`, balance: balanceWithCurrency })
        } else if (history.length === 0) {
            const totalBalance = await transactionService.balanceWithOutDateFilter(userId)
            totalBalance.forEach(data => {
                if (data.type === 'Income') {
                    totalIncome += data.amount
                } else if (data.type === 'Expense') {
                    totalExpense += data.amount
                }
            })
            const balance = totalIncome - totalExpense
            const balanceWithCurrency = balance < 0 ?
                `-${currencySymbol}${Math.abs(balance)}` :
                `${currencySymbol}${balance}`
            response.successResponse(res, 'History Fetch SuccessFully', { myEarnings: `${currencySymbol}0`, myExpenses: `${currencySymbol}0`, balance: balanceWithCurrency })
        }

    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}

module.exports.update = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body
        const result = await transactionService.update(req, _id, updateData)
        console.log(result)
        if (result) {
            response.successResponse(res, 'Expenses Updated SuccesFully', result)
        } else return response.errorResponse(res, 'Expenses Update Failed')
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.financialHealth = async (req, res) => {
    try {
        const { dateFilter } = req.query
        const userId = req.userId
        const currencySymbol = '$'
        const filterDate = await getDateFilter(dateFilter)
        const mainFilter = {
            ...(userId ? { createdBy: new ObjectId(userId) } : {}),
            ...filterDate
        }
        const transaction = await transactionService.financialHealth(mainFilter)
        if (transaction) {
            transaction.map(t => {
                t.totalIncome = `${currencySymbol}${t.totalIncome}`
                t.totalExpense = `${currencySymbol}${t.totalExpense}`
            })
            response.successResponse(res, 'Reports Fetch SuccessFully', transaction)
        }
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.getCategoriesDateFilterWise = async (req, res) => {
    try {
        const { dateFilter } = req.query
        const userId = req.userId
        const filterDate = await getDateFilter(dateFilter)
        const mainFilter = {
            ...(userId ? { createdBy: new ObjectId(userId) } : {}),
            ...filterDate
        }
        const transaction = await transactionService.categoriesWithDateFilter(mainFilter)
        if (transaction) {
            response.successResponse(res, 'Reports Fetch SuccessFully', transaction)
        }
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.topCategories = async (req, res) => {
    try {
        const { dateFilter } = req.query
        const userId = req.userId
        const currencySymbol = '$'
        const filterDate = await getDateFilter(dateFilter)
        const mainFilter = {
            ...(userId ? { createdBy: new ObjectId(userId) } : {}),
            type: "Expense",
            ...filterDate
        }
        const transaction = await transactionService.topCategories(mainFilter)
        if (transaction) {
            transaction.map(t => {
                t.amount = `${currencySymbol}${t.amount}`
            })
            response.successResponse(res, 'Reports Fetch SuccessFully', transaction)
        }
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.reset = async (req, res) => {
    try {
        const userId = req.userId
        const reset = await transactionService.reset(userId)
        response.successResponse(res, "Reset Successfully")

    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.delete = async (req, res) => {
    try {
        const { _id } = req.query
        const result = await transactionService.delete(_id)
        if (result) response.successResponse(res, "transaction Deleted")
        else response.errorResponse(res, "deletion Failed")
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.setBudgetOfExpenseGraph = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userId = req.userId;

        const budgetData = await transactionService.getBudget(userId, month, year);

        if (!budgetData) {
            return response.successResponse(res, 'No budget set for this month', {
                expenseTargetAmount: 0,
                month,
                year,
                monthOfNumber: parseInt(month),
                safeExpenseLimit: 0,
                totalDaysInMonth: 0,
                expense: []
            });
        }


        const monthNumber = budgetData.monthOfNumber;
        const paddedMonth = monthNumber.toString().padStart(2, '0');
        const budgetAmount = budgetData.budgetAmount;


        const totalDays = moment(`${year}-${monthNumber}`, 'YYYY-M').daysInMonth();
        const safeExpenseLimit = Math.floor(budgetAmount / totalDays);

        const startDate = new Date(`${year}-${paddedMonth}-01T00:00:00.000Z`);
        const endDate = new Date(moment(startDate).endOf('month').toISOString());

        const expenseByDate = await transactionService.expenseGraphOfSetBudget(userId, startDate, endDate);
        if (expenseByDate) {
            const dailyExpenses = [];
            for (let i = 1; i <= totalDays; i++) {
                const date = moment(`${year}-${monthNumber}-${i}`, 'YYYY-M-D').startOf('day');
                const found = expenseByDate.find(item =>
                    moment(item.transactionDate).isSame(date, 'day')
                );
                const amount = found?.amount || 0;
                dailyExpenses.push({
                    transactionDate: date.format('YYYY-MM-DD'),
                    amount,
                    status: amount > safeExpenseLimit ? 'OverLimit' : 'UnderLimit'
                });
            }

            return response.successResponse(res, 'Data fetched successfully', {
                expenseTargetAmount: budgetAmount,
                month,
                year,
                monthOfNumber: monthNumber,
                safeExpenseLimit,
                totalDaysInMonth: totalDays,
                expense: dailyExpenses
            });
        }

    } catch (error) {
        console.error('Error in setBudgetOfExpenseGraph:', error);
        return response.catchError(res, 'Server error', error.message);
    }
}