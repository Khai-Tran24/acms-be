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
import { GetAnalyticsDataDto } from 'src/analytics/dto/get-analytics-query';

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

    console.log('Existing contract:', contract);

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
      createdBy: user?.id,
      startingPrice: contract.startingPrice || null,
      winningPrice: contract.winningPrice || null,
    } as unknown as Contract;

    return this.contractRepository.save(contractData);
  }

  async getAllContracts(
    query?: GetContractDto,
    user?: Partial<User>,
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

    if (user?.role !== Role.ADMIN) {
      queryBuilder.where(
        '(contract.caseOfficer = :userId OR contract.createdBy = :userId)',
        { userId: user?.id },
      );
    }

    if (query?.search) {
      queryBuilder.andWhere(
        '(contract.propertyName ILIKE :search OR contract.contractNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query?.filterByYear) {
      queryBuilder.andWhere('contract.contractYear = :filterByYear', {
        filterByYear: query.filterByYear,
      });
    }

    if (query?.filterByUserId) {
      queryBuilder.andWhere(
        '(caseOfficer.id = :filterByUserId OR createdBy.id = :filterByUserId)',
        { filterByUserId: query.filterByUserId },
      );
    }

    if (query?.endRegisterDate) {
      queryBuilder.andWhere('contract.endRegisterDate <= :endRegisterDate', {
        endRegisterDate: query.endRegisterDate,
      });
    }

    if (query?.auctionDate) {
      queryBuilder.andWhere('DATE(contract.auctionDate) = DATE(:auctionDate)', {
        auctionDate: query.auctionDate,
      });
    }

    if (query?.sortBy) {
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

    const page = query?.page || 1;
    const limit = query?.limit || 10;
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

  async getContractFilterValue(user: Partial<User>): Promise<{
    years: number[];
    caseOfficers: { id: string; username: string; role: string }[];
  }> {
    console.log('User in getContractFilterValue:', user);

    const years = await this.contractRepository
      .createQueryBuilder('contract')
      .select('DISTINCT contract.contractYear', 'year')
      .orderBy('year', 'DESC')
      .getRawMany();

    const caseOfficers = await this.userService.findAll();

    return {
      caseOfficers: caseOfficers.items.map((officer) => ({
        id: officer.id,
        username: officer.username,
        role: officer.role,
      })),
      years: years.map((year: { year: number }) => year.year),
    };
  }

  async computeContractsSummary(query: GetAnalyticsDataDto): Promise<{
    totalContracts: number;
    contractsByStatus: Record<string, number>;
    contractsByPropertyType: Record<string, number>;
    contractsByPaymentStatus: Record<string, number>;
  }> {
    const baseQuery = this.contractRepository.createQueryBuilder('contract');

    if (query?.startDate) {
      baseQuery.andWhere('contract.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query?.endDate) {
      baseQuery.andWhere('contract.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    // 1. total count (isolated)
    const totalContracts = await baseQuery.clone().getCount();

    // 2. status breakdown
    const statusRows = await baseQuery
      .clone()
      .select('contract.status', 'key')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.status')
      .getRawMany<{ key: string; count: string }>();

    // 3. property type breakdown
    const propertyRows = await baseQuery
      .clone()
      .select('contract.propertyType', 'key')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.propertyType')
      .getRawMany<{ key: string; count: string }>();

    // 4. payment status breakdown
    const paymentRows = await baseQuery
      .clone()
      .select('contract.paymentStatus', 'key')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.paymentStatus')
      .getRawMany<{ key: string; count: string }>();

    return {
      totalContracts,
      contractsByStatus: this.toMap(statusRows),
      contractsByPropertyType: this.toMap(propertyRows),
      contractsByPaymentStatus: this.toMap(paymentRows),
    };
  }

  private toMap(rows: { key: string; count: string }[]) {
    return rows.reduce(
      (acc, curr) => {
        acc[curr.key] = Number(curr.count);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getContractChartData(query: GetAnalyticsDataDto): Promise<{
    contractsOverTime: { labels: string[]; data: number[] };
    percentageOfContractsByStatus: { labels: string[]; data: number[] };
    percentageOfContractsByPropertyType: { labels: string[]; data: number[] };
    percentageOfContractsByPaymentStatus: { labels: string[]; data: number[] };
  }> {
    const baseQuery = this.contractRepository.createQueryBuilder('contract');

    if (query?.startDate) {
      baseQuery.andWhere('contract.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query?.endDate) {
      baseQuery.andWhere('contract.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    // if (query?.period) {
    //   let dateTrunc: string;
    //   switch (query.period) {
    //     case 'day':
    //       dateTrunc = "TO_CHAR(contract.createdAt, 'YYYY-MM-DD')";
    //       break;
    //     case 'week':
    //       dateTrunc =
    //         "TO_CHAR(DATE_TRUNC('week', contract.createdAt), 'YYYY-MM-DD')";
    //       break;
    //     case 'month':
    //       dateTrunc = "TO_CHAR(contract.createdAt, 'YYYY-MM')";
    //       break;
    //     default:
    //       throw new Error('Invalid period. Must be one of: day, week, month.');
    //   }

    //   baseQuery.addSelect(`${dateTrunc} AS period`);
    // }

    // 1. Contracts over time
    const contractsOverTimeRows = await baseQuery
      .clone()
      .select("TO_CHAR(contract.createdAt, 'YYYY-MM-DD')", 'label')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy("TO_CHAR(contract.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(contract.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<{ label: string; count: string }>();

    // 2. Percentage of contracts by status
    const statusRows = await baseQuery
      .clone()
      .select('contract.status', 'label')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.status')
      .getRawMany<{ label: string; count: string }>();

    // 3. Percentage of contracts by property type
    const propertyRows = await baseQuery
      .clone()
      .select('contract.propertyType', 'label')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.propertyType')
      .getRawMany<{ label: string; count: string }>();

    // 4. Percentage of contracts by payment status
    const paymentRows = await baseQuery
      .clone()
      .select('contract.paymentStatus', 'label')
      .addSelect('COUNT(contract.id)', 'count')
      .groupBy('contract.paymentStatus')
      .getRawMany<{ label: string; count: string }>();

    return {
      contractsOverTime: {
        labels: contractsOverTimeRows.map((row) => row.label),
        data: contractsOverTimeRows.map((row) => Number(row.count)),
      },
      percentageOfContractsByStatus: {
        labels: statusRows.map((row) => row.label),
        data: statusRows.map((row) => Number(row.count)),
      },
      percentageOfContractsByPropertyType: {
        labels: propertyRows.map((row) => row.label),
        data: propertyRows.map((row) => Number(row.count)),
      },
      percentageOfContractsByPaymentStatus: {
        labels: paymentRows.map((row) => row.label),
        data: paymentRows.map((row) => Number(row.count)),
      },
    };
  }
}
