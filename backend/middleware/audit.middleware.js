import AuditLog from '../models/AuditLog.model.js';

export const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    const originalSend = res.json;

    res.json = function(data) {
      // Log after response is sent
      const logData = {
        userId: req.user?._id || null,
        action: action,
        resourceType: resourceType,
        resourceId: req.params.id || req.body.id || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || '',
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE',
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: sanitizeBody(req.body)
        }
      };

      if (res.statusCode >= 400) {
        logData.errorMessage = data.message || 'Request failed';
        logData.status = 'FAILURE';
      }

      // Don't block the response, log asynchronously
      AuditLog.create(logData).catch(err => {
        console.error('Audit log error:', err);
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

// Sanitize sensitive data from audit logs
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'creditCard', 'ssn'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
