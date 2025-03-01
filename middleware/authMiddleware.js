const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET; // .env dosyanın doğru olduğundan emin ol

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token gerekli." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" şeklinde geldiğinden ayrıştır

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token doğrulama hatası:", err.message);
      return res.status(403).json({ error: "Geçersiz token." });
    }
    console.log("Decoded Token:", decoded); // Token içeriğini kontrol et

    req.user = decoded; // Token verisini request'e ekle
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "User not found" });
  }

  console.log("User Role:", req.user.role); // Admin olup olmadığını görmek için log

  if (req.user.role.toLowerCase() === "admin") {
    return next(); // Admin yetkisi varsa devam et
  }

  return res.status(403).json({ message: "Access denied" });
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Assuming Bearer token

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Token is not valid or has expired." }); // Forbidden
    }
    req.user = user;
    next();
  });
};

module.exports = { authMiddleware, isAdmin, authenticateToken };
