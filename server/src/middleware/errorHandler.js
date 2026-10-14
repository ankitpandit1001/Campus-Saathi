import multer from 'multer';

export function errorHandler(err, req, res, next) {
  // Multer error handling
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum permitted limit of 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Custom validation / fileFilter errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma unique constraint violation error
  if (err.code === 'P2002') {
    const fields = err.meta && err.meta.target ? err.meta.target : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${fields} already exists.`,
    });
  }

  // Log error internally for debugging
  console.error('[Error Handler]', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.status || err.statusCode || 500;

  // Mask internal server errors in production to avoid leaking database schema, stack, or internal paths
  let clientMessage = err.message || 'Internal server error occurred.';
  if (!isDevelopment && statusCode >= 500) {
    clientMessage = 'An unexpected server error occurred. Please try again later.';
  }

  return res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(isDevelopment && { stack: err.stack }),
  });
}
