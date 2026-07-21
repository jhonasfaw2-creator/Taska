import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Typography } from './Typography';

interface LinkProps extends Omit<PressableProps, 'style'> {
  label: string;
  onPress?: () => void;
  testID?: string;
}

/**
 * Inline text link used for legal/footer actions. Press handling is provided by
 * the caller (placeholder actions for now).
 */
export const Link: React.FC<LinkProps> = ({ label, onPress, testID, ...rest }) => {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      hitSlop={8}
      className="active:opacity-60"
      {...rest}
    >
      <Typography variant="caption" weight="medium" color="secondary">
        {label}
      </Typography>
    </Pressable>
  );
};

export default Link;
