const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.type === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: err.errors
        });
    }

    if (err.code === '23505') { // PostgreSQL unique violation
        return res.status(409).json({
            message: 'Duplicate entry'
        });
    }

    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler;
