import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PermissionAction } from '@prisma/client';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.READ, 'Product'])
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.CREATE, 'Product'])
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @RequirePermissions([PermissionAction.UPDATE, 'Product'])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MODERATOR) // [TH] USER ทั่วไปไม่ควรลบได้
  @RequirePermissions([PermissionAction.DELETE, 'Product'])
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
