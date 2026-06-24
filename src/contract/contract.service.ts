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
      where: { contractNumber: contract.contractNumber },
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

    const [user] = await Promise.all([
      this.userService.findOne({ id: userId }),
    ]);

    const contractData = {
      ...contract,
      createdBy: user,
      startingPrice: contract.startingPrice.toString(),
      winningPrice: contract.winningPrice.toString() || null,
    } as unknown as Contract;

    return this.contractRepository.save(contractData);
  }

  async getAllContracts(
    query: GetContractDto,
    user: Partial<User>,
  ): Promise<{
    items: Contract[];
    message: string;
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.caseOfficer', 'caseOfficer')
      .leftJoinAndSelect('contract.createdBy', 'createdBy')
      .select([
        'contract',

        'caseOfficer.id',
        'caseOfficer.username',
        'caseOfficer.email',

        'createdBy.id',
        'createdBy.username',
        'createdBy.email',
      ]);

    if (user.role !== Role.ADMIN) {
      queryBuilder.where(
        '(contract.caseOfficer = :userId OR contract.createdBy = :userId)',
        { userId: user.id },
      );
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(contract.propertyName ILIKE :search OR contract.contractNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.filterByYear) {
      queryBuilder.andWhere('contract.contractYear = :filterByYear', {
        filterByYear: query.filterByYear,
      });
    }

    if (query.filterByUserId) {
      queryBuilder.andWhere(
        '(caseOfficer.id = :filterByUserId OR createdBy.id = :filterByUserId)',
        { filterByUserId: query.filterByUserId },
      );
    }

    if (query.endRegisterDate) {
      queryBuilder.andWhere('contract.endRegisterDate <= :endRegisterDate', {
        endRegisterDate: query.endRegisterDate,
      });
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
      } else if (query.sortBy === 'year') {
        queryBuilder.orderBy('contract.contractYear', order);
      } else if (query.sortBy === 'contractNumber') {
        queryBuilder.orderBy('contract.contractNumber', order);
      } else if (query.sortBy === 'propertyName') {
        queryBuilder.orderBy('contract.propertyName', order);
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
      items: data,
      message: 'Lấy danh sách hợp đồng thành công',
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
      'contract.caseOfficer',
      'caseOfficer',
    )
      .leftJoinAndSelect('contract.createdBy', 'createdBy')
      .select([
        'contract',

        'caseOfficer.id',
        'caseOfficer.username',
        'caseOfficer.email',

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
    const caseOfficer = await this.userService.findOne({
      id: updatedContract.caseOfficer,
    });

    const updateData: Partial<UpdateContractDto> = {
      ...updatedContract,
    };

    if (caseOfficer) {
      updateData.caseOfficer = caseOfficer.id;
    }

    await this.contractRepository.update(id, {
      ...updateData,
    } as unknown as Contract);
    return this.getContractById(id);
  }

  async deleteContract(id: string): Promise<void> {
    await this.contractRepository.delete(id);
  }
}
