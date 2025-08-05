import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRISMA_ERROR_CODES } from '../common/constants/prisma.constants';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Product[]> {
    return this.databaseService.product.findMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.databaseService.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.databaseService.product.create({
      data: createProductDto,
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      return await this.databaseService.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new NotFoundException(`Product with ID #${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Product> {
    try {
      return await this.databaseService.product.delete({ where: { id } });
    } catch (error) {
      if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new NotFoundException(`Product with ID #${id} not found`);
      }
      throw error;
    }
  }
}
