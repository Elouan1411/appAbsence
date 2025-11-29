const express = require("express");
const router = express.Router();

/*****************************************
 *            Méthodes POST
 *****************************************/

// Enregistrement d'un fichier
router.post("/:ID", (req, res) => {
  let id = req.params.ID.substring(1);
  let compteur = 0;

  fs.readdir("./upload", (err, files) => {
    if (err) {
      res.status(404).json([]);
    } else {
      files.forEach((file) => {
        if (file.split("-")[0] == id || file.split("-")[0] == id + ".pdf") {
          compteur++;
        }
      });

      const form = new formidable.IncomingForm();
      form.parse(req);

      form.on("fileBegin", function (name, file) {
        let fileName = id + ".pdf";
        if (compteur > 0) {
          fileName = id + "-" + compteur + ".pdf";
        }
        file.filepath = __dirname + "/upload/" + fileName;
        res.status(200).json(fileName);
      });
    }
  });
});

module.exports = router;
