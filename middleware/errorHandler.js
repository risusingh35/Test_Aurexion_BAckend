const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const body = {
    error: err.isOperational ? err.message : 'Something went wrong!',   // 👈 required shape
    ...(err.errors && { details: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(body);
};

module.exports = errorHandler;