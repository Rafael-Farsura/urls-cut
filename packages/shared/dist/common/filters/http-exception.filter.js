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
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
        this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.constructor.name;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message =
                    (Array.isArray(responseObj.message)
                        ? responseObj.message.join(', ')
                        : responseObj.message) ||
                        exception.message ||
                        'Erro na requisição';
                error = responseObj.error || exception.constructor.name;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.constructor.name;
        }
        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
            ...(this.isDevelopment && exception instanceof Error ? { stack: exception.stack } : {}),
        };
        if (status >= 500) {
            this.logger.error('Erro interno do servidor', errorLog);
        }
        else {
            this.logger.warn('Erro na requisição', errorLog);
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...(this.isDevelopment
                ? { error, stack: exception instanceof Error ? exception.stack : undefined }
                : {}),
        };
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map