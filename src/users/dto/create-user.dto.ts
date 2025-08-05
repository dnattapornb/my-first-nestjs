import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { IsUnique } from '../../common/decorators/is-unique.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  readonly uuid?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsUnique({ message: 'email is already registered' })
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
