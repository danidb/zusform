import { ZodSchema, z } from "zod";
export type ValidationIssue = {
  message: string;
  name: string;
  call_path: (string | number)[];
  error: any;
};

export type ValidationResult = {
  is_valid: boolean;
  issues: ValidationIssue[];
};

export interface Validator {
  is_field_required?: (path: (string | number)[]) => boolean;
  validate: (data: any) => Promise<ValidationResult>;
}

export class ZodValidator implements Validator {
  form_schema: ZodSchema;

  constructor(schema: ZodSchema) {
    this.form_schema = schema;
  }

  async validate(data: any) {
    const parsed = await this.form_schema.safeParseAsync(data);
    if (parsed.success) {
      return {
        is_valid: true,
        issues: [],
      };
    }
    console.log({ error: parsed.error });
    return {
      is_valid: false,
      issues: [],
    };
  }
}
