import { Test, TestingModule } from '@nestjs/testing';
import { ClicksService } from '../clicks.service';
import { ClicksRepository } from '../clicks.repository';
import { Click } from '../entities/click.entity';

describe('ClicksService', () => {
  let service: ClicksService;
  let clicksRepository: jest.Mocked<ClicksRepository>;

  const mockClick: Click = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    shortUrlId: 'url-id-123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    clickedAt: new Date(),
    shortUrl: null as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClicksService,
        {
          provide: ClicksRepository,
          useValue: {
            create: jest.fn(),
            countByShortUrlId: jest.fn(),
            findByShortUrlId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClicksService>(ClicksService);
    clicksRepository = module.get(ClicksRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordClick', () => {
    it('deve registrar clique com sucesso', async () => {
      const shortUrlId = 'url-id-123';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      clicksRepository.create.mockResolvedValue(mockClick);

      const result = await service.recordClick(shortUrlId, ipAddress, userAgent);

      expect(result).toEqual(mockClick);
      expect(clicksRepository.create).toHaveBeenCalled();
    });

    it('deve registrar clique sem IP e userAgent', async () => {
      const shortUrlId = 'url-id-123';

      clicksRepository.create.mockResolvedValue({
        ...mockClick,
        ipAddress: null,
        userAgent: null,
      });

      const result = await service.recordClick(shortUrlId);

      expect(result.ipAddress).toBeNull();
      expect(result.userAgent).toBeNull();
    });
  });

  describe('getClickCount', () => {
    it('deve retornar contagem de cliques', async () => {
      const shortUrlId = 'url-id-123';
      const count = 5;

      clicksRepository.countByShortUrlId.mockResolvedValue(count);

      const result = await service.getClickCount(shortUrlId);

      expect(result).toBe(count);
      expect(clicksRepository.countByShortUrlId).toHaveBeenCalledWith(shortUrlId);
    });

    it('deve retornar 0 quando não há cliques', async () => {
      const shortUrlId = 'url-id-123';

      clicksRepository.countByShortUrlId.mockResolvedValue(0);

      const result = await service.getClickCount(shortUrlId);

      expect(result).toBe(0);
    });
  });

  describe('getClicksByShortUrlId', () => {
    it('deve retornar todos os cliques de uma URL', async () => {
      const shortUrlId = 'url-id-123';
      const clicks = [mockClick];

      clicksRepository.findByShortUrlId.mockResolvedValue(clicks);

      const result = await service.getClicksByShortUrlId(shortUrlId);

      expect(result).toEqual(clicks);
      expect(clicksRepository.findByShortUrlId).toHaveBeenCalledWith(shortUrlId);
    });

    it('deve retornar array vazio quando não há cliques', async () => {
      const shortUrlId = 'url-id-123';

      clicksRepository.findByShortUrlId.mockResolvedValue([]);

      const result = await service.getClicksByShortUrlId(shortUrlId);

      expect(result).toEqual([]);
    });
  });
});
