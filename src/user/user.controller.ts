import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by username or email',
  })
  @ApiQuery({
    name: 'filterByRole',
    required: false,
    enum: Role,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'filterByStatus',
    required: false,
    type: Boolean,
    description: 'Filter by user status (active/inactive)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['username', 'email', 'createdAt'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  findAll(@Query() query: GetUserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ id });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('UpdateUserDto received in controller:', updateUserDto);
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
