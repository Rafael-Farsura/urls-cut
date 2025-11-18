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
var SentryExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SentryExceptionFilter = SentryExceptionFilter_1 = class SentryExceptionFilter {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SentryExceptionFilter_1.name);
        this.isEnabled = this.configService.get('SENTRY_ENABLED', 'false') === 'true';
        this.sentryDsn = this.configService.get('SENTRY_DSN');
        if (this.isEnabled && !this.sentryDsn) {
            this.logger.warn('Sentry está habilitado mas SENTRY_DSN não está configurado');
        }
    }
    catch(exception, host) {
        if (this.isEnabled && this.sentryDsn) {
            try {
                this.logger.debug('Exceção seria enviada para Sentry (integração real requer @sentry/node)');
            }
            catch (error) {
                this.logger.error('Erro ao enviar exceção para Sentry', error);
            }
        }
    }
};
exports.SentryExceptionFilter = SentryExceptionFilter;
exports.SentryExceptionFilter = SentryExceptionFilter = SentryExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SentryExceptionFilter);
//# sourceMappingURL=sentry-exception.filter.js.map