import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthorizationGuard } from '../auth/guards/authorization.guard';
import { Role, PermissionAction } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  getProfile(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.READ, 'User'])
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.CREATE, 'User'])
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.UPDATE, 'User'])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.DELETE, 'User'])
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
