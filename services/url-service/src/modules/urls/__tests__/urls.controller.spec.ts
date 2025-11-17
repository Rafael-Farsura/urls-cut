import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UrlsController } from '../urls.controller';
import { UrlsService } from '../urls.service';
import { CreateUrlDto } from '../dto/create-url.dto';
import { UpdateUrlDto } from '../dto/update-url.dto';
import { ShortUrl } from '../entities/short-url.entity';

describe('UrlsController', () => {
  let controller: UrlsController;
  let urlsService: jest.Mocked<UrlsService>;

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

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getShortUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    urlsService = module.get(UrlsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar URL encurtada sem autenticação', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };

      urlsService.create.mockResolvedValue(mockShortUrl);
      urlsService.getShortUrl.mockReturnValue('http://localhost:3000/abc123');

      const result = await controller.create(createUrlDto, undefined);

      expect(result).toEqual({
        id: mockShortUrl.id,
        originalUrl: mockShortUrl.originalUrl,
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: mockShortUrl.shortCode,
        userId: mockShortUrl.userId,
        createdAt: mockShortUrl.createdAt,
      });
      expect(urlsService.create).toHaveBeenCalledWith(createUrlDto.originalUrl, undefined);
    });

    it('deve criar URL encurtada com autenticação', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };

      urlsService.create.mockResolvedValue(mockShortUrl);
      urlsService.getShortUrl.mockReturnValue('http://localhost:3000/abc123');

      const result = await controller.create(createUrlDto, mockUser);

      expect(result.userId).toBe(mockUser.id);
      expect(urlsService.create).toHaveBeenCalledWith(createUrlDto.originalUrl, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('deve listar URLs do usuário com contagem de cliques', async () => {
      const urlsWithClickCount = [
        {
          ...mockShortUrl,
          clickCount: 5,
        },
      ];

      urlsService.findByUserId.mockResolvedValue(urlsWithClickCount as any);
      urlsService.getShortUrl.mockReturnValue('http://localhost:3000/abc123');

      const result = await controller.findAll(mockUser);

      expect(result).toEqual({
        urls: [
          {
            id: mockShortUrl.id,
            originalUrl: mockShortUrl.originalUrl,
            shortUrl: 'http://localhost:3000/abc123',
            shortCode: mockShortUrl.shortCode,
            clickCount: 5,
            createdAt: mockShortUrl.createdAt,
            updatedAt: mockShortUrl.updatedAt,
          },
        ],
        total: 1,
      });
      expect(urlsService.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('deve retornar array vazio quando usuário não tem URLs', async () => {
      urlsService.findByUserId.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual({
        urls: [],
        total: 0,
      });
    });
  });

  describe('update', () => {
    it('deve atualizar URL com sucesso', async () => {
      const id = mockShortUrl.id;
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://new-example.com',
      };
      const updatedUrl = {
        ...mockShortUrl,
        originalUrl: updateUrlDto.originalUrl,
      };

      urlsService.update.mockResolvedValue(updatedUrl);
      urlsService.getShortUrl.mockReturnValue('http://localhost:3000/abc123');

      const result = await controller.update(id, updateUrlDto, mockUser);

      expect(result).toEqual({
        id: updatedUrl.id,
        originalUrl: updatedUrl.originalUrl,
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: updatedUrl.shortCode,
        updatedAt: updatedUrl.updatedAt,
      });
      expect(urlsService.update).toHaveBeenCalledWith(id, updateUrlDto.originalUrl, mockUser.id);
    });
  });

  describe('delete', () => {
    it('deve deletar URL com sucesso', async () => {
      const id = mockShortUrl.id;

      urlsService.delete.mockResolvedValue(undefined);

      await controller.delete(id, mockUser);

      expect(urlsService.delete).toHaveBeenCalledWith(id, mockUser.id);
    });
  });
});
