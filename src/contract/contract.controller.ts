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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateContractDto } from './dto/update-contract.dto';
import { GetContractDto } from './dto/get-contract.dto';
import { User } from 'src/user/entity/user.entity';

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
    console.log('User in getContractFilterValue:', req.user);
    return this.contractService.getContractFilterValue(req.user);
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
}
