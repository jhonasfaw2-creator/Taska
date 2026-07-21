import React from 'react';
import { View } from 'react-native';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Brand mark for the Taska app. Colors are driven by the theme primary tokens
 * (Tailwind utilities + CSS vars) so it adapts to light/dark automatically.
 */
export const Logo: React.FC<LogoProps> = ({ size = 96, className }) => {
  const inner = Math.round(size * 0.6);

  return (
    <View
      className={[
        'items-center justify-center rounded-lg bg-primary',
        className ?? '',
      ].join(' ')}
      style={{ width: size, height: size }}
    >
      <View
        className="items-center justify-center rounded-md bg-primary-variant"
        style={{ width: inner, height: inner }}
      />
    </View>
  );
};

export default Logo;
