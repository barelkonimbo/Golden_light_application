import { useCallback, useEffect, useRef, useState } from "react";

export type ImageRetryStatus = "loading" | "ready" | "failed";

export interface UseImageWithRetryResult {
  /** The src to put on the <img>; cache-busted on retries. null when no url. */
  src: string | null;
  status: ImageRetryStatus;
  onLoad: () => void;
  onError: () => void;
}

const BACKOFF_MS = [500, 1000, 2000, 4000, 8000, 14000];

/**
 * Drives load/retry state for a single <img> so a freshly-uploaded additional
 * media thumbnail tolerates the "processing window" - the media Lambda
 * hasn't finished writing the resized variant to S3 yet, so the first
 * request 404s. Ported from rms-media-plugin's use-image-with-retry.ts
 * (data/rms-media-plugin-main), which documents this exact race.
 *
 * Driving the rendered <img> itself via onLoad/onError (rather than probing
 * with a throwaway `new Image()`) keeps this a single fetch and preserves
 * native lazy-loading. On error, waits BACKOFF_MS[attempt] then appends a
 * `_r=` cache-buster so the browser re-fetches instead of reusing the
 * cached 404; after the budget (~30s) status becomes "failed".
 */
export function useImageWithRetry(targetUrl: string | null): UseImageWithRetryResult {
  const [errorCount, setErrorCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [status, setStatus] = useState<ImageRetryStatus>(targetUrl ? "loading" : "failed");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setErrorCount(0);
    setRetryKey(0);
    setStatus(targetUrl ? "loading" : "failed");
  }, [targetUrl]);

  useEffect(() => {
    if (errorCount === 0) return;
    if (errorCount > BACKOFF_MS.length) {
      setStatus("failed");
      return;
    }
    setStatus("loading");
    const delay = BACKOFF_MS[Math.min(errorCount - 1, BACKOFF_MS.length - 1)];
    timerRef.current = setTimeout(() => setRetryKey((k) => k + 1), delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [errorCount]);

  const onLoad = useCallback(() => setStatus("ready"), []);
  const onError = useCallback(() => setErrorCount((c) => c + 1), []);

  const src =
    targetUrl == null
      ? null
      : retryKey === 0
        ? targetUrl
        : `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}_r=${retryKey}`;

  return { src, status, onLoad, onError };
}
