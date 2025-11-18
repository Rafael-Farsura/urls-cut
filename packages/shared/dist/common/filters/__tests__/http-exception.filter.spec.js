"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const http_exception_filter_1 = require("../http-exception.filter");
describe('HttpExceptionFilter', () => {
    let filter;
    let configService;
    let mockArgumentsHost;
    let mockResponse;
    let mockRequest;
    beforeEach(async () => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockRequest = {
            url: '/api/test',
            method: 'GET',
        };
        mockArgumentsHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: () => mockResponse,
                getRequest: () => mockRequest,
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                http_exception_filter_1.HttpExceptionFilter,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'NODE_ENV')
                                return 'development';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();
        filter = module.get(http_exception_filter_1.HttpExceptionFilter);
        configService = module.get(config_1.ConfigService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('catch', () => {
        it('deve tratar HttpException corretamente', () => {
            const exception = new common_1.HttpException('Erro de teste', common_1.HttpStatus.BAD_REQUEST);
            filter.catch(exception, mockArgumentsHost);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'Erro de teste',
                path: '/api/test',
                method: 'GET',
            }));
        });
        it('deve tratar erro genérico corretamente', () => {
            const exception = new Error('Erro interno');
            filter.catch(exception, mockArgumentsHost);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 500,
                message: 'Erro interno',
                path: '/api/test',
                method: 'GET',
            }));
        });
        it('deve incluir stack trace em desenvolvimento', () => {
            configService.get.mockReturnValue('development');
            const exception = new Error('Erro de teste');
            filter.catch(exception, mockArgumentsHost);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Error',
                stack: expect.any(String),
            }));
        });
        it('não deve incluir stack trace em produção', () => {
            configService.get.mockImplementation((key) => {
                if (key === 'NODE_ENV')
                    return 'production';
                return null;
            });
            const prodFilter = new http_exception_filter_1.HttpExceptionFilter(configService);
            const exception = new Error('Erro de teste');
            prodFilter.catch(exception, mockArgumentsHost);
            const callArgs = mockResponse.json.mock.calls[0][0];
            expect(callArgs).not.toHaveProperty('stack');
        });
    });
});
//# sourceMappingURL=http-exception.filter.spec.js.map