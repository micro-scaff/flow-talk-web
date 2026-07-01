import {
  ConfigProvider,
  theme
} from "antd";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useSyncExternalStore
} from "react";
import type {
  ReactElement,
  ReactNode
} from "react";

import type {
  TThemeMode
} from "~/model/theme.model";

const THEME_STORAGE_KEY = "flow-talk-theme";

const themeListeners = new Set<() => void>();

interface IThemeViewModel {
  isDark: boolean;
  mode: TThemeMode;
  toggleTheme: () => void;
}

const ThemeViewModelContext = createContext<IThemeViewModel | null>(null);

function getInitialTheme(): TThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerThemeSnapshot(): TThemeMode {

  // SSR 阶段没有 localStorage，固定 light 可避免服务端和首屏 HTML 不一致。
  return "light";
}

function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);

  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }

  return () => {
    themeListeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function writeStoredTheme(nextMode: TThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
  themeListeners.forEach(listener => {
    listener();
  });
}

export function ThemeProvider({
  children
}: { children: ReactNode }): ReactElement {
  const mode = useSyncExternalStore(
      subscribeTheme,
      getInitialTheme,
      getServerThemeSnapshot
  );

  const isDark = mode === "dark";

  useEffect(() => {

    // 主题既驱动 antd token，也同步给 CSS 变量与浏览器原生控件。
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [
    mode
  ]);

  const contextValue = useMemo<IThemeViewModel>(() => {
    return {
      isDark,
      mode,
      toggleTheme: () => {
        writeStoredTheme(isDark ? "light" : "dark");
      }
    };
  }, [
    isDark,
    mode
  ]);

  const antdTheme = useMemo(() => {
    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        borderRadius: 8,
        colorPrimary: "#1877f2",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }
    };
  }, [
    isDark
  ]);

  return (
    <ThemeViewModelContext value={contextValue}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeViewModelContext>
  );
}

export function useThemeHook(): IThemeViewModel {
  const context = use(ThemeViewModelContext);

  if (!context) {
    throw new Error("useThemeHook must be used inside ThemeProvider");
  }

  return context;
}
