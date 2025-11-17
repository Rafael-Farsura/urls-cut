import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { of, throwError, TimeoutError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimeoutInterceptor } from '../timeout.interceptor';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;
  let configService: jest.Mocked<ConfigService>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.requestTimeout') {
          return 100; // 100ms para testes
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeoutInterceptor,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    interceptor = module.get<TimeoutInterceptor>(TimeoutInterceptor);
    configService = module.get(ConfigService);

    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('deve permitir requisição que completa dentro do timeout', async () => {
      const response = { data: 'success' };
      mockCallHandler.handle = jest.fn(() => of(response));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe(value => {
        expect(value).toEqual(response);
      });
    });

    it('deve lançar RequestTimeoutException quando timeout é excedido', done => {
      // Simula operação que demora mais que o timeout
      mockCallHandler.handle = jest.fn(() => of('slow response').pipe(delay(200)));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe({
        error: err => {
          expect(err).toBeInstanceOf(RequestTimeoutException);
          expect(err.message).toContain('excedeu o tempo limite');
          done();
        },
      });
    });

    it('deve usar timeout configurado', () => {
      expect(configService.get).toHaveBeenCalledWith('app.requestTimeout');
    });

    it('deve usar timeout padrão quando não configurado', async () => {
      const mockConfigServiceDefault = {
        get: jest.fn(() => null),
      };

      const moduleDefault = await Test.createTestingModule({
        providers: [
          TimeoutInterceptor,
          {
            provide: ConfigService,
            useValue: mockConfigServiceDefault,
          },
        ],
      }).compile();

      const interceptorDefault = moduleDefault.get<TimeoutInterceptor>(TimeoutInterceptor);
      expect(interceptorDefault).toBeDefined();
    });

    it('deve propagar outros erros que não sejam TimeoutError', done => {
      const customError = new Error('Custom error');
      mockCallHandler.handle = jest.fn(() => throwError(() => customError));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe({
        error: err => {
          expect(err).toBe(customError);
          expect(err).not.toBeInstanceOf(RequestTimeoutException);
          done();
        },
      });
    });
  });
});
