"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const hash_based_generator_1 = require("../hash-based.generator");
describe('HashBasedGenerator', () => {
    let generator;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                hash_based_generator_1.HashBasedGenerator,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'app.shortCodeLength')
                                return 6;
                            return null;
                        }),
                    },
                },
            ],
        }).compile();
        generator = module.get(hash_based_generator_1.HashBasedGenerator);
        configService = module.get(config_1.ConfigService);
    });
    describe('generate', () => {
        it('deve gerar código de 6 caracteres', () => {
            const originalUrl = 'https://example.com';
            const code = generator.generate(originalUrl);
            expect(code).toHaveLength(6);
        });
        it('deve gerar código determinístico (mesma URL = mesmo código)', () => {
            const originalUrl = 'https://example.com';
            const code1 = generator.generate(originalUrl);
            const code2 = generator.generate(originalUrl);
            expect(code1).toBe(code2);
        });
        it('deve gerar códigos diferentes para URLs diferentes', () => {
            const url1 = 'https://example.com';
            const url2 = 'https://google.com';
            const code1 = generator.generate(url1);
            const code2 = generator.generate(url2);
            expect(code1).not.toBe(code2);
        });
        it('deve usar comprimento configurado', () => {
            configService.get.mockReturnValue(8);
            const generator2 = new hash_based_generator_1.HashBasedGenerator(configService);
            const code = generator2.generate('https://example.com');
            expect(code).toHaveLength(8);
        });
        it('deve gerar código alfanumérico', () => {
            const originalUrl = 'https://example.com';
            const code = generator.generate(originalUrl);
            expect(code).toMatch(/^[a-zA-Z0-9]+$/);
        });
    });
});
//# sourceMappingURL=hash-based.generator.spec.js.map