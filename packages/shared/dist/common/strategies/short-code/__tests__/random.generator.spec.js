"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const random_generator_1 = require("../random.generator");
describe('RandomGenerator', () => {
    let generator;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                random_generator_1.RandomGenerator,
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
        generator = module.get(random_generator_1.RandomGenerator);
        configService = module.get(config_1.ConfigService);
    });
    describe('generate', () => {
        it('deve gerar código de 6 caracteres', () => {
            const originalUrl = 'https://example.com';
            const code = generator.generate(originalUrl);
            expect(code).toHaveLength(6);
        });
        it('deve gerar códigos diferentes a cada chamada', () => {
            const originalUrl = 'https://example.com';
            const codes = new Set();
            for (let i = 0; i < 10; i++) {
                codes.add(generator.generate(originalUrl));
            }
            expect(codes.size).toBeGreaterThan(1);
        });
        it('deve usar comprimento configurado', () => {
            configService.get.mockReturnValue(8);
            const generator2 = new random_generator_1.RandomGenerator(configService);
            const code = generator2.generate('https://example.com');
            expect(code).toHaveLength(8);
        });
        it('deve gerar código alfanumérico', () => {
            const originalUrl = 'https://example.com';
            const code = generator.generate(originalUrl);
            expect(code).toMatch(/^[a-zA-Z0-9]+$/);
        });
        it('deve ignorar originalUrl (não determinístico)', () => {
            const url1 = 'https://example.com';
            const url2 = 'https://google.com';
            const code1 = generator.generate(url1);
            const code2 = generator.generate(url2);
            expect(typeof code1).toBe('string');
            expect(typeof code2).toBe('string');
        });
    });
});
//# sourceMappingURL=random.generator.spec.js.map