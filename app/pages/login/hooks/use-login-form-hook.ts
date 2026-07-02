import {
  Form,
  message
} from "antd";
import type {
  FormInstance
} from "antd";
import {
  useState
} from "react";

import {
  dataLogin
} from "~/api";
import type {
  IDataLogin,
  IParamsLogin
} from "~/api";
import {
  saveSession
} from "~/utils";

import {
  useLoginSessionHook
} from "./use-login-session-hook";

interface ILoginFormHook {
  authResult: IDataLogin | null;
  displayName: string;
  form: FormInstance<IParamsLogin>;
  loading: boolean;
  onSubmit: (values: IParamsLogin) => Promise<void>;
}

export function useLoginFormHook(): ILoginFormHook {
  const [
    form
  ] = Form.useForm<IParamsLogin>();

  const [
    loading,
    setLoading
  ] = useState(false);

  const {
    authResult,
    displayName,
    setAuthResult
  } = useLoginSessionHook();

  // 登录模块 hook 只处理表单状态、提交 loading、接口调用和成功后的本地会话更新。
  const onSubmit = async (values: IParamsLogin): Promise<void> => {
    setLoading(true);

    try {
      const response = await dataLogin(values);

      saveSession(response);
      setAuthResult(response);
      message.success("登录成功，欢迎回来");
    } catch {

      // 请求错误由 request 响应拦截器统一提示。
    } finally {
      setLoading(false);
    }
  };

  return {
    authResult,
    displayName,
    form,
    loading,
    onSubmit
  };
}

export type { ILoginFormHook };
