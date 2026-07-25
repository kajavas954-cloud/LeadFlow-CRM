export function errorHandler(err, req, res, next) {
    console.error('[Error Handler]:', err);
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
