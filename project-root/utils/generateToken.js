const jwt = require('jsonwebtoken');

function generateToken(user) {
    const payload = { userId: user.id, username: user.username};
    const options = {expiresIn: process.env.JWT_EXPIRATION};
    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

module.exports = generateToken;