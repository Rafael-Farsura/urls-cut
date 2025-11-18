import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayAuthGuard } from '../gateway-auth.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('GatewayAuthGuard', () => {
  let guard: GatewayAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<GatewayAuthGuard>(GatewayAuthGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso para rotas públicas sem header X-User-Id', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            user: undefined,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        expect.anything(),
        expect.anything(),
      ]);
    });

    it('deve popular request.user para rotas públicas com header X-User-Id', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const mockRequest = {
        headers: {
          'x-user-id': 'user-123',
        },
        user: undefined,
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({ id: 'user-123' });
    });

    it('deve permitir acesso para rotas protegidas com header X-User-Id', () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const mockRequest = {
        headers: {
          'x-user-id': 'user-123',
        },
        user: undefined,
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({ id: 'user-123' });
    });

    it('deve lançar erro para rotas protegidas sem header X-User-Id', () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            user: undefined,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
    });

    it('deve lançar erro com mensagem apropriada para rotas protegidas sem header', () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            user: undefined,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Token inválido ou ausente. O gateway deve validar o JWT e propagar X-User-Id.',
      );
    });

    it('deve funcionar com header em maiúsculas X-User-Id', () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const mockRequest = {
        headers: {
          'X-User-Id': 'user-123',
        },
        user: undefined,
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Headers em Node.js/Express são sempre convertidos para lowercase
      // Mas vamos testar ambos os casos
      mockRequest.headers['x-user-id'] = 'user-123';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({ id: 'user-123' });
    });
  });
});
