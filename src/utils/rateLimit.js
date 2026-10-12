import rateLimit from 'express-rate-limit';

// 1. Configure the rate limiter
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: 'draft-8', // combines RateLimit headers into one
	legacyHeaders: false, // Disable X-RateLimit-* headers
});

// 3. Or apply it only to a specific sensitive route
const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	limit: 5, // Limit each IP to 5 login attempts per minute
	message: 'Too many login attempts. Try again in a minute.',
});

export {loginLimiter, globalLimiter}