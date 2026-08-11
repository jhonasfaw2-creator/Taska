import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, type MobileIconName } from '../Icon';
import { Typography } from './Typography';

type InputVariant = 'phone' | 'search' | 'otp' | 'text' | 'multiline' | 'dropdown';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  helperText?: string;
  characterCount?: { current: number; max: number };
  variant?: InputVariant;
  onPress?: () => void;
  style?: TextInputProps['style'];
}

const VARIANT_ICONS: Partial<Record<InputVariant, MobileIconName>> = {
  phone: 'phone',
  search: 'search',
};

export function Input({
  label,
  required,
  error,
  touched,
  helperText,
  characterCount,
  variant = 'text',
  onPress,
  value,
  placeholder,
  editable = true,
  className,
  accessibilityLabel,
  ...inputProps
}: InputProps) {
  const showError = Boolean(touched && error);
  const isDropdown = variant === 'dropdown';
  const icon = VARIANT_ICONS[variant];
  const minHeight = variant === 'multiline' ? 'min-h-[120px]' : 'min-h-[52px]';
  const containerClassName = [
    'flex-row items-center rounded-xl border bg-surface px-md',
    minHeight,
    showError ? 'border-error' : 'border-border',
    !editable ? 'opacity-60' : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && <Icon name={icon} size={20} color="#64748B" accessibilityLabel={label ?? variant} />}
      {isDropdown ? (
        <Typography
          variant="body"
          color={value ? 'primary' : 'secondary'}
          className="flex-1 py-sm"
          numberOfLines={1}
        >
          {value || placeholder || 'Select an option'}
        </Typography>
      ) : (
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          editable={editable}
          multiline={variant === 'multiline'}
          textAlignVertical={variant === 'multiline' ? 'top' : 'center'}
          keyboardType={variant === 'phone' || variant === 'otp' ? 'phone-pad' : inputProps.keyboardType}
          maxLength={variant === 'otp' ? 6 : inputProps.maxLength}
          className={`flex-1 py-sm text-body text-text-primary ${className ?? ''}`}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={showError ? error : undefined}
          accessibilityState={{ disabled: !editable }}
          {...inputProps}
        />
      )}
      {isDropdown && <Icon name="chevronDown" size={18} color="#64748B" accessibilityLabel="Open options" />}
    </>
  );

  return (
    <View className="pb-lg">
      {label && (
        <View className="mb-xs flex-row items-center justify-between px-xs">
          <Typography variant="caption" weight="semibold" className="uppercase tracking-wide text-text-secondary">
            {label}{required ? ' *' : ''}
          </Typography>
          {characterCount && (
            <Typography variant="caption" color="secondary" className={characterCount.current > characterCount.max ? 'text-error' : ''}>
              {characterCount.current}/{characterCount.max}
            </Typography>
          )}
        </View>
      )}
      {isDropdown ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder ?? 'Select an option'}
          accessibilityHint={showError ? error : 'Double tap to choose an option'}
          accessibilityState={{ disabled: !editable, expanded: false }}
          disabled={!editable}
          onPress={onPress}
          className={containerClassName}
          activeOpacity={0.75}
        >
          {content}
        </TouchableOpacity>
      ) : (
        <View className={containerClassName}>{content}</View>
      )}
      {showError ? (
        <Typography variant="caption" className="mt-xs px-xs text-error">{error}</Typography>
      ) : helperText ? (
        <Typography variant="caption" color="secondary" className="mt-xs px-xs">{helperText}</Typography>
      ) : null}
    </View>
  );
}

export default Input;
