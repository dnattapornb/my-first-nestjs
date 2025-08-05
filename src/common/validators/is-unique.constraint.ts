import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IsUniqueConstraintInput {
  table: string;
  column: string;
}

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const { table, column }: IsUniqueConstraintInput = args.constraints[0];

    const record = await this.prisma[table].findFirst({
      where: { [column]: value },
    });

    return !record;
  }

  defaultMessage(args: ValidationArguments) {
    const { table, column }: IsUniqueConstraintInput = args.constraints[0];

    return `${column} '${args.value}' already exists in ${table}.`;
  }
}
