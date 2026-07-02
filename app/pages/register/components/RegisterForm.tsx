import {
  ArrowLeftOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input
} from "antd";
import {
  Link
} from "react-router";
import type {
  ReactElement
} from "react";

import type {
  IRegisterFormHook
} from "../hooks/use-register-form-hook";

interface IRegisterFormProps {
  viewModel: IRegisterFormHook;
}

export function RegisterForm({
  viewModel
}: IRegisterFormProps): ReactElement {
  return (
    <Card
      className="auth-card"
      variant="borderless">
      <Form
        form={viewModel.form}
        initialValues={viewModel.initialValues}
        layout="vertical"
        onFinish={viewModel.onSubmit}
        requiredMark={false}
        size="large">
        <Form.Item
          label="账号"
          name="username"
          rules={[
            {
              message: "请输入注册账号",
              required: true
            }
          ]}>
          <Input
            autoComplete="username"
            placeholder="建议使用英文或数字组合" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            {
              message: "请输入注册密码",
              required: true
            },
            {
              min: 6,
              message: "密码至少 6 位"
            }
          ]}>
          <Input.Password
            autoComplete="new-password"
            placeholder="至少 6 位密码" />
        </Form.Item>

        <Form.Item
          label="昵称"
          name="nickname">
          <Input placeholder="不填则默认使用账号名" />
        </Form.Item>

        <Form.Item
          label="头像 Base64"
          name="avatarBase64">
          <Input placeholder="data:image/png;base64,..." />
        </Form.Item>

        <Button
          block
          htmlType="submit"
          icon={<UserAddOutlined />}
          loading={viewModel.loading}
          type="primary">
          注册并进入 Flow Talk
        </Button>
      </Form>

      <Button
        block
        className="link-action"
        icon={<ArrowLeftOutlined />}>
        <Link to="/login">
          已有账号，返回登录
        </Link>
      </Button>
    </Card>
  );
}
