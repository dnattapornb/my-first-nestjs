import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
