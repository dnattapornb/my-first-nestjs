import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { IsUnique } from '../../common/decorators/is-unique.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  @IsUnique({ table: 'user', column: 'uuid' }, { message: 'This uuid is already exists' })
  readonly uuid?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsUnique({ table: 'user', column: 'email' }, { message: 'This email is already registered' })
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  readonly lastName: string;
}
