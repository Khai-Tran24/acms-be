import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export class DateIsAfter implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    if (!value || !relatedValue) {
      return true;
    }

    const dateValue = new Date(value);
    const relatedDateValue = new Date(relatedValue as string);

    return dateValue > relatedDateValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];

    return `${args.property} must be a date after ${relatedPropertyName}`;
  }
}
