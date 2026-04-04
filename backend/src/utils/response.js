/**
 * Custom Error class for operational errors (e.g., validations, not found).
 * Extends the built-in Error class to include a status code.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Flag to identify predictable errors vs programming bugs
        
        // Captures the stack trace, excluding the constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Standardizes all success responses from the API.
 * * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {any} data - The payload to send back (optional)
 * @param {Number} statusCode - HTTP status code (defaults to 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Standardizes all error responses from the API.
 * * @param {Object} res - Express response object
 * @param {String} message - Error description
 * @param {Number} statusCode - HTTP status code (defaults to 500)
 * @param {any} errors - Detailed validation errors (optional)
 * @param {String} stack - Error stack trace (optional, used in dev)
 */
const errorResponse = (res, message, statusCode = 500, errors = null, stack = null) => {
    const response = {
        success: false,
        message
    };

    // Only attach 'errors' and 'stack' properties if they are provided
    if (errors) response.errors = errors;
    if (stack) response.stack = stack;

    return res.status(statusCode).json(response);
};

module.exports = {
    AppError,
    successResponse,
    errorResponse
};