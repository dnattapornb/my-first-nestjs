import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
