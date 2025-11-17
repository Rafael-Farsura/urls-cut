import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);

    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
        getResponse: jest.fn(),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleRequest', () => {
    it('deve retornar undefined para rotas públicas sem usuário', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.handleRequest(null, null, null, mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it('deve retornar usuário para rotas públicas com token válido', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const user = { id: '123', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null, mockExecutionContext);

      expect(result).toEqual(user);
    });

    it('deve lançar erro para rotas protegidas sem usuário', () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      expect(() => {
        guard.handleRequest(null, null, null, mockExecutionContext);
      }).toThrow();
    });

    it('deve retornar usuário para rotas protegidas com token válido', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const user = { id: '123', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null, mockExecutionContext);

      expect(result).toEqual(user);
    });

    it('deve lançar erro para rotas protegidas com erro de autenticação', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const error = new Error('Token inválido');

      expect(() => {
        guard.handleRequest(error, null, null, mockExecutionContext);
      }).toThrow();
    });

    it('deve retornar undefined para rotas públicas com erro mas sem usuário', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const error = new Error('Token inválido');

      const result = guard.handleRequest(error, null, null, mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });
});
