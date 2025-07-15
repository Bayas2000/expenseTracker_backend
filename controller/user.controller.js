const userService = require('../service/user.service');
const response = require('../helper/response')

module.exports.signup = async (req, res) => {
    try {
        const { ...userData } = req.body;
        const isExist = await userService.existUser(userData.emailId)
        if (!isExist) {
            const result = await userService.signup(req, req.body);

            if (result.success) {
                response.successResponse(res, 'User Created SuccessFully', result.data)
            } else {
                res.status(400).json({ status: false, message: result.message });
                response.errorResponse(res,)
            }
        } else {
            return response.alreadyExist(res, 'Already Exist User')
        }
    } catch (error) {
        console.error('Controller Signup Error:', error);
        response.catchError(res, 'Catch Error In SignUp', error.message)
    }
};

module.exports.login = async (req, res) => {
    try {
        const { ...loginData } = req.body;
        console.log("loginData", loginData)
        const user = await userService.findUser(loginData.userName);
        if (user) {
            const isValidPassword = await user.verifyPassword(loginData.password)
            if (isValidPassword) {
                const token = await user.jwt()
                //res.cookie("token", token, { expires: new Date(Date.now() + 1 * 3600000) })
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                });

                response.successResponse(res, 'Login SuccessFully', token)
            } else return response.errorResponse(res, 'Invalid Credentials')
        } else {
            return response.errorResponse(res, 'InValid Credentials')
        }

    } catch (error) {
        console.error('Controller Login Error:', error);
        response.catchError(res, 'Catch Error In Login', error.message)
    }
}

module.exports.userDetails = async (req, res) => {
    try {
        const userId = req.userId
        const user = await userService.userDetails(userId)
        if (user) {
            response.successResponse(res, "User Details", user)
        } else {
            response.errorResponse(res, 'User not Found')
        }
    } catch (error) {
        console.error('Controller Login Error:', error);
        response.catchError(res, 'Catch Error In Login', error.message)
    }
}

module.exports.logOut = async (req, res) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now())
        })
        response.successResponse(res, 'Logged Out')
    } catch (error) {
        console.error('Controller Login Error:', error);
        response.catchError(res, 'Catch Error In Login', error.message)
    }
}





