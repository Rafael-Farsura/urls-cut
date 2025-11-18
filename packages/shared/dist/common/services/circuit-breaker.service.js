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
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.failures = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED';
        this.threshold = this.configService.get('app.circuitBreakerThreshold') || 5;
        this.timeout = this.configService.get('app.circuitBreakerTimeout') || 60000;
    }
    async execute(operation, serviceName) {
        const service = serviceName || 'service';
        if (this.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - (this.lastFailureTime?.getTime() || 0);
            if (timeSinceLastFailure > this.timeout) {
                this.state = 'HALF_OPEN';
                this.logger.log(`Circuit breaker [${service}]: HALF_OPEN - Tentando recuperação`);
            }
            else {
                this.logger.warn(`Circuit breaker [${service}]: OPEN - Serviço indisponível`);
                throw new common_1.ServiceUnavailableException(`Serviço ${service} temporariamente indisponível. Tente novamente mais tarde.`);
            }
        }
        try {
            const result = await operation();
            this.onSuccess(service);
            return result;
        }
        catch (error) {
            this.onFailure(service, error);
            throw error;
        }
    }
    reset(serviceName) {
        const service = serviceName || 'service';
        this.state = 'CLOSED';
        this.failures = 0;
        this.lastFailureTime = null;
        this.logger.log(`Circuit breaker [${service}]: RESET - Estado resetado manualmente`);
    }
    getState() {
        return this.state;
    }
    getFailures() {
        return this.failures;
    }
    onSuccess(service) {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            this.logger.log(`Circuit breaker [${service}]: CLOSED - Serviço recuperado`);
        }
    }
    onFailure(service, error) {
        this.failures++;
        this.lastFailureTime = new Date();
        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            this.logger.warn(`Circuit breaker [${service}]: OPEN - ${this.failures} falhas consecutivas. Último erro: ${error.message}`);
        }
        else {
            this.logger.debug(`Circuit breaker [${service}]: Falha ${this.failures}/${this.threshold}`);
        }
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map