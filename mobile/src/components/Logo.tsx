/**
 * Taska Logo Component (Legacy)
 *
 * Backward-compatible wrapper around the new design system Logo.
 * New code should use src/components/ui/Logo.tsx instead.
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Logo as NewLogo } from './ui/Logo';

interface LogoProps {
  size?: number;
  theme?: any;
  style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({ size = 120, style }) => {
  return <NewLogo size={size} className={style ? '' : undefined} />;
};

export default Logo;
