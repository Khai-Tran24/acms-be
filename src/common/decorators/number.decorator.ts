import { registerDecorator, ValidationOptions } from 'class-validator';
import { NumberIsGreaterThan } from '../validators/number.validator';

export function IsGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NumberIsGreaterThan,
    });
  };
}
