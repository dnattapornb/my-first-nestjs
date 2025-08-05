import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsUniqueConstraint, IsUniqueConstraintInput, } from '../validators/is-unique.constraint';

export function IsUnique(options: IsUniqueConstraintInput, validationOptions?: ValidationOptions,) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}
