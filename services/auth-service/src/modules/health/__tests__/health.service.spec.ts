import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('deve retornar status ok quando tudo está funcionando', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.checks.database?.status).toBe('up');
      expect(result.checks.database?.responseTime).toBeDefined();
      expect(result.checks.memory?.status).toBe('up');
      expect(result.checks.memory?.usage).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('deve retornar status error quando banco está down', async () => {
      dataSource.query.mockRejectedValue(new Error('Connection failed'));

      const result = await service.check();

      expect(result.status).toBe('error');
      expect(result.checks.database?.status).toBe('down');
      expect(result.checks.database?.error).toBeDefined();
      expect(result.checks.memory?.status).toBe('up');
    });

    it('deve incluir tempo de resposta do banco', async () => {
      dataSource.query.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([{ '?column?': 1 }]), 10);
        });
      });

      const result = await service.check();

      expect(result.checks.database?.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('deve incluir informações de memória', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result.checks.memory?.usage).toBeDefined();
      expect(result.checks.memory?.usage?.rss).toBeGreaterThan(0);
      expect(result.checks.memory?.usage?.heapTotal).toBeGreaterThanOrEqual(0);
      expect(result.checks.memory?.usage?.heapUsed).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar timestamp ISO', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
