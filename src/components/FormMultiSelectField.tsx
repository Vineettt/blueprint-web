'use client';

import { Controller, Control, FieldValues, Path } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface FormMultiSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;

  control: Control<TFieldValues>;

  label: string;

  options: MultiSelectOption[];

  placeholder?: string;

  disabled?: boolean;

  requiredMessage?: string;
}

export function FormMultiSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Select options',
  disabled = false,
  requiredMessage,
}: FormMultiSelectFieldProps<TFieldValues>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        name={name}
        control={control}
        rules={
          requiredMessage
            ? {
                required: requiredMessage,
              }
            : undefined
        }
        render={({ field, fieldState }) => {
          const selectedValues = Array.isArray(field.value) ? field.value : [];

          return (
            <>
              <MultiSelect
                options={options}
                selected={selectedValues}
                onChange={(values) => {
                  field.onChange(values);
                }}
                placeholder={placeholder}
                disabled={disabled}
              />

              {fieldState.error && (
                <span className="text-sm text-red-500">{fieldState.error.message}</span>
              )}
            </>
          );
        }}
      />
    </div>
  );
}

export default FormMultiSelectField;
