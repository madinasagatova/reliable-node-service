function notFound(req, res) {
  res.status(404).json({
    error: "not_found",
    message: `Route ${req.method} ${req.originalUrl} was not found`
  });
}

function errorHandler(error, req, res, next) {
  req.log.error({ error }, "request failed");

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: error.code || "internal_server_error",
    message: statusCode === 500 ? "Unexpected service error" : error.message
  });
}

module.exports = {
  notFound,
  errorHandler
};
