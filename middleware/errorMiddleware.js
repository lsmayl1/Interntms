const errorHandler = (err, req, res, next) => {
    console.error(err); // Log the error for debugging

    // Set default status code and message
    let statusCode = err.status || 500; // Default to 500 Internal Server Error
    let message = err.message || 'Internal Server Error';

    // Customize error response based on the error type
    switch (err.name) {
        case 'SequelizeValidationError':
            statusCode = 400; // Bad Request
            message = err.errors.map(error => error.message); // Return validation error messages
            break;
        case 'SequelizeUniqueConstraintError':
            statusCode = 409; // Conflict
            message = 'This email is already in use.'; // Customize as needed
            break;
        case 'UnauthorizedError':
            statusCode = 401; // Unauthorized
            message = 'You must be logged in to access this resource.';
            break;
        case 'ForbiddenError':
            statusCode = 403; // Forbidden
            message = 'You do not have permission to access this resource.';
            break;
        case 'NotFoundError':
            statusCode = 404; // Not Found
            message = 'The requested resource was not found.';
            break;
        case 'MethodNotAllowedError':
            statusCode = 405; // Method Not Allowed
            message = 'The method is not allowed for the requested resource.';
            break;
        case 'UnsupportedMediaTypeError':
            statusCode = 415; // Unsupported Media Type
            message = 'The media type is not supported.';
            break;
        case 'TooManyRequestsError':
            statusCode = 429; // Too Many Requests
            message = 'You have made too many requests. Please try again later.';
            break;
        default:
            // Handle other errors
            statusCode = 500; // Internal Server Error
            message = 'An unexpected error occurred.';
            break;
    }

    // Send structured JSON response
    res.status(statusCode).json({
        status: statusCode,
        error: message,
        timestamp: new Date().toISOString(), // Optional: include a timestamp
        path: req.originalUrl // Optional: include the request path
    });
};

module.exports = errorHandler; 