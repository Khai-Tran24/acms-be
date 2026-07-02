import { Injectable } from '@nestjs/common';
import { Contract } from './entity/contract.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateContractDto } from './dto/create-contract.dto';
import {
  ContractExportColumn,
  ExportToExcelParamsDto,
  GetContractDto,
} from './dto/get-contract.dto';
import { Role } from 'src/common/enum/role.enum';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { GetAnalyticsDataDto } from 'src/analytics/dto/get-analytics-query';
import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from 'src/common/enum/contract.enum';
import * as ExcelJS from 'exceljs';

type ContractExcelColumnConfig = {
  header: string;
  key: ContractExportColumn;
  width: number;
  value: (contract: Contract) => string | number | null;
};

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private readonly userService: UserService,
  ) {}

  private buildContractQuery(
    query?: GetContractDto,
    user?: Partial<User>,
  ): SelectQueryBuilder<Contract> {
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

    if (user && user.role !== Role.ADMIN) {
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

    return queryBuilder;
  }

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
    const queryBuilder = this.buildContractQuery(query, user);

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

  async updateContractDiscountPrice(
    id: string,
    discountPrice: { amount: number; times: number },
  ): Promise<Contract> {
    const contract = await this.getContractById(id);
    if (!contract) {
      throw new Error('Không tìm thấy hợp đồng');
    }

    const updatedDiscountPrice = contract.discountPrice;
    updatedDiscountPrice?.unshift(discountPrice);

    await this.contractRepository.update(id, {
      discountPrice: updatedDiscountPrice,
    });
    return this.getContractById(id);
  }

  async deleteContractDiscountPrice(
    id: string,
    index: number,
  ): Promise<Contract> {
    const contract = await this.getContractById(id);
    if (!contract) {
      throw new Error('Không tìm thấy hợp đồng');
    }

    const updatedDiscountPrice = contract.discountPrice;
    if (
      updatedDiscountPrice &&
      index >= 0 &&
      index < updatedDiscountPrice.length
    ) {
      updatedDiscountPrice.splice(index, 1);
    } else {
      throw new Error('Chỉ số không hợp lệ');
    }

    updatedDiscountPrice.sort((a, b) => b.times - a.times);

    await this.contractRepository.update(id, {
      discountPrice: updatedDiscountPrice,
    });
    return this.getContractById(id);
  }

  private formatDate(value?: Date | string | null): string {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString();
  }

  private formatPerson(
    person?: { name: string; phone: string } | null,
  ): string {
    if (!person) {
      return '';
    }

    if (person.name && person.phone) {
      return `${person.name} (${person.phone})`;
    }

    return person.name || person.phone || '';
  }

  private formatDiscountPrice(
    discountPrice?: { amount: number; times: number }[] | null,
  ): string {
    if (!discountPrice?.length) {
      return '';
    }

    return discountPrice
      .map((discount) => `${discount.amount} x ${discount.times}`)
      .join(', ');
  }

  private getContractExcelColumns(): ContractExcelColumnConfig[] {
    return [
      {
        header: 'ID',
        key: ContractExportColumn.ID,
        width: 12,
        value: (contract) => contract.id,
      },
      {
        header: 'Số hợp đồng',
        key: ContractExportColumn.CONTRACT_NUMBER,
        width: 20,
        value: (contract) => contract.contractNumber,
      },
      {
        header: 'Năm',
        key: ContractExportColumn.CONTRACT_YEAR,
        width: 15,
        value: (contract) => contract.contractYear,
      },
      {
        header: 'Tên tài sản',
        key: ContractExportColumn.PROPERTY_NAME,
        width: 30,
        value: (contract) => contract.propertyName,
      },
      {
        header: 'Loại tài sản',
        key: ContractExportColumn.PROPERTY_TYPE,
        width: 20,
        value: (contract) => contract.propertyType,
      },
      {
        header: 'Chủ sở hữu tài sản',
        key: ContractExportColumn.PROPERTY_OWNER,
        width: 25,
        value: (contract) => this.formatPerson(contract.propertyOwner),
      },
      {
        header: 'Người thụ lý',
        key: ContractExportColumn.CASE_OFFICER,
        width: 25,
        value: (contract) => contract.caseOfficer?.username || '',
      },
      {
        header: 'Giá khởi điểm',
        key: ContractExportColumn.STARTING_PRICE,
        width: 20,
        value: (contract) => contract.startingPrice,
      },
      {
        header: 'Giá bán',
        key: ContractExportColumn.WINNING_PRICE,
        width: 20,
        value: (contract) => contract.winningPrice,
      },
      {
        header: 'Giá giảm',
        key: ContractExportColumn.DISCOUNT_PRICE,
        width: 24,
        value: (contract) => this.formatDiscountPrice(contract.discountPrice),
      },
      {
        header: 'Ngày kết thúc đăng ký',
        key: ContractExportColumn.END_REGISTER_DATE,
        width: 24,
        value: (contract) => this.formatDate(contract.endRegisterDate),
      },
      {
        header: 'Ngày đấu giá',
        key: ContractExportColumn.AUCTION_DATE,
        width: 24,
        value: (contract) => this.formatDate(contract.auctionDate),
      },
      {
        header: 'Trạng thái',
        key: ContractExportColumn.STATUS,
        width: 20,
        value: (contract) => contract.status,
      },
      {
        header: 'Người trúng đấu giá',
        key: ContractExportColumn.WINNER,
        width: 25,
        value: (contract) => this.formatPerson(contract.winner),
      },
      {
        header: 'Trạng thái thanh toán',
        key: ContractExportColumn.PAYMENT_STATUS,
        width: 20,
        value: (contract) => contract.paymentStatus,
      },
      {
        header: 'Người tạo',
        key: ContractExportColumn.CREATED_BY,
        width: 25,
        value: (contract) => contract.createdBy?.username || '',
      },
      {
        header: 'Ngày tạo',
        key: ContractExportColumn.CREATED_AT,
        width: 24,
        value: (contract) => this.formatDate(contract.createdAt),
      },
      {
        header: 'Ngày cập nhật',
        key: ContractExportColumn.UPDATED_AT,
        width: 24,
        value: (contract) => this.formatDate(contract.updatedAt),
      },
    ];
  }

  async exportContractsToExcel(
    query?: ExportToExcelParamsDto,
    user?: Partial<User>,
  ): Promise<Buffer> {
    const contracts = await this.buildContractQuery(query, user).getMany();
    const allColumns = this.getContractExcelColumns();
    const selectedColumns = query?.columns?.length
      ? allColumns.filter((column) => query.columns?.includes(column.key))
      : allColumns;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contracts');

    worksheet.columns = selectedColumns.map((column) => ({
      header: column.header,
      key: column.key,
      width: column.width,
    }));

    contracts.forEach((contract) => {
      worksheet.addRow(
        selectedColumns.reduce<Record<string, string | number | null>>(
          (row, column) => {
            row[column.key] = column.value(contract);
            return row;
          },
          {},
        ),
      );
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
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

  async getRecentContracts(): Promise<RecentContractsData[]> {
    const recentContracts = await this.contractRepository
      .createQueryBuilder('contract')
      .select([
        'contract.id',
        'contract.contractNumber',
        'contract.propertyName',
        'contract.propertyType',
        'contract.status',
        'contract.paymentStatus',
        'contract.createdAt',
      ])
      .orderBy('contract.createdAt', 'DESC')
      .take(5)
      .getMany();

    return recentContracts.map((contract) => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      propertyName: contract.propertyName,
      propertyType: contract.propertyType,
      status: contract.status,
      paymentStatus: contract.paymentStatus,
    }));
  }
}

interface RecentContractsData {
  id: string;
  contractNumber: string;
  propertyName: string;
  propertyType: PropertyType;
  status: ContractStatus;
  paymentStatus: PaymentStatus;
}
