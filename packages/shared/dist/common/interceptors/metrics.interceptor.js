"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const config_1 = require("@nestjs/config");
const prom_client_1 = require("prom-client");
let MetricsInterceptor = class MetricsInterceptor {
    constructor(configService) {
        this.configService = configService;
        this.isEnabled =
            this.configService.get('ENABLE_METRICS', 'false') === 'true' ||
                this.configService.get('PROMETHEUS_ENABLED', 'false') === 'true';
        if (this.isEnabled) {
            this.httpRequestDuration = new prom_client_1.Histogram({
                name: 'http_request_duration_seconds',
                help: 'Duração das requisições HTTP em segundos',
                labelNames: ['method', 'route', 'status_code'],
                buckets: [0.1, 0.5, 1, 2, 5, 10],
                registers: [prom_client_1.register],
            });
            this.httpRequestTotal = new prom_client_1.Counter({
                name: 'http_requests_total',
                help: 'Total de requisições HTTP',
                labelNames: ['method', 'route', 'status_code'],
                registers: [prom_client_1.register],
            });
            prom_client_1.register.setDefaultLabels({ app: 'url-shortener' });
        }
    }
    intercept(context, next) {
        if (!this.isEnabled) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, route } = request;
        const routePath = route?.path || request.url;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = (Date.now() - startTime) / 1000;
                const statusCode = response.statusCode.toString();
                this.httpRequestDuration.labels(method, routePath, statusCode).observe(duration);
                this.httpRequestTotal.labels(method, routePath, statusCode).inc();
            },
            error: error => {
                const duration = (Date.now() - startTime) / 1000;
                const statusCode = error?.status?.toString() || '500';
                this.httpRequestDuration.labels(method, routePath, statusCode).observe(duration);
                this.httpRequestTotal.labels(method, routePath, statusCode).inc();
            },
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map