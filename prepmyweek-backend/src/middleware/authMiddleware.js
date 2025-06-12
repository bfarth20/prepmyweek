import jwt from "jsonwebtoken";

export function requireUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // expect: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    console.log("Decoded JWT userData:", userData);
    req.user = userData; //Attach user data to request object
    next();
  });
}
