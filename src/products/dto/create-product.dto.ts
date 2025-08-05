import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { IsUnique } from '../../common/decorators/is-unique.decorator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsUnique(
    { table: 'product', column: 'sku' },
    { message: 'SKU already exists.' },
  )
  readonly sku: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  readonly price: number;

  @IsNumber()
  @Min(0)
  readonly stock: number;
}
