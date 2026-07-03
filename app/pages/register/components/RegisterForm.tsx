import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Upload
} from "antd";
import type {
  UploadProps
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
  const avatarBase64 = Form.useWatch("avatarBase64", viewModel.form);

  const nickname = Form.useWatch("nickname", viewModel.form);

  const username = Form.useWatch("username", viewModel.form);

  const avatarUploadProps: UploadProps = {
    accept: "image/*",
    beforeUpload(file) {
      void viewModel.onAvatarUpload(file);

      return Upload.LIST_IGNORE;
    },
    maxCount: 1,
    showUploadList: false
  };

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
          hidden
          name="avatarBase64">
          <Input />
        </Form.Item>

        <Form.Item label="头像">
          <Space align="center">
            <Avatar
              size={56}
              src={avatarBase64}>
              {nickname?.slice(0, 1) || username?.slice(0, 1) || "FT"}
            </Avatar>

            <Upload {...avatarUploadProps}>
              <Button icon={<UploadOutlined />}>
                上传头像
              </Button>
            </Upload>
          </Space>
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
