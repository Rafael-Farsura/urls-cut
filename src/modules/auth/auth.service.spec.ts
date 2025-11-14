import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    shortUrls: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('deve fazer hash da senha corretamente', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('verifyPassword', () => {
    it('deve retornar true para senha válida', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('deve retornar false para senha inválida', async () => {
      const plainPassword = 'wrongPassword';
      const hashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('validateUser', () => {
    it('deve retornar usuário para credenciais válidas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve retornar null para usuário não encontrado', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('deve retornar null para senha inválida', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('deve gerar token JWT corretamente', async () => {
      const token = 'generatedToken';
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.generateToken(mockUser);

      expect(result).toBe(token);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('register', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const token = 'generatedToken';

      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.register(email, password);

      expect(result).toEqual({
        access_token: token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.create).toHaveBeenCalledWith(email, hashedPassword);
    });

    it('deve lançar ConflictException se email já existe', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(email, password)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'generatedToken';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login(email, password);

      expect(result).toEqual({
        access_token: token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para usuário não encontrado', async () => {
      const email = 'notfound@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

