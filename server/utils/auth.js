const jwt = require("jsonwebtoken");
const maxAge = 3 * 24 * 60 * 60;

const createToken = (pwd, role) => {
  return jwt.sign({ pwd, role }, "app absence", {
    expiresIn: maxAge,
  });
};

module.exports = createToken;
