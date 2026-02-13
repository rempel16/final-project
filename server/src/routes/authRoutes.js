const router = require("express").Router();
const { signup, login, reset } = require("../controllers/auth.controller");

router.post("/signup", (req, res) => signup(req, res));
router.post("/login", (req, res) => login(req, res));
router.post("/reset", (req, res) => reset(req, res));

module.exports = router;
