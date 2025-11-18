"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("../jwt-auth.guard");
describe('JwtAuthGuard', () => {
    let guard;
    let reflector;
    let mockExecutionContext;
    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                jwt_auth_guard_1.JwtAuthGuard,
                {
                    provide: core_1.Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();
        guard = module.get(jwt_auth_guard_1.JwtAuthGuard);
        reflector = module.get(core_1.Reflector);
        mockExecutionContext = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {},
                }),
                getResponse: jest.fn(),
            }),
        };
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
//# sourceMappingURL=jwt-auth.guard.spec.js.map