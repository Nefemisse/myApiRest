// Imports
let jwt = require('jsonwebtoken')

const JWT_SIGN_SECRET = '12grd546h51dt5hd6r4g5fh1d21h5td64grd'

// Exported functions
module.exports = {
    generateTokenForUser: (userData) => {
        return jwt.sign({
            userId: userData.id
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '4h'
        })
    },
    parseAuthorization: (authorization) => {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: (authorization) => {
        //Par défaut userId = -1 pour s'assurer qu'on n'effectue pas de requêtes sur quelque chose qui n'existe pas 
        let userId = -1;
        let token = modulr.exports.parseAuthorization(authorization);
        if(token != null) {
            try {
                let jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null)
                userId = jwtToken.userId;
            } catch(err) { }
        }
        return userId;
    }
}