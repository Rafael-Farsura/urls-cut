import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
      const requests = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/health'));

      const responses = await Promise.all(requests);
      responses.forEach(res => {
        expect([200, 503]).toContain(res.status);
      });
    });

    it('deve retornar 429 quando exceder rate limit', async () => {
      // Faz muitas requisições rapidamente
      const requests = Array(150)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/health'));

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(res => res.status === 429);

      // Pelo menos algumas devem ser rate limited
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Timeout', () => {
    it('deve completar requisições normais dentro do timeout', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
        });
    });
  });
});


