const express = require("express");
const auth = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/google", auth.googleLogin);

module.exports = router;
