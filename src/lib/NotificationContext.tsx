import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Real implementation of the proposal's §6 "notification service" --
// previously nothing notified staff of a new escalation; they only found
// out by having the dashboard open already. Uses Supabase Realtime
// (Postgres change streams over websocket) to push new escalations live
// to every connected staff session -- no SMS/telecom credentials needed
// for this in-app piece.
//
// Honest limitation: read/unread state is session-only, not persisted to
// a table -- a production system serving the same nurse across multiple
// devices/sessions would want a real notifications table with a read_at
// column per user. Noted here rather than silently simplified.
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('escalations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'escalations' },
        async (payload) => {
          const escalationId = payload.new.id as string;
          const patientId = payload.new.patient_id as string;
          const medication = payload.new.medication as string;

          const { data: patient } = await supabase.from('patients').select('name').eq('id', patientId).single();

          setNotifications((prev) => [
            {
              id: escalationId,
              message: `${patient?.name ?? 'A patient'} missed a ${medication} dose confirmation.`,
              createdAt: new Date().toISOString(),
              read: false,
              linkTo: `/patients/${patientId}`,
            },
            ...prev,
          ].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
