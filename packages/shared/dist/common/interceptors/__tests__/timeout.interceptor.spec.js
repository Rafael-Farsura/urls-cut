"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const timeout_interceptor_1 = require("../timeout.interceptor");
describe('TimeoutInterceptor', () => {
    let interceptor;
    let configService;
    let mockExecutionContext;
    let mockCallHandler;
    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key) => {
                if (key === 'app.requestTimeout') {
                    return 100;
                }
                return null;
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                timeout_interceptor_1.TimeoutInterceptor,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        interceptor = module.get(timeout_interceptor_1.TimeoutInterceptor);
        configService = module.get(config_1.ConfigService);
        mockExecutionContext = {
            switchToHttp: jest.fn(),
            getClass: jest.fn(),
            getHandler: jest.fn(),
        };
        mockCallHandler = {
            handle: jest.fn(),
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('intercept', () => {
        it('deve permitir requisição que completa dentro do timeout', async () => {
            const response = { data: 'success' };
            mockCallHandler.handle = jest.fn(() => (0, rxjs_1.of)(response));
            const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
            result.subscribe(value => {
                expect(value).toEqual(response);
            });
        });
        it('deve lançar RequestTimeoutException quando timeout é excedido', done => {
            mockCallHandler.handle = jest.fn(() => (0, rxjs_1.of)('slow response').pipe((0, operators_1.delay)(200)));
            const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
            result.subscribe({
                error: err => {
                    expect(err).toBeInstanceOf(common_1.RequestTimeoutException);
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
            const moduleDefault = await testing_1.Test.createTestingModule({
                providers: [
                    timeout_interceptor_1.TimeoutInterceptor,
                    {
                        provide: config_1.ConfigService,
                        useValue: mockConfigServiceDefault,
                    },
                ],
            }).compile();
            const interceptorDefault = moduleDefault.get(timeout_interceptor_1.TimeoutInterceptor);
            expect(interceptorDefault).toBeDefined();
        });
        it('deve propagar outros erros que não sejam TimeoutError', done => {
            const customError = new Error('Custom error');
            mockCallHandler.handle = jest.fn(() => (0, rxjs_1.throwError)(() => customError));
            const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
            result.subscribe({
                error: err => {
                    expect(err).toBe(customError);
                    expect(err).not.toBeInstanceOf(common_1.RequestTimeoutException);
                    done();
                },
            });
        });
    });
});
//# sourceMappingURL=timeout.interceptor.spec.js.map