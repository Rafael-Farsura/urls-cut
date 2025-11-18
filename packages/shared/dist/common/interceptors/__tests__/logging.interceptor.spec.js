"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const logging_interceptor_1 = require("../logging.interceptor");
const rxjs_1 = require("rxjs");
describe('LoggingInterceptor', () => {
    let interceptor;
    let configService;
    let mockExecutionContext;
    let mockCallHandler;
    beforeEach(async () => {
        const mockRequest = {
            method: 'GET',
            url: '/api/test',
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('Mozilla/5.0'),
        };
        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: () => mockRequest,
                getResponse: () => ({
                    statusCode: 200,
                }),
            }),
        };
        mockCallHandler = {
            handle: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                logging_interceptor_1.LoggingInterceptor,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'ENABLE_LOGGING')
                                return 'true';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();
        interceptor = module.get(logging_interceptor_1.LoggingInterceptor);
        configService = module.get(config_1.ConfigService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('intercept', () => {
        it('deve logar requisição e resposta quando habilitado', done => {
            mockCallHandler.handle = jest.fn().mockReturnValue((0, rxjs_1.of)({ data: 'test' }));
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: () => {
                    expect(mockCallHandler.handle).toHaveBeenCalled();
                    done();
                },
            });
        });
        it('não deve logar quando desabilitado', done => {
            configService.get.mockReturnValue('false');
            mockCallHandler.handle = jest.fn().mockReturnValue((0, rxjs_1.of)({ data: 'test' }));
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: () => {
                    expect(mockCallHandler.handle).toHaveBeenCalled();
                    done();
                },
            });
        });
        it('deve logar erros', done => {
            const error = new Error('Test error');
            mockCallHandler.handle = jest.fn().mockReturnValue((0, rxjs_1.throwError)(() => error));
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                error: () => {
                    expect(mockCallHandler.handle).toHaveBeenCalled();
                    done();
                },
            });
        });
    });
});
//# sourceMappingURL=logging.interceptor.spec.js.map