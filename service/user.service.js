const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');



module.exports.existUser = async (emailId) => {
    const existUser = await userModel.findOne({ emailId })
    if (existUser) {
        return true
    } else return false
}
module.exports.signup = async (req, userData) => {
    try {
        const hashPassword = await bcrypt.hash(userData.password, 10);

        const newUser = new userModel({
            ...userData,
            password: hashPassword,
            createdAt: new Date()
        });

        const savedUser = await newUser.save();

        return { success: true, data: savedUser };
    } catch (error) {
        console.error('Signup Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};

module.exports.findUser = async (userName) => {
    const user = await userModel.findOne({ userName })
    console.log("user", user)
    return user
}

module.exports.userDetails = async (userId) => {
    const user = await userModel.findOne({ _id: userId }).select('-password')
    return user
}


module.exports.updateProfile = async (userId, updatedData) => {
    try {
        const user = await userModel.findByIdAndUpdate(userId, {
            ...updatedData,
            updatedAt: new Date()
        })
        return user

    } catch (error) {
        console.error('updateProfile Error:', error);
        return { success: false, message: 'Internal server error', error };
    }

}