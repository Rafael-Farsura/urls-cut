import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { RedirectController } from '../redirect.controller';
import { UrlsService } from '../urls.service';
import { ClicksService } from '../../clicks/clicks.service';
import { ShortUrl } from '../entities/short-url.entity';

describe('RedirectController', () => {
  let controller: RedirectController;
  let urlsService: jest.Mocked<UrlsService>;
  let clicksService: jest.Mocked<ClicksService>;

  const mockShortUrl: ShortUrl = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: null,
    clicks: [],
  };

  const mockRequest = {
    ip: '192.168.1.1',
    headers: {
      'user-agent': 'Mozilla/5.0',
      'x-forwarded-for': undefined,
    },
  } as any;

  const mockResponse = {
    redirect: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectController],
      providers: [
        {
          provide: UrlsService,
          useValue: {
            findByCode: jest.fn(),
          },
        },
        {
          provide: ClicksService,
          useValue: {
            recordClick: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RedirectController>(RedirectController);
    urlsService = module.get(UrlsService);
    clicksService = module.get(ClicksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('redirect', () => {
    it('deve redirecionar para URL original e registrar clique', async () => {
      const shortCode = 'abc123';

      urlsService.findByCode.mockResolvedValue(mockShortUrl);
      clicksService.recordClick.mockResolvedValue({} as any);

      await controller.redirect(shortCode, mockRequest, mockResponse);

      expect(urlsService.findByCode).toHaveBeenCalledWith(shortCode);
      expect(clicksService.recordClick).toHaveBeenCalledWith(
        mockShortUrl.id,
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        mockShortUrl.originalUrl,
      );
    });

    it('deve usar x-forwarded-for quando disponível', async () => {
      const shortCode = 'abc123';
      const forwardedIp = '10.0.0.1';

      const requestWithForwarded = {
        ip: undefined,
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': forwardedIp,
        },
      } as any;

      urlsService.findByCode.mockResolvedValue(mockShortUrl);
      clicksService.recordClick.mockResolvedValue({} as any);

      await controller.redirect(shortCode, requestWithForwarded, mockResponse);

      expect(clicksService.recordClick).toHaveBeenCalledWith(
        mockShortUrl.id,
        forwardedIp,
        requestWithForwarded.headers['user-agent'],
      );
    });

    it('deve lançar NotFoundException quando URL não encontrada', async () => {
      const shortCode = 'invalid';

      urlsService.findByCode.mockRejectedValue(new NotFoundException());

      await expect(controller.redirect(shortCode, mockRequest, mockResponse)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('não deve falhar redirecionamento se registro de clique falhar', async () => {
      const shortCode = 'abc123';

      urlsService.findByCode.mockResolvedValue(mockShortUrl);
      clicksService.recordClick.mockRejectedValue(new Error('Database error'));

      await controller.redirect(shortCode, mockRequest, mockResponse);

      // Redirecionamento deve ocorrer mesmo com erro no clique
      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });
});
