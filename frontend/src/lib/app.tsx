import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { session } from '../api/client';
import type { Member } from '../api/contract';
import { describeError, isApiError } from './errors';
import { ConfirmSheet, type ConfirmOptions } from '../mobile/components/ui';

type Toast = { id: number; text: string; tone: 'error' | 'info' };
interface AppState {
  member: Member | null;
  loading: boolean;
  setMember(member: Member | null): void;
  refreshMember(): Promise<Member | null>;
  logout(): void;
  toast(text: string, tone?: Toast['tone']): void;
  /** In-app confirmation (never window.confirm, which some webviews block): resolves true only on the confirm button. */
  askConfirm(options: ConfirmOptions): Promise<boolean>;
}
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(!!session.get());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const [asking, setAsking] = useState<(ConfirmOptions & { id: number; resolve(ok: boolean): void }) | null>(null);
  const pending = useRef<((ok: boolean) => void) | null>(null);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'error') => {
    const id = ++seq.current;
    setToasts(list => [...list.filter(t => t.text !== text), { id, text, tone }]);
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 3500);
  }, []);

  const askConfirm = useCallback((options: ConfirmOptions) => new Promise<boolean>(resolve => {
    pending.current?.(false); // a newer question cancels an unanswered one
    pending.current = resolve;
    setAsking({ ...options, id: ++seq.current, resolve });
  }), []);

  const refreshMember = useCallback(async () => {
    if (!session.get()) { setMember(null); return null; }
    try {
      const me = await api.identity.me();
      setMember(me);
      return me;
    } catch (error) {
      if (isApiError(error, 'UNAUTHENTICATED')) { session.clear(); setMember(null); }
      return null;
    }
  }, []);

  useEffect(() => { void refreshMember().finally(() => setLoading(false)); }, [refreshMember]);

  const logout = useCallback(() => { session.clear(); setMember(null); }, []);

  const value = useMemo(() => ({ member, loading, setMember, refreshMember, logout, toast, askConfirm }), [member, loading, refreshMember, logout, toast, askConfirm]);
  return (
    <AppContext.Provider value={value}>
      {children}
      {asking && (
        <ConfirmSheet key={asking.id} {...asking}
          onAnswer={ok => { if (pending.current === asking.resolve) pending.current = null; asking.resolve(ok); }}
          onClosed={() => setAsking(current => (current?.id === asking.id ? null : current))} />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-[max(16px,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} role="status" className="animate-pop flex max-w-full items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white shadow-float">
            <span className={`h-2 w-2 shrink-0 rounded-full ${t.tone === 'error' ? 'bg-[#FF6B5B]' : 'bg-sun'}`} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppProvider missing');
  return ctx;
}

/** Shared error handling: consent → /consent, auth → /start, everything else → Korean toast. */
export function useErrorHandler() {
  const { toast, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback((error: unknown) => {
    if (isApiError(error, 'LOCATION_CONSENT_REQUIRED')) {
      toast(describeError(error));
      // Router-relative path (no deploy base such as /taximate/), so navigate(from) works on GitHub Pages too.
      navigate('/consent', { state: { from: location.pathname } });
      return;
    }
    if (isApiError(error, 'UNAUTHENTICATED')) {
      logout();
      toast(describeError(error));
      navigate('/start');
      return;
    }
    if (!isApiError(error)) console.error(error);
    toast(describeError(error));
  }, [toast, logout, navigate, location.pathname]);
}

/** Wrap an async action with a busy flag and the shared error handler. */
export function useAction() {
  const onError = useErrorHandler();
  const [busy, setBusy] = useState(false);
  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try { return await fn(); } catch (error) { onError(error); return undefined; } finally { setBusy(false); }
  }, [onError]);
  return { busy, run };
}
