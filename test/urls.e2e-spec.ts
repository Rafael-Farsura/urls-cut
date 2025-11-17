import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('URLs (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;
  let urlId: string;

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

    // Criar usuário e fazer login
    const email = `test-${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
      });

    userId = registerRes.body.user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email,
        password: 'password123',
      });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/urls', () => {
    it('deve criar URL sem autenticação (público)', () => {
      const uniqueUrl = `https://example.com?t=${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/urls')
        .send({
          originalUrl: uniqueUrl,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('originalUrl', uniqueUrl);
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body.userId).toBeNull();
        });
    });

    it('deve criar URL com autenticação e associar ao usuário', () => {
      const uniqueUrl = `https://example.com/authenticated?t=${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: uniqueUrl,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(userId);
          urlId = res.body.id;
        });
    });

    it('deve validar formato de URL', () => {
      return request(app.getHttpServer())
        .post('/api/urls')
        .send({
          originalUrl: 'not-a-url',
        })
        .expect(400);
    });
  });

  describe('GET /api/urls', () => {
    it('deve listar URLs do usuário autenticado', () => {
      return request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('urls');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.urls)).toBe(true);
        });
    });

    it('deve retornar 401 sem autenticação', () => {
      return request(app.getHttpServer()).get('/api/urls').expect(401);
    });

    it('deve incluir clickCount na listagem', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (res.body.urls.length > 0) {
        expect(res.body.urls[0]).toHaveProperty('clickCount');
      }
    });
  });

  describe('PUT /api/urls/:id', () => {
    it('deve atualizar URL do usuário', async () => {
      // Criar URL específica para atualizar
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: `https://example.com/to-update?t=${Date.now()}`,
        });
      const updateUrlId = createRes.body.id;

      return request(app.getHttpServer())
        .put(`/api/urls/${updateUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://example.com/updated',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.originalUrl).toBe('https://example.com/updated');
        });
    });

    it('deve retornar 403 para URL de outro usuário', async () => {
      // Criar URL do primeiro usuário
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: `https://example.com/to-protect?t=${Date.now()}`,
        });
      const protectedUrlId = createRes.body.id;

      // Criar outro usuário
      const email2 = `test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: email2,
          password: 'password123',
        });

      const loginRes2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: email2,
          password: 'password123',
        });

      const token2 = loginRes2.body.access_token;

      // Tentar atualizar URL do primeiro usuário
      return request(app.getHttpServer())
        .put(`/api/urls/${protectedUrlId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          originalUrl: 'https://example.com/hacked',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/urls/:id', () => {
    it('deve deletar URL do usuário', async () => {
      const uniqueUrl = `https://example.com/to-delete?t=${Date.now()}`;
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: uniqueUrl,
        });

      const deleteId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/urls/${deleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('GET /:shortCode', () => {
    it('deve redirecionar para URL original', async () => {
      const uniqueUrl = `https://example.com/redirect-test?t=${Date.now()}`;
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .send({
          originalUrl: uniqueUrl,
        });

      const shortCode = createRes.body.shortCode;
      expect(shortCode).toBeDefined();
      expect(shortCode.length).toBe(6);

      return request(app.getHttpServer())
        .get(`/${shortCode}`)
        .expect(302)
        .expect('Location', uniqueUrl);
    });

    it('deve retornar 404 para código inexistente', () => {
      return request(app.getHttpServer()).get('/INVALID').expect(404);
    });

    it('deve contabilizar clique ao redirecionar', async () => {
      const uniqueUrl = `https://example.com/click-test?t=${Date.now()}`;
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: uniqueUrl,
        });

      const shortCode = createRes.body.shortCode;
      const urlId = createRes.body.id;

      expect(shortCode).toBeDefined();
      expect(urlId).toBeDefined();

      // Fazer redirecionamento
      await request(app.getHttpServer()).get(`/${shortCode}`).expect(302);

      // Aguardar um pouco para o clique ser registrado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar se clique foi contabilizado
      const listRes = await request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const url = listRes.body.urls.find((u: any) => u.id === urlId);
      expect(url).toBeDefined();
      expect(url.clickCount).toBeGreaterThanOrEqual(1);
    });
  });
});


