declare const _default: (() => {
    logging: {
        enabled: boolean;
        level: string;
    };
    metrics: {
        enabled: boolean;
        prometheus: {
            enabled: boolean;
            port: number;
        };
    };
    tracing: {
        enabled: boolean;
        sentry: {
            enabled: boolean;
            dsn: string;
        };
        elastic: {
            enabled: boolean;
            serverUrl: string;
            serviceName: string;
        };
        datadog: {
            enabled: boolean;
            apiKey: string;
            service: string;
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    logging: {
        enabled: boolean;
        level: string;
    };
    metrics: {
        enabled: boolean;
        prometheus: {
            enabled: boolean;
            port: number;
        };
    };
    tracing: {
        enabled: boolean;
        sentry: {
            enabled: boolean;
            dsn: string;
        };
        elastic: {
            enabled: boolean;
            serverUrl: string;
            serviceName: string;
        };
        datadog: {
            enabled: boolean;
            apiKey: string;
            service: string;
        };
    };
}>;
export default _default;
