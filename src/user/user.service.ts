import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { GetUserQueryDto } from './dto/get-user-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(query: GetUserQueryDto): Promise<User[]> {
    return this.userRepository.find({
      where: query.search
        ? [{ username: query.search }, { email: query.search }]
        : {},
      order: query.sortBy
        ? { [query.sortBy]: query.sortOrder === 'desc' ? 'DESC' : 'ASC' }
        : {},
      skip: query.pagination
        ? (query.pagination.page - 1) * query.pagination.limit
        : undefined,
      take: query.pagination ? query.pagination.limit : undefined,
    });
  }

  async findOne(params: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOneBy(params);
    return user;
  }

  async activateUser(id: string) {
    await this.userRepository.update({ id: id }, { isActive: true });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id: id }, updateUserDto);
    return this.findOne({ id: id });
  }

  async remove(id: string) {
    const user = await this.findOne({ id: id });
    if (user) {
      await this.userRepository.remove(user);
    }
    return user;
  }
}
