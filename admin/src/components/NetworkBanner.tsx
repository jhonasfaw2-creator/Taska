import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm text-white">
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414"
          />
        </svg>
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-green-600 px-4 py-2 text-sm text-white">
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Back online</span>
      </div>
    );
  }

  return null;
}
