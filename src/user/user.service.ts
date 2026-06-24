/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entity/user.entity';
import { GetUserQueryDto } from './dto/get-user-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findAll(query: GetUserQueryDto): Promise<{
    items: User[];
    message: string;
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const where: Record<string, any> = {};

    // Apply role filter
    if (query.filterByRole !== undefined) {
      where['role'] = query.filterByRole;
    }

    // Apply status filter
    if (query.filterByStatus !== undefined) {
      where['isActive'] = query.filterByStatus;
    }

    // Build the query conditions
    let queryConditions: Record<string, any> | Record<string, any>[];

    if (query.search) {
      // If search is present, create OR conditions for username/email with AND conditions for role/status
      queryConditions = [
        { username: Like(`%${query.search}%`), ...where },
        { email: Like(`%${query.search}%`), ...where },
      ];
    } else if (Object.keys(where).length > 0) {
      queryConditions = where;
    } else {
      queryConditions = {};
    }

    const users = await this.userRepository.find({
      where: queryConditions as any,
      order: query.sortBy
        ? { [query.sortBy]: query.sortOrder === 'desc' ? 'DESC' : 'ASC' }
        : {},
      skip:
        query.page && query.limit ? (query.page - 1) * query.limit : undefined,
      take: query.limit ? query.limit : undefined,
    });

    return {
      items: users,
      message: 'Lấy danh sách người dùng thành công',
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        totalItems: await this.userRepository.count({
          where: queryConditions as any,
        }),
        totalPages: query.limit
          ? Math.ceil(
              (await this.userRepository.count({
                where: queryConditions as any,
              })) / query.limit,
            )
          : 1,
      },
    };
  }

  async findOne(params: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOneBy(params);

    return user;
  }

  async findOneWithPassword(params: Partial<User>): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(params)
      .getOne();
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
    if (user?.isActive === true) {
      return { message: 'Không thể xóa tài khoản đang hoạt động' };
    }

    if (user) {
      await this.userRepository.remove(user);
    }

    return { message: 'Xóa tài khoản thành công' };
  }
}
