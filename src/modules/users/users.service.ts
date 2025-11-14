import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) throw new ConflictException('Email já está em uso');
    
    return this.usersRepository.create({
      email,
      passwordHash,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user)
      throw new NotFoundException('Usuário não encontrado');
    

    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) 
        throw new ConflictException('Email já está em uso');

    }

    return this.usersRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) 
      throw new NotFoundException('Usuário não encontrado');
    

    await this.usersRepository.softDelete(id);
  }
}
