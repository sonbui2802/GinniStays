const { AppError, errorResponse } = require('../utils/response');

/**
 * Catch-all middleware for undefined routes.
 * If a request makes it past all defined routes, it hits this and throws a 404.
 */
const notFound = (req, res, next) => {
    // Create a new AppError and pass it to the next() function
    // Express knows that passing an argument to next() means an error occurred
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

/**
 * Global Error Handler Middleware.
 * Must have exactly 4 arguments: (err, req, res, next) for Express to recognize it.
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 Internal Server Error if no status code is set
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Determine if we should show the stack trace (only in development)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const stackTrace = isDevelopment ? err.stack : null;

    // Send the standardized error response to the client
    return errorResponse(
        res, 
        message, 
        statusCode, 
        err.errors || null, 
        stackTrace
    );
};

module.exports = {
    notFound,
    errorHandler
};