const response = require('../helper/response')
const fs = require('fs')
const path = require('path')


const { STATIC_FILES_PATH_URL, PORT } = process.env

const uplodFile = async (req, res) => {
    try {
        if (req.file && req.file.path) {
            const fullPath = path.relative(path.resolve(), req.file.path);
            const parts = fullPath.split(path.sep);
            if (parts[0] === 'uploads') parts.shift();
            const suffixUrl = parts.join('/');

            const domain = `https://expensetracker-backend-1-npwu.onrender.com/files`;
            const imageFullUrl = `${domain}/${suffixUrl}`;

            response.successResponse(res, 'File uploaded successfully', imageFullUrl);
        } else {
            return response.errorResponse(res, 'File upload failed');
        }
    } catch (error) {
        console.error('Error', error);
        response.catchError(res, 'File upload catchError:', error.message);
    }
};


module.exports = {
    uplodFile
}