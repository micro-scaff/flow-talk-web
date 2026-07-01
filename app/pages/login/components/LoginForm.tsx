import {
  LoginOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Typography
} from "antd";
import {
  Link
} from "react-router";
import type {
  ReactElement
} from "react";

import type {
  ILoginFormHook
} from "../hooks/use-login-form-hook";

interface ILoginFormProps {
  viewModel: ILoginFormHook;
}

export function LoginForm({
  viewModel
}: ILoginFormProps): ReactElement {
  return (
    <Card
      className="auth-card"
      variant="borderless">
      <Form
        form={viewModel.form}
        layout="vertical"
        onFinish={viewModel.onSubmit}
        requiredMark={false}
        size="large">
        <Form.Item
          label="账号"
          name="username"
          rules={[
            {
              message: "请输入登录账号",
              required: true
            }
          ]}>
          <Input
            autoComplete="username"
            placeholder="请输入账号，例如 alice" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            {
              message: "请输入登录密码",
              required: true
            }
          ]}>
          <Input.Password
            autoComplete="current-password"
            placeholder="请输入密码" />
        </Form.Item>

        <Button
          block
          htmlType="submit"
          icon={<LoginOutlined />}
          loading={viewModel.loading}
          type="primary">
          登录
        </Button>
      </Form>

      {viewModel.authResult?.token && (
        <div className="auth-success">
          <Typography.Text strong>
            {viewModel.displayName}
          </Typography.Text>

          <Typography.Text type="secondary">
            已登录，token 已保存到本地。
          </Typography.Text>
        </div>
      )}

      <Divider plain>
        新朋友
      </Divider>

      <Button
        block
        className="secondary-action"
        icon={<UserAddOutlined />}>
        <Link to="/register">
          创建新账号
        </Link>
      </Button>
    </Card>
  );
}
