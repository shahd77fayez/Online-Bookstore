import { StatusCodes } from "http-status-codes";

export const roles = {
  admin: "Admin",
  user: "User",
};

Object.freeze(roles);

export const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized access" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied. Admins only" });
    }

    next();
  };
};
