import {
  BadRequestException,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import z, { ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodTypeAny) {}

  transform(value: unknown) {
    try {
      if (typeof value !== 'object') return value;
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          `Validation failed (${error.issues[0].path.toString()}): ${error.issues[0].message}`,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
