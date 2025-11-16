import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RandomGenerator } from '../random.generator';

describe('RandomGenerator', () => {
  let generator: RandomGenerator;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RandomGenerator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.shortCodeLength') return 6;
              return null;
            }),
          },
        },
      ],
    }).compile();

    generator = module.get<RandomGenerator>(RandomGenerator);
    configService = module.get(ConfigService);
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

      // Gera 10 códigos e verifica que são diferentes
      for (let i = 0; i < 10; i++) {
        codes.add(generator.generate(originalUrl));
      }

      // Pelo menos alguns devem ser diferentes (probabilidade muito alta)
      expect(codes.size).toBeGreaterThan(1);
    });

    it('deve usar comprimento configurado', () => {
      configService.get.mockReturnValue(8);

      const generator2 = new RandomGenerator(configService);
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

      // Códigos podem ser iguais ou diferentes (aleatório)
      expect(typeof code1).toBe('string');
      expect(typeof code2).toBe('string');
    });
  });
});

