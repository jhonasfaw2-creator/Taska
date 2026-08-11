import InputControl, { type InputProps } from '@/components/ui/Input';

interface FormFieldProps extends Omit<InputProps, 'label' | 'error' | 'touched' | 'characterCount'> {
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  characterCount?: { current: number; max: number };
}

export function FormField({
  label,
  required,
  error,
  touched,
  characterCount,
  className,
  ...inputProps
}: FormFieldProps) {
  return (
    <InputControl
      label={label}
      required={required}
      error={error}
      touched={touched}
      characterCount={characterCount}
      autoComplete="off"
      {...inputProps}
    />
  );
}
