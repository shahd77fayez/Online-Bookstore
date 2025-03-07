// middlewares/roleCheck.js
export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({message: 'Access denied. You don\'t have the required role.'});
    }
    next();
  };
};
