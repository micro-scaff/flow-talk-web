import type {
  ReactElement
} from "react";

import {
  AuthShell
} from "~/components/auth/AuthShell";

import {
  useLoginFormHook
} from "./hooks/use-login-form-hook";
import {
  LoginForm
} from "./components/LoginForm";

export function meta(): Array<{ title: string }> {
  return [
    {
      title: "登录 - Flow Talk"
    }
  ];
}

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
