'use client';

import { Controller, Control, FieldValues, Path } from 'react-hook-form';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SelectOption<TValue = string | number> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

interface RHFSelectProps<
  TFieldValues extends FieldValues,
  TValue extends string | number = string,
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;

  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;

  options: SelectOption<TValue>[];

  rules?: object;

  parseValue?: (value: string) => TValue;
}

export function RHFSelect<
  TFieldValues extends FieldValues,
  TValue extends string | number = string,
>({
  name,
  control,
  label,
  placeholder = 'Select...',
  disabled,
  className,
  options,
  rules,
  parseValue = (v) => v as TValue,
}: RHFSelectProps<TFieldValues, TValue>) {
  const normalizedOptions = options.map((opt) => ({
    ...opt,
    value: String(opt.value).trim(),
  }));

  return (
    <div className={cn('grid gap-2', className)}>
      {label && <Label>{label}</Label>}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          const rawFieldValue = field.value;
          const selectValue =
            rawFieldValue !== undefined && rawFieldValue !== null
              ? String(rawFieldValue).trim()
              : '';

          return (
            <Select
              value={selectValue}
              onValueChange={(val) => {
                field.onChange(parseValue(val || ''));
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue>
                  {options.find((o) => String(o.value) === String(field.value))?.label ??
                    placeholder}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {normalizedOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
    </div>
  );
}
