import {
  App,
  Form
} from "antd";
import type {
  FormInstance
} from "antd";
import {
  useState
} from "react";
import {
  useNavigate
} from "react-router";

import {
  dataExternalLogin,
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
  externalLoading: boolean;
  externalToken: string;
  form: FormInstance<IParamsLogin>;
  loading: boolean;
  onExternalLogin: () => Promise<void>;
  onSubmit: (values: IParamsLogin) => Promise<void>;
  setExternalToken: (token: string) => void;
}

export function useLoginFormHook(): ILoginFormHook {
  const {
    message
  } = App.useApp();

  const [
    form
  ] = Form.useForm<IParamsLogin>();

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    externalLoading,
    setExternalLoading
  ] = useState(false);

  const [
    externalToken,
    setExternalToken
  ] = useState("");

  const navigate = useNavigate();

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
      navigate("/", {
        replace: true
      });
    } catch {

      // 请求错误由 request 响应拦截器统一提示。
    } finally {
      setLoading(false);
    }
  };

  const onExternalLogin = async (): Promise<void> => {
    const accessToken = externalToken.trim();

    if (!accessToken) {
      message.warning("请输入外部身份令牌");

      return;
    }

    setExternalLoading(true);

    try {

      // provider 在当前版本固定为 demo；真实 OAuth 接入后应由服务端配置决定，不接受任意用户输入。
      const response = await dataExternalLogin({
        access_token: accessToken,
        provider: "demo"
      });

      saveSession(response);
      setAuthResult(response);
      message.success("外部身份登录成功");
      navigate("/", {
        replace: true
      });
    } catch {

      // 请求错误由 request 响应拦截器统一提示。
    } finally {
      setExternalLoading(false);
    }
  };

  return {
    authResult,
    displayName,
    externalLoading,
    externalToken,
    form,
    loading,
    onExternalLogin,
    onSubmit,
    setExternalToken
  };
}

export type { ILoginFormHook };
