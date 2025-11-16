import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UrlsService } from '../urls.service';
import { UrlsRepository } from '../urls.repository';
import { ClicksService } from '../../clicks/clicks.service';
import { ShortCodeGeneratorFactory } from '../../../common/strategies/short-code/short-code-generator.factory';
import { IShortCodeGenerator } from '../../../common/strategies/short-code/short-code-generator.interface';
import { ShortUrl } from '../entities/short-url.entity';

describe('UrlsService', () => {
  let service: UrlsService;
  let urlsRepository: jest.Mocked<UrlsRepository>;
  let clicksService: jest.Mocked<ClicksService>;
  let generatorFactory: jest.Mocked<ShortCodeGeneratorFactory>;
  let codeGenerator: jest.Mocked<IShortCodeGenerator>;
  let configService: jest.Mocked<ConfigService>;

  const mockShortUrl: ShortUrl = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    userId: 'user-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: null,
    clicks: [],
  };

  beforeEach(async () => {
    codeGenerator = {
      generate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: UrlsRepository,
          useValue: {
            create: jest.fn(),
            findByCode: jest.fn(),
            findByUserId: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            codeExists: jest.fn(),
          },
        },
        {
          provide: ClicksService,
          useValue: {
            recordClick: jest.fn(),
            getClickCount: jest.fn(),
            getClicksByShortUrlId: jest.fn(),
          },
        },
        {
          provide: ShortCodeGeneratorFactory,
          useValue: {
            create: jest.fn().mockReturnValue(codeGenerator),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.apiBaseUrl') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlsRepository = module.get(UrlsRepository);
    clicksService = module.get(ClicksService);
    generatorFactory = module.get(ShortCodeGeneratorFactory);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar URL encurtada com sucesso', async () => {
      const originalUrl = 'https://example.com';
      const shortCode = 'abc123';

      codeGenerator.generate.mockReturnValue(shortCode);
      urlsRepository.codeExists.mockResolvedValue(false);
      urlsRepository.create.mockResolvedValue(mockShortUrl);

      const result = await service.create(originalUrl);

      expect(result).toEqual(mockShortUrl);
      expect(codeGenerator.generate).toHaveBeenCalledWith(originalUrl);
      expect(urlsRepository.codeExists).toHaveBeenCalledWith(shortCode);
      expect(urlsRepository.create).toHaveBeenCalled();
    });

    it('deve criar URL com userId quando fornecido', async () => {
      const originalUrl = 'https://example.com';
      const userId = 'user-id-123';
      const shortCode = 'abc123';

      codeGenerator.generate.mockReturnValue(shortCode);
      urlsRepository.codeExists.mockResolvedValue(false);
      urlsRepository.create.mockResolvedValue({
        ...mockShortUrl,
        userId,
      });

      const result = await service.create(originalUrl, userId);

      expect(result.userId).toBe(userId);
    });

    it('deve retry quando houver colisão de código', async () => {
      const originalUrl = 'https://example.com';
      const shortCode1 = 'abc123';
      const shortCode2 = 'def456';

      codeGenerator.generate.mockReturnValueOnce(shortCode1).mockReturnValueOnce(shortCode2);
      urlsRepository.codeExists
        .mockResolvedValueOnce(true) // Primeira tentativa: colisão
        .mockResolvedValueOnce(false); // Segunda tentativa: sucesso
      urlsRepository.create.mockResolvedValue({
        ...mockShortUrl,
        shortCode: shortCode2,
      });

      const result = await service.create(originalUrl);

      expect(result.shortCode).toBe(shortCode2);
      expect(codeGenerator.generate).toHaveBeenCalledTimes(2);
    });

    it('deve lançar ConflictException após max retries', async () => {
      const originalUrl = 'https://example.com';
      const shortCode = 'abc123';

      codeGenerator.generate.mockReturnValue(shortCode);
      urlsRepository.codeExists.mockResolvedValue(true); // Sempre colisão

      await expect(service.create(originalUrl)).rejects.toThrow(ConflictException);
    });

    it('deve lançar BadRequestException para URL inválida', async () => {
      const invalidUrl = 'not-a-url';

      await expect(service.create(invalidUrl)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException para URL sem protocolo HTTP/HTTPS', async () => {
      const invalidUrl = 'ftp://example.com';

      await expect(service.create(invalidUrl)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException para URL vazia', async () => {
      await expect(service.create('')).rejects.toThrow(BadRequestException);
      await expect(service.create('   ')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCode', () => {
    it('deve retornar URL quando encontrada', async () => {
      urlsRepository.findByCode.mockResolvedValue(mockShortUrl);

      const result = await service.findByCode('abc123');

      expect(result).toEqual(mockShortUrl);
      expect(urlsRepository.findByCode).toHaveBeenCalledWith('abc123');
    });

    it('deve lançar NotFoundException quando URL não encontrada', async () => {
      urlsRepository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar URLs com contagem de cliques', async () => {
      const userId = 'user-id-123';
      const urls = [mockShortUrl];
      const clickCount = 5;

      urlsRepository.findByUserId.mockResolvedValue(urls);
      clicksService.getClickCount.mockResolvedValue(clickCount);

      const result = await service.findByUserId(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('clickCount', clickCount);
      expect(clicksService.getClickCount).toHaveBeenCalledWith(mockShortUrl.id);
    });

    it('deve retornar array vazio quando usuário não tem URLs', async () => {
      const userId = 'user-id-123';

      urlsRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('deve atualizar URL com sucesso', async () => {
      const id = mockShortUrl.id;
      const newUrl = 'https://new-example.com';
      const userId = mockShortUrl.userId!;

      urlsRepository.findById.mockResolvedValue(mockShortUrl);
      urlsRepository.update.mockResolvedValue({
        ...mockShortUrl,
        originalUrl: newUrl,
      });

      const result = await service.update(id, newUrl, userId);

      expect(result.originalUrl).toBe(newUrl);
      expect(urlsRepository.update).toHaveBeenCalledWith(id, { originalUrl: newUrl });
    });

    it('deve lançar NotFoundException quando URL não encontrada', async () => {
      const id = 'invalid-id';
      const newUrl = 'https://new-example.com';

      urlsRepository.findById.mockResolvedValue(null);

      await expect(service.update(id, newUrl)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException quando usuário não é dono', async () => {
      const id = mockShortUrl.id;
      const newUrl = 'https://new-example.com';
      const wrongUserId = 'wrong-user-id';

      urlsRepository.findById.mockResolvedValue(mockShortUrl);

      await expect(service.update(id, newUrl, wrongUserId)).rejects.toThrow(ConflictException);
    });

    it('deve permitir atualização sem userId (público)', async () => {
      const id = mockShortUrl.id;
      const newUrl = 'https://new-example.com';

      urlsRepository.findById.mockResolvedValue(mockShortUrl);
      urlsRepository.update.mockResolvedValue({
        ...mockShortUrl,
        originalUrl: newUrl,
      });

      const result = await service.update(id, newUrl);

      expect(result.originalUrl).toBe(newUrl);
    });
  });

  describe('delete', () => {
    it('deve deletar URL com sucesso', async () => {
      const id = mockShortUrl.id;
      const userId = mockShortUrl.userId!;

      urlsRepository.findById.mockResolvedValue(mockShortUrl);
      urlsRepository.softDelete.mockResolvedValue(undefined);

      await service.delete(id, userId);

      expect(urlsRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException quando URL não encontrada', async () => {
      const id = 'invalid-id';

      urlsRepository.findById.mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException quando usuário não é dono', async () => {
      const id = mockShortUrl.id;
      const wrongUserId = 'wrong-user-id';

      urlsRepository.findById.mockResolvedValue(mockShortUrl);

      await expect(service.delete(id, wrongUserId)).rejects.toThrow(ConflictException);
    });
  });

  describe('getShortUrl', () => {
    it('deve retornar URL completa com domínio', () => {
      const shortCode = 'abc123';
      const result = service.getShortUrl(shortCode);

      expect(result).toBe('http://localhost:3000/abc123');
    });
  });
});
