"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const circuit_breaker_service_1 = require("../circuit-breaker.service");
describe('CircuitBreakerService', () => {
    let service;
    let configService;
    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key) => {
                const config = {
                    'app.circuitBreakerThreshold': 3,
                    'app.circuitBreakerTimeout': 1000,
                };
                return config[key];
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                circuit_breaker_service_1.CircuitBreakerService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(circuit_breaker_service_1.CircuitBreakerService);
        configService = module.get(config_1.ConfigService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('execute', () => {
        it('deve executar operação com sucesso quando estado é CLOSED', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await service.execute(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
            expect(service.getState()).toBe('CLOSED');
            expect(service.getFailures()).toBe(0);
        });
        it('deve incrementar falhas quando operação falha', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            expect(service.getFailures()).toBe(1);
            expect(service.getState()).toBe('CLOSED');
        });
        it('deve abrir circuit após threshold de falhas', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            for (let i = 0; i < 3; i++) {
                await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            }
            expect(service.getState()).toBe('OPEN');
            expect(service.getFailures()).toBe(3);
        });
        it('deve lançar ServiceUnavailableException quando circuit está OPEN', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            for (let i = 0; i < 3; i++) {
                await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            }
            const newOperation = jest.fn().mockResolvedValue('success');
            await expect(service.execute(newOperation)).rejects.toThrow(common_1.ServiceUnavailableException);
            expect(newOperation).not.toHaveBeenCalled();
        });
        it('deve entrar em HALF_OPEN após timeout quando circuit está OPEN', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            for (let i = 0; i < 3; i++) {
                await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            }
            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000);
            const newOperation = jest.fn().mockResolvedValue('success');
            const result = await service.execute(newOperation);
            expect(result).toBe('success');
            expect(service.getState()).toBe('CLOSED');
            expect(service.getFailures()).toBe(0);
            jest.restoreAllMocks();
        });
        it('deve resetar falhas após sucesso em HALF_OPEN', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            for (let i = 0; i < 3; i++) {
                await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            }
            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000);
            const successOperation = jest.fn().mockResolvedValue('success');
            await service.execute(successOperation);
            expect(service.getState()).toBe('CLOSED');
            expect(service.getFailures()).toBe(0);
            jest.restoreAllMocks();
        });
    });
    describe('reset', () => {
        it('deve resetar o circuit breaker', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            for (let i = 0; i < 3; i++) {
                await expect(service.execute(operation)).rejects.toThrow('Operation failed');
            }
            expect(service.getState()).toBe('OPEN');
            service.reset();
            expect(service.getState()).toBe('CLOSED');
            expect(service.getFailures()).toBe(0);
        });
        it('deve resetar com nome de serviço', () => {
            service.reset('test-service');
            expect(service.getState()).toBe('CLOSED');
        });
    });
    describe('getState', () => {
        it('deve retornar estado inicial CLOSED', () => {
            expect(service.getState()).toBe('CLOSED');
        });
    });
    describe('getFailures', () => {
        it('deve retornar número de falhas', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
            await expect(service.execute(operation)).rejects.toThrow();
            expect(service.getFailures()).toBe(1);
        });
    });
});
//# sourceMappingURL=circuit-breaker.service.spec.js.map