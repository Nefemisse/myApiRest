// Imports
let jwt = require('jsonwebtoken')

const JWT_SIGN_SECRET = '12grd546h51dt5hd6r4g5fh1d21h5td64grd'

// Exported functions
module.exports = {
    generateTokenForUser: (userData) => {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        /*JWT_SIGN_SECRET,
        {
            expireIn: '4h'
        }*/)
    }
}