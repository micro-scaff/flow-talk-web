import {
  useMemo
} from "react";

import {
  getSession
} from "~/utils";

interface IAuthGuardState {
  hasToken: boolean;
  token: string;
}

function useAuthGuardHook(): IAuthGuardState {
  return useMemo<IAuthGuardState>(() => {
    const session = getSession();

    return {
      hasToken: Boolean(session?.token),
      token: session?.token || ""
    };
  }, []);
}

export { useAuthGuardHook };
export type { IAuthGuardState };
