function errorHandler(error, req, res, next) {
  let statusCode = error.status || 500;
  let message = error.message || "Internal Server Error";

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    message = error.errors[0].message;
  }

  if (error.name === "BadRequest") {
    statusCode = 400;
    message = error.message || "Data not found";
  }

  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "Unauthorized"
  ) {
    statusCode = 401;
    message = error.message || "Invalid or Expired token";
  }

  if (error.name === "Forbidden") {
    statusCode = 403;
    message = error.message || "You are not authorized";
  }

  if (error.name === "NotFound") {
    statusCode = 404;
    message = error.message || "Resource not found";
  }

  if (error.status === 401) {
    statusCode = 401;
    message = error.message || "Unauthorized";
  }

  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
