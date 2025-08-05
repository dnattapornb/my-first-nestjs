import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(value: any, args: ValidationArguments) {
    const [relatedProperty] = args.constraints;
    const user = await this.usersService.findByEmail(value);
    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return `email '${args.value}' already exists.`;
  }
}
