const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret, jwtExpiry } = require('../config/env');
const signToken = (user) => {
    jwt.sign(
        { UserId: user._id, TenantId: user.TenantId, Role: user.role },
        jwtSecret,
        { expiresIn: jwtExpiry, algorithm: 'HS256' }
    )
}
const verifyToken = (token) =>jwt.verify(token, jwtSecret, { algorithms: ['HS256'] })


module.exports = {
    signToken, verifyToken
}