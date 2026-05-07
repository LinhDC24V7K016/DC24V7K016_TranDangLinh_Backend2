const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const SECRET_KEY = process.env.JWT_SECRET || "contactbook-super-secret-key";

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return next(new ApiError(403, "No token provided"));
  }

  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return next(new ApiError(401, "Invalid token format. Expected 'Bearer <token>'"));
  }

  const actualToken = tokenParts[1];

  jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new ApiError(401, "Unauthorized!"));
    }
    
    req.userId = decoded.id;
    next();
  });
};
