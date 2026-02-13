const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice(7).trim();
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = verifyToken(token);

    // Support common JWT id fields: id / userId / sub
    const rawId = payload?.id ?? payload?.userId ?? payload?.sub;
    if (!rawId) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: String(rawId) };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
