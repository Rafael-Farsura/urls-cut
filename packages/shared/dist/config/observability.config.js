"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('observability', () => ({
    logging: {
        enabled: process.env.ENABLE_LOGGING === 'true' || process.env.ENABLE_LOGGING === undefined,
        level: process.env.LOG_LEVEL || 'info',
    },
    metrics: {
        enabled: process.env.ENABLE_METRICS === 'true',
        prometheus: {
            enabled: process.env.PROMETHEUS_ENABLED === 'true',
            port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
        },
    },
    tracing: {
        enabled: process.env.ENABLE_TRACING === 'true',
        sentry: {
            enabled: process.env.SENTRY_ENABLED === 'true',
            dsn: process.env.SENTRY_DSN,
        },
        elastic: {
            enabled: process.env.ELASTIC_APM_ENABLED === 'true',
            serverUrl: process.env.ELASTIC_APM_SERVER_URL,
            serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'url-shortener',
        },
        datadog: {
            enabled: process.env.DATADOG_ENABLED === 'true',
            apiKey: process.env.DATADOG_API_KEY,
            service: process.env.DATADOG_SERVICE || 'url-shortener',
        },
    },
}));
//# sourceMappingURL=observability.config.js.map