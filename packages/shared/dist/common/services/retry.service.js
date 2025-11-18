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
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RetryService = RetryService_1 = class RetryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RetryService_1.name);
        this.defaultMaxRetries = this.configService.get('app.retryMaxAttempts') || 3;
        this.defaultInitialDelay = this.configService.get('app.retryInitialDelay') || 100;
        this.defaultMaxDelay = this.configService.get('app.retryMaxDelay') || 5000;
        this.defaultFactor = this.configService.get('app.retryFactor') || 2;
    }
    async execute(operation, options = {}) {
        const { maxRetries = this.defaultMaxRetries, initialDelay = this.defaultInitialDelay, maxDelay = this.defaultMaxDelay, factor = this.defaultFactor, retryableErrors = () => true, } = options;
        let lastError;
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                attempts++;
                if (!retryableErrors(error)) {
                    this.logger.debug(`Erro não é retryable, abortando retry`);
                    throw error;
                }
                if (attempts >= maxRetries) {
                    this.logger.warn(`Operação falhou após ${attempts} tentativas. Último erro: ${error.message}`);
                    throw error;
                }
                const delay = Math.min(initialDelay * Math.pow(factor, attempts - 1), maxDelay);
                this.logger.debug(`Tentativa ${attempts}/${maxRetries} falhou. Tentando novamente em ${delay}ms`);
                await this.delay(delay);
            }
        }
        throw lastError;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.RetryService = RetryService;
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RetryService);
//# sourceMappingURL=retry.service.js.map