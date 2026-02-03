const router = require("express").Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

module.exports = router;