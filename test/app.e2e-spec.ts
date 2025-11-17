import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ShortUrl } from '../src/modules/urls/entities/short-url.entity';
import { Click } from '../src/modules/clicks/entities/click.entity';
import { User } from '../src/modules/users/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;
  let shortUrlId: string;
  let shortCode: string;

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
    // Limpar dados de teste
    if (dataSource && dataSource.isInitialized) {
      try {
        // Deletar com where para evitar erro de critério vazio
        await dataSource.getRepository(Click).createQueryBuilder().delete().execute();
        await dataSource.getRepository(ShortUrl).createQueryBuilder().delete().execute();
        await dataSource.getRepository(User).createQueryBuilder().delete().execute();
      } catch (error) {
        // Ignora erros de limpeza
      }
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /health deve retornar status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Autenticação', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    it('POST /api/auth/register deve criar novo usuário', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email', testEmail);
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('POST /api/auth/register deve retornar erro para email duplicado', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(409);
    });

    it('POST /api/auth/register deve validar email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
        })
        .expect(400);
    });

    it('POST /api/auth/register deve validar senha curta', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('POST /api/auth/login deve autenticar usuário', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.access_token;
        });
    });

    it('POST /api/auth/login deve retornar erro para credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('POST /api/auth/login deve retornar erro para usuário não encontrado', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('URLs - Criação', () => {
    it('POST /api/urls deve criar URL sem autenticação (público)', () => {
      const uniqueUrl = `https://www.google.com?t=${Date.now()}`;
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
          expect(res.body).toHaveProperty('userId', null);
          expect(res.body.shortCode).toHaveLength(6);
        });
    });

    it('POST /api/urls deve criar URL com autenticação', () => {
      const uniqueUrl = `https://www.example.com?t=${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: uniqueUrl,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('originalUrl', uniqueUrl);
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body).toHaveProperty('userId', userId);
          shortUrlId = res.body.id;
          shortCode = res.body.shortCode;
        });
    });

    it('POST /api/urls deve validar URL inválida', () => {
      return request(app.getHttpServer())
        .post('/api/urls')
        .send({
          originalUrl: 'not-a-valid-url',
        })
        .expect(400);
    });

    it('POST /api/urls deve validar URL sem protocolo HTTP/HTTPS', () => {
      return request(app.getHttpServer())
        .post('/api/urls')
        .send({
          originalUrl: 'ftp://example.com',
        })
        .expect(400);
    });
  });

  describe('URLs - Listagem', () => {
    it('GET /api/urls deve listar URLs do usuário autenticado', () => {
      return request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('urls');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.urls)).toBe(true);
          expect(res.body.urls.length).toBeGreaterThanOrEqual(0);
          if (res.body.urls.length > 0) {
            expect(res.body.urls[0]).toHaveProperty('clickCount');
          }
        });
    });

    it('GET /api/urls deve retornar 401 sem autenticação', () => {
      return request(app.getHttpServer()).get('/api/urls').expect(401);
    });
  });

  describe('URLs - Atualização', () => {
    let updateUrlId: string;
    let updateShortCode: string;

    beforeAll(async () => {
      // Criar URL específica para atualizar
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: `https://www.example.com/to-update?t=${Date.now()}`,
        });
      updateUrlId = createRes.body.id;
      updateShortCode = createRes.body.shortCode;
    });

    it('PUT /api/urls/:id deve atualizar URL', () => {
      return request(app.getHttpServer())
        .put(`/api/urls/${updateUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://www.updated-example.com',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('originalUrl', 'https://www.updated-example.com');
          expect(res.body).toHaveProperty('shortCode', updateShortCode);
        });
    });

    it('PUT /api/urls/:id deve retornar 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .put(`/api/urls/${updateUrlId}`)
        .send({
          originalUrl: 'https://www.example.com',
        })
        .expect(401);
    });

    it('PUT /api/urls/:id deve retornar 404 para URL não encontrada', () => {
      return request(app.getHttpServer())
        .put('/api/urls/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://www.example.com',
        })
        .expect(404);
    });
  });

  describe('URLs - Exclusão', () => {
    let deleteUrlId: string;

    beforeAll(async () => {
      // Criar uma URL específica para deletar
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://www.example.com/to-delete',
        });
      deleteUrlId = createRes.body.id;
    });

    it('DELETE /api/urls/:id deve deletar URL', () => {
      return request(app.getHttpServer())
        .delete(`/api/urls/${deleteUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('DELETE /api/urls/:id deve retornar 401 sem autenticação', async () => {
      // Criar nova URL para testar sem auth
      const createRes = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://www.example.com/test-unauth',
        });
      const testId = createRes.body.id;

      return request(app.getHttpServer()).delete(`/api/urls/${testId}`).expect(401);
    });

    it('DELETE /api/urls/:id deve retornar 404 para URL já deletada', () => {
      return request(app.getHttpServer())
        .delete(`/api/urls/${deleteUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Redirecionamento', () => {
    let publicShortCode: string;
    let publicOriginalUrl: string;

    beforeAll(async () => {
      // Criar uma URL pública para teste
      publicOriginalUrl = `https://www.google.com?t=${Date.now()}`;
      const response = await request(app.getHttpServer()).post('/api/urls').send({
        originalUrl: publicOriginalUrl,
      });
      publicShortCode = response.body.shortCode;
    });

    it('GET /:shortCode deve redirecionar para URL original', () => {
      return request(app.getHttpServer())
        .get(`/${publicShortCode}`)
        .expect(302)
        .expect('Location', publicOriginalUrl);
    });

    it('GET /:shortCode deve retornar 404 para código inválido', () => {
      return request(app.getHttpServer()).get('/invalid').expect(404);
    });

    it('GET /:shortCode deve contabilizar clique', async () => {
      // Criar nova URL para teste
      const uniqueUrl = `https://www.test.com?t=${Date.now()}`;
      const createResponse = await request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: uniqueUrl,
        });

      const testShortCode = createResponse.body.shortCode;
      const testShortUrlId = createResponse.body.id;

      expect(testShortCode).toBeDefined();
      expect(testShortUrlId).toBeDefined();

      // Acessar URL
      await request(app.getHttpServer()).get(`/${testShortCode}`).expect(302);

      // Aguardar um pouco para o clique ser registrado
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verificar se clique foi registrado
      const listResponse = await request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const url = listResponse.body.urls.find((u: any) => u.id === testShortUrlId);
      expect(url).toBeDefined();
      expect(url.clickCount).toBeGreaterThan(0);
    });
  });
});
