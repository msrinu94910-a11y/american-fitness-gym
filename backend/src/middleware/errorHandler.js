// Middleware: Error Handler and Not Found Handlers

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
