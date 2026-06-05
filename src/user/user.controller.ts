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
import { ApiBearerAuth } from '@nestjs/swagger';
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
  @Roles(Role.ADMIN)
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
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // @Post('refresh')
  // @Roles(Role.ADMIN, Role.SECRETARY, Role.AUCTIONEER)
  // refreshToken(@Query('id') id: string) {
  //   return this.userService.refreshToken(id);
  // }
}
