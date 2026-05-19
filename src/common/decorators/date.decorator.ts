import { registerDecorator, ValidationOptions } from 'class-validator';
import { DateIsAfter } from '../validators/date.validator';

export function IsDateAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: DateIsAfter,
    });
  };
}
