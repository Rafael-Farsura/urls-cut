import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RetryService } from '../retry.service';

describe('RetryService', () => {
  let service: RetryService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'app.retryMaxAttempts': 3,
          'app.retryInitialDelay': 10,
          'app.retryMaxDelay': 100,
          'app.retryFactor': 2,
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RetryService>(RetryService);
    configService = module.get(ConfigService);
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

      await expect(
        service.execute(operation, {
          maxRetries: 2,
          initialDelay: 1,
        }),
      ).rejects.toThrow('Operation failed');

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
      // Delay deve ser limitado a maxDelay (50ms)
      expect(elapsed).toBeLessThan(100);
    });

    it('deve abortar retry se erro não for retryable', async () => {
      const error = new Error('Non-retryable error');
      const operation = jest.fn().mockRejectedValue(error);

      const retryableErrors = (err: any) => err.message !== 'Non-retryable error';

      await expect(
        service.execute(operation, {
          retryableErrors,
        }),
      ).rejects.toThrow('Non-retryable error');

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


