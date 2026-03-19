/**
 * LOGGER MIDDLEWARE - API Request Logging
 * 
 * This middleware logs all incoming API requests with:
 * - Timestamp
 * - HTTP Method
 * - Request Path
 * - IP Address
 * - User ID (if authenticated)
 * - Response Status Code
 * - Response Time
 */

const loggerMiddleware = (req, res, next) => {
  // Record start time
  const startTime = Date.now();
  
  // Get user info if authenticated
  const userId = req.user?.userId || 'anonymous';
  
  // Log request details
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl || req.path;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Log incoming request
  console.log(`[API] ${timestamp} - ${method} ${path} - IP: ${ip} - User: ${userId}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields from logs
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.oldPassword) sanitizedBody.oldPassword = '***';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***';
    
    if (Object.keys(sanitizedBody).length > 0) {
      console.log(`[API] ${timestamp} - Request Body:`, JSON.stringify(sanitizedBody));
    }
  }
  
  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`[API] ${timestamp} - Query Params:`, JSON.stringify(req.query));
  }
  
  // Log response when it finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode || 200;
    
    // Log response
    console.log(`[API] ${timestamp} - ${method} ${path} - Status: ${statusCode} - Time: ${responseTime}ms - User: ${userId}`);
  });
  
  // Continue to next middleware
  next();
};

module.exports = loggerMiddleware;
