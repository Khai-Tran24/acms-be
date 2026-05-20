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
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateContractDto } from './dto/update-contract.dto';
import { GetContractDto } from './dto/get-contract.dto';
import { User } from 'src/user/entity/user.entity';

@ApiBearerAuth()
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
  createContract(
    @Body() contractData: CreateContractDto,
    @Req() req: { user: Partial<User> },
  ) {
    const user = req.user;
    return this.contractService.createContract(contractData, user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  getContractById(@Param('id') id: string) {
    return this.contractService.getContractById(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  deleteContract(@Param('id') id: string) {
    return this.contractService.deleteContract(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  updateContract(
    @Param('id') id: string,
    @Body() contractData: UpdateContractDto,
  ) {
    return this.contractService.updateContract(id, contractData);
  }
}
