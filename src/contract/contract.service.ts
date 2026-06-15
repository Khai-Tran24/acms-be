import { Injectable } from '@nestjs/common';
import { Contract } from './entity/contract.entity';
import { Repository } from 'typeorm';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateContractDto } from './dto/create-contract.dto';
import { GetContractDto } from './dto/get-contract.dto';
import { Role } from 'src/common/enum/role.enum';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private readonly userService: UserService,
  ) {}

  async createContract(
    contract: CreateContractDto,
    userId: string | undefined,
  ): Promise<Contract> {
    const existingContract = await this.contractRepository.findOne({
      where: { regulationNumber: contract.regulationNumber },
    });

    if (existingContract) {
      throw new Error(
        'Đã tồn tại hợp đồng với số quy chế này. Vui lòng chọn số quy chế khác.',
      );
    }

    if (!userId) {
      throw new Error(
        'Người dùng không hợp lệ. Vui lòng đăng nhập để tạo hợp đồng.',
      );
    }

    const [user, auctioneer, secretary] = await Promise.all([
      this.userService.findOne({ id: userId }),
      this.userService.findOne({ id: contract.auctioneer }),
      this.userService.findOne({ id: contract.secretary }),
    ]);

    const contractData = {
      ...contract,
      createdBy: user,
      auctioneer,
      secretary,
      startingPrice: contract.startingPrice.toString(),
      applicationFee: contract.applicationFee.toString(),
      deposit: contract.deposit.toString(),
    } as unknown as Contract;

    return this.contractRepository.save(contractData);
  }

  async getAllContracts(
    query: GetContractDto,
    user: Partial<User>,
  ): Promise<{
    data: Contract[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const queryBuilder = this.contractRepository.createQueryBuilder('contract');

    queryBuilder
      .leftJoinAndSelect('contract.auctioneer', 'auctioneer')
      .leftJoinAndSelect('contract.secretary', 'secretary')
      .leftJoinAndSelect('contract.createdBy', 'createdBy');

    if (user.role !== Role.ADMIN) {
      queryBuilder.where(
        '(contract.auctioneer = :userId OR contract.secretary = :userId OR contract.createdBy = :userId)',
        { userId: user.id },
      );
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(contract.title ILIKE :search OR contract.description ILIKE :search OR contract.regulationNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.filterByUserId) {
      queryBuilder.andWhere(
        '(auctioneer.id = :filterByUserId OR secretary.id = :filterByUserId OR createdBy.id = :filterByUserId)',
        { filterByUserId: query.filterByUserId },
      );
    }

    if (query.startRegisterDate) {
      queryBuilder.andWhere(
        'contract.registerStartDate >= :startRegisterDate',
        {
          startRegisterDate: query.startRegisterDate,
        },
      );
    }

    if (query.endRegisterDate) {
      queryBuilder.andWhere(
        'contract.registerExpiredDate <= :endRegisterDate',
        {
          endRegisterDate: query.endRegisterDate,
        },
      );
    }

    if (query.auctionDate) {
      queryBuilder.andWhere('DATE(contract.auctionDate) = DATE(:auctionDate)', {
        auctionDate: query.auctionDate,
      });
    }

    if (query.sortBy) {
      const order: 'ASC' | 'DESC' =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      if (query.sortBy === 'createdAt') {
        queryBuilder.orderBy('contract.createdAt', order);
      } else if (query.sortBy === 'username') {
        queryBuilder.orderBy('createdBy.username', order);
      } else if (query.sortBy === 'email') {
        queryBuilder.orderBy('createdBy.email', order);
      }
    } else {
      queryBuilder.orderBy('contract.createdAt', 'DESC');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContractById(id: string): Promise<Contract> {
    const QueryBuilder = this.contractRepository.createQueryBuilder('contract');
    const contract = await QueryBuilder.leftJoinAndSelect(
      'contract.auctioneer',
      'auctioneer',
    )
      .leftJoinAndSelect('contract.secretary', 'secretary')
      .leftJoinAndSelect('contract.createdBy', 'createdBy')
      .select([
        'contract',

        'auctioneer.id',
        'auctioneer.username',
        'auctioneer.email',

        'secretary.id',
        'secretary.username',
        'secretary.email',
        'createdBy.id',
        'createdBy.username',
        'createdBy.email',
      ])
      .where('contract.id = :id', {
        id,
      })
      .getOne();
    if (!contract) {
      throw new Error('Không tìm thấy hợp đồng');
    }
    return contract;
  }

  async updateContract(
    id: string,
    updatedContract: Partial<UpdateContractDto>,
  ): Promise<Contract> {
    const [auctioneer, secretary] = await Promise.all([
      this.userService.findOne({ id: updatedContract.auctioneer }),
      this.userService.findOne({ id: updatedContract.secretary }),
    ]);

    const updateData: Partial<UpdateContractDto> & {
      auctioneer?: any;
      secretary?: any;
    } = {
      ...updatedContract,
    };

    if (auctioneer) updateData.auctioneer = auctioneer;
    if (secretary) updateData.secretary = secretary;

    await this.contractRepository.update(id, {
      ...updateData,
      startingPrice: updateData.startingPrice?.toString(),
      applicationFee: updateData.applicationFee?.toString(),
      deposit: updateData.deposit?.toString(),
    });
    return this.getContractById(id);
  }

  async deleteContract(id: string): Promise<void> {
    await this.contractRepository.delete(id);
  }
}
