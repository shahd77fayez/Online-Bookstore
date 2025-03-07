// Middleware to validate and process query parameters for notifications
export const validateQueryParams = (req, res, next) => {
  console.log('Notification validation middleware called');
  console.log('User ID:', req.user?._id || 'No user ID found');
  console.log('Query params:', req.query);
  // Validate pagination
  const page = Number.parseInt(req.query.page);
  const limit = Number.parseInt(req.query.limit);

  if (page && (Number.isNaN(page) || page < 1)) {
    return res.status(400).json({message: 'Page must be a positive number'});
  }

  if (limit && (Number.isNaN(limit) || limit < 1 || limit > 50)) {
    return res.status(400).json({message: 'Limit must be between 1 and 50'});
  }

  // Validate type filter
  if (req.query.type && !['order_status', 'review', 'system'].includes(req.query.type)) {
    return res.status(400).json({message: 'Invalid notification type'});
  }

  // Validate isRead filter
  if (req.query.isRead && !['true', 'false'].includes(req.query.isRead)) {
    return res.status(400).json({message: 'isRead must be true or false'});
  }

  // Build filter object
  req.filterQuery = {recipients: req.user._id};

  if (req.query.type) {
    req.filterQuery.type = req.query.type;
  }

  if (req.query.isRead) {
    req.filterQuery.isRead = req.query.isRead === 'true';
  }

  console.log('Filter query built:', req.filterQuery);
  next();
};
