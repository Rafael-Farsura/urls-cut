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
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const config_1 = require("@nestjs/config");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
        this.isEnabled = this.configService.get('ENABLE_LOGGING', 'true') === 'true';
    }
    intercept(context, next) {
        if (!this.isEnabled) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();
        this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - startTime;
                const { statusCode } = response;
                this.logger.log(`${method} ${url} ${statusCode} - ${responseTime}ms`);
            },
            error: error => {
                const responseTime = Date.now() - startTime;
                const statusCode = error?.status || 500;
                this.logger.error(`${method} ${url} ${statusCode} - ${responseTime}ms - ${error?.message || 'Erro desconhecido'}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map