import {
  UploadOutlined
} from "@ant-design/icons";
import {
  Avatar, Button, Space, Upload
} from "antd";
import type {
  UploadProps
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";

interface IAvatarUploadFieldProps {
  target: "create" | "profile";
  value?: string;
  viewModel: IHomeWorkbenchViewModel;
}

function AvatarUploadField({
  target,
  value,
  viewModel
}: IAvatarUploadFieldProps): ReactElement {
  const {
    actions, state
  } = viewModel;

  const uploadProps: UploadProps = {
    accept: "image/*",
    beforeUpload(file) {
      void actions.handleUploadGroupAvatar(file, target);

      return Upload.LIST_IGNORE;
    },
    maxCount: 1,
    showUploadList: false
  };

  return (
    <Space align="center">
      <Avatar
        shape="square"
        size={64}
        src={value || undefined}>
        群
      </Avatar>

      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          loading={state.groupAvatarUploading}>
          {value ? "重新上传" : "上传头像"}
        </Button>
      </Upload>
    </Space>
  );
}

export { AvatarUploadField };
