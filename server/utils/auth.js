const jwt = require("jsonwebtoken");
const maxAge = 10 * 60 * 60; // 10 h

const createToken = (pwd, role) => {
    return jwt.sign({ pwd, role }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
};

module.exports = createToken;
