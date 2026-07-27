import {
  Form, Input, Modal
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  AvatarUploadField
} from "./AvatarUploadField";

interface IGroupProfileModalProps {
  viewModel: IHomeWorkbenchViewModel;
}

function GroupProfileModal({
  viewModel
}: IGroupProfileModalProps): ReactElement {
  const {
    actions, dialogs, forms
  } = viewModel;

  const avatarUrl = Form.useWatch("avatarUrl", forms.profileForm);

  return (
    <Modal
      okText="保存"
      open={dialogs.profileModalOpen}
      title="编辑群资料"
      onCancel={() => {
        return actions.setProfileModalOpen(false);
      }}
      onOk={() => {
        return void actions.handleUpdateGroupProfile();
      }}>
      <Form
        form={forms.profileForm}
        layout="vertical">
        <Form.Item
          label="群名称"
          name="title"
          rules={[
            {
              message: "请输入群名称",
              required: true
            }
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="avatarUrl"
          noStyle>
          <input type="hidden" />
        </Form.Item>

        <Form.Item label="群头像">
          <AvatarUploadField
            target="profile"
            value={avatarUrl}
            viewModel={viewModel} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { GroupProfileModal };
