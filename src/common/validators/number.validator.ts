import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'numberIsGreaterThan', async: false })
export class NumberIsGreaterThan implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    return (
      typeof value === 'number' &&
      typeof relatedValue === 'number' &&
      value >= relatedValue
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];

    return `${args.property} must be greater than or equal to ${relatedPropertyName}`;
  }
}
