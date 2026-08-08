/**
 * Taska Design Tokens — Motion
 *
 * Modern, purposeful animation system
 * Inspiration: Material 3, Linear, Apple HIG
 */

export const animation = {
  /**
   * Duration — How long animations take
   */
  duration: {
    instant: 0,
    fastest: 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },

  /**
   * Easing — How animations feel
   */
  easing: {
    // Standard easing
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Emphasized (Material 3)
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',

    // Standard (Material 3)
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',

    // Spring (playful)
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

/**
 * Preset animations — Ready-to-use transitions
 */
export const transition = {
  // Fade
  fadeIn: {
    duration: animation.duration.normal,
    easing: animation.easing.easeOut,
  },
  fadeOut: {
    duration: animation.duration.normal,
    easing: animation.easing.easeIn,
  },

  // Scale
  scaleIn: {
    duration: animation.duration.normal,
    easing: animation.easing.emphasizedDecelerate,
  },
  scaleOut: {
    duration: animation.duration.normal,
    easing: animation.easing.emphasizedAccelerate,
  },

  // Slide
  slideInFromBottom: {
    duration: animation.duration.slow,
    easing: animation.easing.emphasizedDecelerate,
  },
  slideOutToBottom: {
    duration: animation.duration.normal,
    easing: animation.easing.emphasizedAccelerate,
  },

  // Color
  color: {
    duration: animation.duration.fast,
    easing: animation.easing.linear,
  },
} as const;

/**
 * Opacity levels
 */
export const opacity = {
  transparent: 0,
  disabled: 0.4,
  disabledInput: 0.5,
  pressed: 0.8,
  hover: 0.9,
  skeleton: 0.6,
  overlay: 0.5,
  modalOverlay: 0.4,
  ripple: 0.12,
} as const;

/**
 * Z-index scale — Consistent layering
 */
export const zIndex = {
  hide: -1,
  auto: 'auto' as const,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  toast: 1070,
  tooltip: 1080,
} as const;

/**
 * Focus ring — Accessible focus indicators
 */
export const focusRing = {
  width: 2,
  offset: 2,
  color: 'rgba(37, 99, 235, 0.5)', // Primary with opacity
  style: 'solid' as const,
} as const;

export type AnimationDuration = keyof typeof animation.duration;
export type AnimationEasing = keyof typeof animation.easing;
export type Transition = keyof typeof transition;
export type Opacity = keyof typeof opacity;
export type ZIndex = keyof typeof zIndex;
