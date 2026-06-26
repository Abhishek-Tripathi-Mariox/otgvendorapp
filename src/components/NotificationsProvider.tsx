import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {fetchUnreadNotificationCount} from '../services/vendorService';

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
  setUnreadCount: (n: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

const POLL_INTERVAL_MS = 60_000;

export const NotificationsProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [unreadCount, setUnread] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnread(count);
    } catch {
      // Silent: keep showing last known count if the call fails (e.g. logged out).
    }
  }, []);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') refresh();
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      sub.remove();
    };
  }, [refresh]);

  const value = useMemo<NotificationsContextValue>(
    () => ({unreadCount, refresh, setUnreadCount: setUnread}),
    [unreadCount, refresh],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    );
  }
  return ctx;
};
