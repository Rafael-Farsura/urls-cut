import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;

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

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário', () => {
      const email = `test-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(email);
          userId = res.body.user.id;
        });
    });

    it('deve retornar erro 409 quando email já existe', async () => {
      const email = `test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
        })
        .expect(409);
    });

    it('deve validar formato de email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('deve validar tamanho mínimo de senha', () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login e retornar token', async () => {
      const email = `test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password: 'password123',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.access_token;
        });
    });

    it('deve retornar 401 com credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});


