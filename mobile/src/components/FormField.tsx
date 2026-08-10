import { View, TextInput, TextInputProps } from 'react-native';
import { Typography } from '@/components/ui';

interface FormFieldProps extends TextInputProps {
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
  const showError = touched && error;

  return (
    <View className="pb-lg">
      <View className="mb-xs flex-row items-center justify-between px-xs">
        <Typography
          variant="caption"
          weight="medium"
          className="uppercase tracking-wide text-text-secondary"
        >
          {label}
          {required && (
            <Typography variant="caption" className="text-error">
              {' *'}
            </Typography>
          )}
        </Typography>
        {characterCount && (
          <Typography
            variant="caption"
            color="secondary"
            className={characterCount.current > characterCount.max ? 'text-error' : ''}
          >
            {characterCount.current}/{characterCount.max}
          </Typography>
        )}
      </View>
      <View
        className={`rounded-xl border bg-surface px-md ${
          showError ? 'border-error' : 'border-border'
        }`}
      >
        <TextInput
          placeholderTextColor="#94A3B8"
          autoComplete="off"
          className={`py-md text-body text-text-primary ${className ?? ''}`}
          {...inputProps}
        />
      </View>
      {showError && (
        <View className="mt-xs px-xs">
          <Typography variant="caption" className="text-error">
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
}
