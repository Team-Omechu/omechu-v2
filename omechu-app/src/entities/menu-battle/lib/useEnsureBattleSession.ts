"use client";

import { useEffect, useState } from "react";

import { ensureBattleSession } from "./ensureBattleSession";

type State = { ready: boolean; userId: string | null; error: Error | null };

export function useEnsureBattleSession(): State {
  const [state, setState] = useState<State>({
    ready: false,
    userId: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    ensureBattleSession()
      .then((userId) => {
        if (mounted) setState({ ready: true, userId, error: null });
      })
      .catch((err: unknown) => {
        if (mounted)
          setState({
            ready: false,
            userId: null,
            error: err instanceof Error ? err : new Error(String(err)),
          });
      });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
