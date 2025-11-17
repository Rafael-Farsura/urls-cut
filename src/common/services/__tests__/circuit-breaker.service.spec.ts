import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { CircuitBreakerService } from '../circuit-breaker.service';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'app.circuitBreakerThreshold': 3,
          'app.circuitBreakerTimeout': 1000,
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    configService = module.get(ConfigService);
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

      // 3 falhas para abrir (threshold = 3)
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(operation)).rejects.toThrow('Operation failed');
      }

      expect(service.getState()).toBe('OPEN');
      expect(service.getFailures()).toBe(3);
    });

    it('deve lançar ServiceUnavailableException quando circuit está OPEN', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Abre o circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(operation)).rejects.toThrow('Operation failed');
      }

      // Tenta executar quando está OPEN
      const newOperation = jest.fn().mockResolvedValue('success');
      await expect(service.execute(newOperation)).rejects.toThrow(ServiceUnavailableException);
      expect(newOperation).not.toHaveBeenCalled();
    });

    it('deve entrar em HALF_OPEN após timeout quando circuit está OPEN', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Abre o circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(operation)).rejects.toThrow('Operation failed');
      }

      // Simula passagem do timeout
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

      // Abre o circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(operation)).rejects.toThrow('Operation failed');
      }

      // Simula timeout
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

      // Abre o circuit
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


