"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const retry_service_1 = require("../retry.service");
describe('RetryService', () => {
    let service;
    let configService;
    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key) => {
                const config = {
                    'app.retryMaxAttempts': 3,
                    'app.retryInitialDelay': 10,
                    'app.retryMaxDelay': 100,
                    'app.retryFactor': 2,
                };
                return config[key];
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                retry_service_1.RetryService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(retry_service_1.RetryService);
        configService = module.get(config_1.ConfigService);
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });
    describe('execute', () => {
        it('deve executar operação com sucesso na primeira tentativa', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await service.execute(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });
        it('deve fazer retry quando operação falha', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('First attempt failed'))
                .mockResolvedValueOnce('success');
            const result = await service.execute(operation, { initialDelay: 1 });
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
        it('deve fazer múltiplos retries com exponential backoff', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('First attempt'))
                .mockRejectedValueOnce(new Error('Second attempt'))
                .mockResolvedValueOnce('success');
            const result = await service.execute(operation, {
                maxRetries: 3,
                initialDelay: 1,
                factor: 2,
            });
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(3);
        });
        it('deve lançar erro após exceder maxRetries', async () => {
            const error = new Error('Operation failed');
            const operation = jest.fn().mockRejectedValue(error);
            await expect(service.execute(operation, {
                maxRetries: 2,
                initialDelay: 1,
            })).rejects.toThrow('Operation failed');
            expect(operation).toHaveBeenCalledTimes(2);
        });
        it('deve respeitar maxDelay', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('First attempt'))
                .mockResolvedValueOnce('success');
            const startTime = Date.now();
            const result = await service.execute(operation, {
                maxRetries: 3,
                initialDelay: 10,
                maxDelay: 50,
                factor: 2,
            });
            const elapsed = Date.now() - startTime;
            expect(result).toBe('success');
            expect(elapsed).toBeLessThan(100);
        });
        it('deve abortar retry se erro não for retryable', async () => {
            const error = new Error('Non-retryable error');
            const operation = jest.fn().mockRejectedValue(error);
            const retryableErrors = (err) => err.message !== 'Non-retryable error';
            await expect(service.execute(operation, {
                retryableErrors,
            })).rejects.toThrow('Non-retryable error');
            expect(operation).toHaveBeenCalledTimes(1);
        });
        it('deve usar configurações padrão quando não especificadas', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await service.execute(operation);
            expect(result).toBe('success');
            expect(configService.get).toHaveBeenCalledWith('app.retryMaxAttempts');
        });
    });
});
//# sourceMappingURL=retry.service.spec.js.map