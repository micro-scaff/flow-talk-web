import {
  App,
  Form
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
  IParamsRegister
} from "~/api";
import {
  dataRegister
} from "~/api";
import {
  saveSession
} from "~/utils";

import {
  isAvatarFileSizeAllowed,
  isImageFile,
  readFileAsBase64
} from "../utils";

interface IRegisterFormHook {
  form: FormInstance<IRegisterFormValues>;
  onAvatarUpload: (file: File) => Promise<void>;
  initialValues: Partial<IRegisterFormValues>;
  loading: boolean;
  onSubmit: (values: IRegisterFormValues) => Promise<void>;
}

interface IRegisterFormValues extends IParamsRegister {
  confirmPassword?: string;
}

export function useRegisterFormHook(): IRegisterFormHook {
  const {
    message
  } = App.useApp();

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
      avatarBase64: "",
      confirmPassword: "",
      nickname: ""
    };
  }, []);

  const onAvatarUpload = async (file: File): Promise<void> => {
    if (!isImageFile(file)) {
      message.warning("请选择图片文件");

      return;
    }

    if (!isAvatarFileSizeAllowed(file)) {
      message.warning("头像大小不能超过 10 MB");

      return;
    }

    try {
      const avatarBase64 = await readFileAsBase64(file);

      form.setFieldValue("avatarBase64", avatarBase64);
      message.success("头像已选择");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "头像读取失败");
    }
  };

  // 注册模块 hook 负责把表单动作串起来，接口字段映射交给 api 层处理。
  const onSubmit = async (values: IRegisterFormValues): Promise<void> => {
    setLoading(true);

    try {
      const registerPayload: IParamsRegister = {
        avatarBase64: values.avatarBase64,
        nickname: values.nickname,
        password: values.password,
        username: values.username
      };

      const response = await dataRegister(registerPayload);

      saveSession(response);
      message.success("注册成功，已为你创建 Flow Talk 账号");

      navigate("/", {
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
    onAvatarUpload,
    onSubmit
  };
}

export type {
  IRegisterFormHook,
  IRegisterFormValues
};
