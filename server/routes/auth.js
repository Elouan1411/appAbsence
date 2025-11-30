const express = require("express");
const createToken = require("../utils/auth");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();
const maxAge = 3 * 24 * 60 * 60;
let users = {};
users["rjoffrin"] = { password: 1234, role: "student" };
users["apierrot"] = { password: 1234, role: "admin" };
users["fdadeau"] = { password: 1234, role: "teacher" };

/*****************************************
 *            Méthodes GET
 *****************************************/
//Récupération des informations de l'utilisateur en fonction de son token
router.get("/", verifyToken, (req, res) => {
  const [login, role] = req.user.pwd.split("-");

  res.status(200).json({
    user: {
      login,
      role,
    },
  });
});
/*****************************************
 *            Méthodes POST
 *****************************************/

//Route pour se connecter
router.post("/login", (req, res) => {
  const { user, pwd } = req.body;
  console.log({ user, pwd });
  if (users[user] != undefined) {
    console.log(`${users[user].password}==${pwd}`);
    if (users[user].password == pwd) {
      const token = createToken(user + "-" + users[user]["role"]);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
        sameSite: "strict",
      });
      res.status(200).json(users[user]["role"]);
    } else {
      res.status(401).json("Mot de passe incorrect");
    }
  } else {
    res.status(401).json("Identifiants incorrects");
  }
});

//Route pour se déconnecter
router.post("/logout", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ succès: "Déconnecté" });
  }
});

//Route pour s'inscrire
router.post("/register", (req, res) => {
  // TODO: - Faire la route pour l'inscription
});

// router.get("/role", verifyToken, (req, res) => {
//   res.status(200).json(de)
// });

module.exports = router;
