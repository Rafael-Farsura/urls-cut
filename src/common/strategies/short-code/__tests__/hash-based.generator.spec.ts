import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HashBasedGenerator } from '../hash-based.generator';

describe('HashBasedGenerator', () => {
  let generator: HashBasedGenerator;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashBasedGenerator,
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

    generator = module.get<HashBasedGenerator>(HashBasedGenerator);
    configService = module.get(ConfigService);
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

      const generator2 = new HashBasedGenerator(configService);
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
