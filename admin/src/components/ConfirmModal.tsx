import React from 'react';

type ConfirmColor = 'red' | 'amber' | 'blue' | 'green' | 'purple';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: ConfirmColor;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const COLOR_CONFIG: Record<ConfirmColor, {
  bg: string;
  hover: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  iconPath: string;
}> = {
  red: {
    bg: 'bg-red-600', hover: 'hover:bg-red-700', ring: 'focus:ring-red-500',
    iconBg: 'bg-red-100', iconColor: 'text-red-600',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
  amber: {
    bg: 'bg-amber-600', hover: 'hover:bg-amber-700', ring: 'focus:ring-amber-500',
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  blue: {
    bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  green: {
    bg: 'bg-green-600', hover: 'hover:bg-green-700', ring: 'focus:ring-green-500',
    iconBg: 'bg-green-100', iconColor: 'text-green-600',
    iconPath: 'M5 13l4 4L19 7',
  },
  purple: {
    bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500',
    iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
};

export default function ConfirmModal({
  open, title, message, confirmLabel,
  confirmColor = 'red', loading, onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const color = COLOR_CONFIG[confirmColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color.iconBg}`}>
            <svg className={`h-5 w-5 ${color.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={color.iconPath} />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${color.bg} ${color.hover} ${color.ring}`}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
