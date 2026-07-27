import {
  ApiOutlined,
  LoginOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import {
  Button,
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
    <div className="auth-card">
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
            placeholder="请输入账号" />
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

      <Divider plain>
        外部身份
      </Divider>

      <div className="grid gap-3">
        <Input.Password
          aria-label="外部身份令牌"
          autoComplete="off"
          placeholder="输入 demo provider 的身份令牌"
          size="large"
          value={viewModel.externalToken}
          onChange={event => {
            return viewModel.setExternalToken(event.target.value);
          }}
          onPressEnter={() => {
            return void viewModel.onExternalLogin();
          }} />

        <Button
          block
          icon={<ApiOutlined />}
          loading={viewModel.externalLoading}
          size="large"
          onClick={() => {
            return void viewModel.onExternalLogin();
          }}>
          使用外部身份登录
        </Button>
      </div>

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

      <div className="auth-form-separator">
        <span>还没有账号？</span>
      </div>

      {/* 使用单一链接语义，避免 Button 与 Link 嵌套造成键盘导航和读屏歧义。 */}
      <Link
        className="auth-secondary-link"
        to="/register">
        <UserAddOutlined />
        <span>创建新账号</span>
      </Link>
    </div>
  );
}
