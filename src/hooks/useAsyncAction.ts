import { useCallback, useState } from 'react';

export function useAsyncAction<TArgs extends unknown[], TResult>(action: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(undefined);
      try {
        return await action(...args);
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [action]
  );

  return { run, loading, error };
}
