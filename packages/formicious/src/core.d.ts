export type FieldValue = string | number | boolean | FieldValue[] | { [index: string]: FieldValue }
export interface FieldMeta {
    touched: boolean;
    error: boolean;
    errors: ValidationError[];
}

export interface Validator {
    validate: (obj: FieldValue) => ValidationError[];
    validateField: (key: string, obj: FieldValue) => ValidationError[]
}

export interface ValidationError {
    name: string;
    error: string;
    value: FieldValue;
}
export type setField = (set, get, key: string, value: FieldValue) => void
export type deleteField = (set, get, key: string) => void
export type validateField = (set, get, key: string) => void
export type swapField = (set, get, keyA: string, keyB: string) => void
export type registerField = (set, get, key: string, value?: FieldValue, meta?: FieldMeta, validators?: Validator[]) => FieldMeta
export type getDefaultMetadata = () => FieldMeta
