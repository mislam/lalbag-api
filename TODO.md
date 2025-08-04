# Lalbag API - Todo List

## Authentication System Backlog

### High Priority

- [ ] **Database Cleanup Job** - Add scheduled job for expired tokens and OTPs
  - Remove expired tokens: `DELETE FROM tokens WHERE expires_at < NOW()`
  - Remove expired OTPs: `DELETE FROM otps WHERE expires_at < NOW()`
  - Consider using Cloudflare Cron Triggers

- [ ] **SMS Service Integration** - Implement Bulk SMS BD integration
  - Complete `src/adapters/sms.ts` implementation
  - Add proper error handling for SMS failures
  - Test with real phone numbers

### Medium Priority

- [ ] **Security Monitoring** - Implement monitoring for failed authentication attempts
  - Track failed OTP attempts per IP/phone
  - Add alerts for suspicious patterns
  - Consider IP-based rate limiting

- [ ] **Session Management** - Add session management endpoints
  - `GET /auth/sessions` - List active sessions
  - `DELETE /auth/sessions/:id` - Revoke specific session
  - `DELETE /auth/sessions` - Logout from all devices

- [ ] **Refresh Token Security** - Add security features for long-lived refresh tokens
  - Activity-based expiry (expire after 30 days of inactivity)
  - Device-based session limits (max 5 devices per user)
  - Suspicious activity detection and auto-revocation
  - User-initiated token revocation from settings

### Low Priority

- [ ] **Enhanced Security** - Add device fingerprinting
  - Track device information more comprehensively
  - Detect suspicious login patterns
  - Add device-based notifications

- [ ] **Audit Logging** - Implement comprehensive audit logging
  - Log all authentication events
  - Add structured logging for security analysis
  - Consider log aggregation service

## Marketplace Features (Future)

### User Management

- [ ] User profile creation endpoint (`POST /users/profile`)
- [ ] User profile update endpoint (`PUT /users/profile`)
- [ ] User profile retrieval endpoint (`GET /users/profile`)
- [ ] User preferences and settings
- [ ] Profile image upload with MinIO

### Product Management

- [ ] Product CRUD operations
- [ ] Category management
- [ ] Product search and filtering

### Order Management

- [ ] Shopping cart functionality
- [ ] Order processing
- [ ] Payment integration

## Development Improvements

### Code Quality

- [ ] Add comprehensive unit tests
- [ ] Add integration tests for auth flow
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (OpenAPI/Swagger)

### Performance

- [ ] Add caching layer (Redis/KV)
- [ ] Optimize database queries
- [ ] Add request/response compression
- [ ] Monitor and optimize cold start times

## Notes for Next Sessions

### Recommended Next Steps

1. **Start with SMS Integration** - This unblocks the complete authentication flow
2. **Add Database Cleanup** - Important for production deployment
3. **Implement Basic User Management** - Foundation for marketplace features

### Technical Considerations

- Consider using Cloudflare Cron Triggers for scheduled cleanup
- Evaluate need for Redis/KV for caching frequently accessed data
- Plan for horizontal scaling as user base grows
- Consider implementing rate limiting at Cloudflare level

### Security Reminders

- Always use UTC timestamps
- Sanitize all user inputs
- Log security events without exposing sensitive data
- Regular security audits of authentication flow
