"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const parseNumber = (value, defaultValue) => {
    if (!value)
        return defaultValue;
    const parsed = +value;
    return parsed !== parsed ? defaultValue : parsed;
};
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseNumber(process.env.PORT, 3000),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    shortCodeLength: parseNumber(process.env.SHORT_CODE_LENGTH, 6),
    shortCodeStrategy: process.env.SHORT_CODE_STRATEGY || 'hash',
    circuitBreakerThreshold: parseNumber(process.env.CIRCUIT_BREAKER_THRESHOLD, 5),
    circuitBreakerTimeout: parseNumber(process.env.CIRCUIT_BREAKER_TIMEOUT, 60000),
    retryMaxAttempts: parseNumber(process.env.RETRY_MAX_ATTEMPTS, 3),
    retryInitialDelay: parseNumber(process.env.RETRY_INITIAL_DELAY, 100),
    retryMaxDelay: parseNumber(process.env.RETRY_MAX_DELAY, 5000),
    retryFactor: parseNumber(process.env.RETRY_FACTOR, 2),
    requestTimeout: parseNumber(process.env.REQUEST_TIMEOUT, 30000),
    throttleTtl: parseNumber(process.env.THROTTLE_TTL, 60),
    throttleLimit: parseNumber(process.env.THROTTLE_LIMIT, 100),
}));
//# sourceMappingURL=app.config.js.map