import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiProduces,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ExportToExcelParamsDto, GetContractDto } from './dto/get-contract.dto';
import { User } from 'src/user/entity/user.entity';
import type { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  getAllContracts(
    @Query() query: GetContractDto,
    @Req() req: { user: Partial<User> },
  ) {
    const user = req.user;
    return this.contractService.getAllContracts(query, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Create a new contract' })
  @ApiBody({ type: CreateContractDto })
  createContract(
    @Body() contractData: CreateContractDto,
    @Req() req: { user: Partial<User> },
  ) {
    const user = req.user;
    return this.contractService.createContract(contractData, user.id);
  }

  @Get('filter-options')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Get filter values for contracts' })
  getContractFilterValue(@Req() req: { user: Partial<User> }) {
    return this.contractService.getContractFilterValue(req.user);
  }

  @Get('export/excel')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Export contracts to Excel' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportContractsToExcel(
    @Query() query: ExportToExcelParamsDto,
    @Req() req: { user: Partial<User> },
    @Res() res: Response,
  ) {
    const buffer = await this.contractService.exportContractsToExcel(
      query,
      req.user,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="contracts-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    );
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  getContractById(@Param('id') id: string) {
    return this.contractService.getContractById(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Delete a contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  deleteContract(@Param('id') id: string) {
    return this.contractService.deleteContract(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Update a contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiBody({ type: UpdateContractDto })
  updateContract(
    @Body() contractData: Partial<UpdateContractDto>,
    @Param('id') id: string,
  ) {
    return this.contractService.updateContract(id, contractData);
  }

  @Patch(':id/discount-price')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Update the discount price of a contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 1000 },
        times: { type: 'number', example: 2 },
      },
      required: ['amount', 'times'],
    },
  })
  updateContractDiscountPrice(
    @Param('id') id: string,
    @Body() discountPrice: { amount: number; times: number },
  ) {
    return this.contractService.updateContractDiscountPrice(id, discountPrice);
  }

  @Delete(':id/discount-price/:index')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiOperation({ summary: 'Delete a discount price from a contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiParam({
    name: 'index',
    description: 'Index of the discount price to delete',
  })
  deleteContractDiscountPrice(
    @Param('id') id: string,
    @Param('index') index: number,
  ) {
    return this.contractService.deleteContractDiscountPrice(id, index);
  }
}
