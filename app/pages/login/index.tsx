import type {
  ReactElement
} from "react";
import {
  redirect
} from "react-router";

import {
  AuthShell
} from "~/components/auth/AuthShell";
import {
  getSession
} from "~/utils";

import {
  useLoginFormHook
} from "./hooks/use-login-form-hook";
import {
  LoginForm
} from "./components/LoginForm";

function meta(): Array<{ title: string }> {
  return [
    {
      title: "登录 - Flow Talk"
    }
  ];
}

function clientLoader(): Response | null {
  const session = getSession();

  if (session?.token) {
    return redirect("/");
  }

  return null;
}

clientLoader.hydrate = true as const;

export default function LoginRoute(): ReactElement {
  const viewModel = useLoginFormHook();

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="登录你的账号">
      <LoginForm viewModel={viewModel} />
    </AuthShell>
  );
}

export {
  clientLoader,
  meta
};
