import {
  Form,
  message
} from "antd";
import type {
  FormInstance
} from "antd";
import {
  useMemo,
  useState
} from "react";
import {
  useNavigate
} from "react-router";

import type {
  IRegisterFormValues
} from "~/api";
import {
  register
} from "~/api";
import {
  saveSession
} from "~/utils";

interface IRegisterFormHook {
  form: FormInstance<IRegisterFormValues>;
  initialValues: Partial<IRegisterFormValues>;
  loading: boolean;
  onSubmit: (values: IRegisterFormValues) => Promise<void>;
}

export function useRegisterFormHook(): IRegisterFormHook {
  const [
    form
  ] = Form.useForm<IRegisterFormValues>();

  const [
    loading,
    setLoading
  ] = useState(false);

  const navigate = useNavigate();

  const initialValues = useMemo<Partial<IRegisterFormValues>>(() => {
    return {
      avatarUrl: "",
      nickname: ""
    };
  }, []);

  // 注册模块 hook 负责把表单动作串起来，接口字段映射交给 api 层处理。
  const onSubmit = async (values: IRegisterFormValues): Promise<void> => {
    setLoading(true);

    try {
      const response = await register(values);

      saveSession(response);
      message.success("注册成功，已为你创建 Flow Talk 账号");

      // 当前阶段还没有 IM 工作台，注册成功后先回到登录页承接后续流程。
      navigate("/login", {
        replace: true
      });
    } catch {

      // 请求错误由 request 响应拦截器统一提示。
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    initialValues,
    loading,
    onSubmit
  };
}

export type { IRegisterFormHook };
