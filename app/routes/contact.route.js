const express = require("express");
const contacts = require("../controllers/contact.controller");
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verifyToken);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

router
  .route("/")
  .get(contacts.findAll)
  .post(upload.single("avatarFile"), contacts.create)
  .delete(contacts.deleteAll);

router
  .route("/:id")
  .get(contacts.findOne)
  .put(upload.single("avatarFile"), contacts.update)
  .delete(contacts.delete);

router.route("/favorite").get(contacts.findAllFavorite);


module.exports = router;
