'use client';
import { useCallback, useEffect, useState } from 'react';

function getPageFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  return Math.max(1, Number(new URLSearchParams(window.location.search).get('page') ?? '1'));
}

/**
 * Synchronise le numéro de page avec l'URL (?page=N) via
 * window.history.replaceState — sans déclencher de routing Next.js,
 * sans Suspense requis, sans conflits de re-render.
 */
export function usePaginationUrl() {
  const [page, setPageState] = useState<number>(getPageFromUrl);

  // Sync sur navigation retour/avance du navigateur
  useEffect(() => {
    const onPopState = () => setPageState(getPageFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    const params = new URLSearchParams(window.location.search);
    if (newPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }
    const qs = params.toString();
    window.history.replaceState(
      null,
      '',
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
    );
  }, []);

  return [page, setPage] as const;
}
