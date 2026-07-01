import type {
  ReactElement
} from "react";

import {
  AuthShell
} from "~/components/auth/AuthShell";

import {
  useRegisterFormHook
} from "./hooks/use-register-form-hook";
import {
  RegisterForm
} from "./components/RegisterForm";

export function meta(): Array<{ title: string }> {
  return [
    {
      title: "注册 - Flow Talk"
    }
  ];
}

export default function RegisterRoute(): ReactElement {
  const viewModel = useRegisterFormHook();

  return (
    <AuthShell
      eyebrow="CREATE ACCOUNT"
      title="创建 Flow Talk 账号">
      <RegisterForm viewModel={viewModel} />
    </AuthShell>
  );
}
