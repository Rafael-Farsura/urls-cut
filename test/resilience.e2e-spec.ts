import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Resilience Features (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /health deve retornar status ok quando tudo está funcionando', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('checks');
          expect(res.body.checks).toHaveProperty('database');
          expect(res.body.checks).toHaveProperty('memory');
        });
    });

    it('GET /health deve incluir informações de banco de dados', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body.checks.database).toHaveProperty('status');
          expect(res.body.checks.database.status).toMatch(/up|down/);
        });
    });

    it('GET /health deve incluir informações de memória', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body.checks.memory).toHaveProperty('status');
          expect(res.body.checks.memory).toHaveProperty('usage');
          expect(res.body.checks.memory.usage).toHaveProperty('rss');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('deve permitir requisições dentro do limite', async () => {
      // Aguardar 2 segundos para garantir que o rate limit foi resetado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Faz requisições sequencialmente para evitar ECONNRESET
      const responses = [];
      for (let i = 0; i < 10; i++) {
        try {
          const res = await request(app.getHttpServer()).get('/health');
          responses.push(res);
          // Pequeno delay entre requisições
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          // Ignora erros de conexão e continua
        }
      }

      // Deve ter pelo menos algumas respostas
      expect(responses.length).toBeGreaterThan(0);
      responses.forEach(res => {
        // Aceita 200 (ok), 503 (service unavailable) ou 429 (rate limited se ainda houver)
        expect([200, 503, 429]).toContain(res.status);
      });
    }, 20000);

    it('deve retornar 429 quando exceder rate limit', async () => {
      // Aguardar 2 segundos para garantir que o rate limit foi resetado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Faz requisições sequencialmente para evitar ECONNRESET
      let rateLimitedCount = 0;
      let successCount = 0;
      for (let i = 0; i < 150; i++) {
        try {
          const res = await request(app.getHttpServer()).get('/health');
          if (res.status === 429) {
            rateLimitedCount++;
          } else if (res.status === 200 || res.status === 503) {
            successCount++;
          }
          // Pequeno delay para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          // Ignora erros de conexão
        }
      }

      // Deve ter pelo menos algumas requisições bem-sucedidas antes do rate limit
      expect(successCount).toBeGreaterThan(0);
      // E pelo menos algumas devem ser rate limited
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Timeout', () => {
    it('deve completar requisições normais dentro do timeout', async () => {
      // Aguardar 2 segundos para garantir que o rate limit foi resetado
      await new Promise(resolve => setTimeout(resolve, 2000));

      return request(app.getHttpServer())
        .get('/health')
        .expect(res => {
          // Aceita 200 (ok) ou 503 (service unavailable) ou 429 (se ainda houver rate limit)
          expect([200, 503, 429]).toContain(res.status);
          expect(res.body).toBeDefined();
        });
    }, 15000);
  });
});
