import {
  Avatar, Badge, Checkbox, Form, Input, Modal
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  getUserName
} from "../../utils";
import {
  AvatarUploadField
} from "./AvatarUploadField";

interface IGroupCreateModalProps {
  viewModel: IHomeWorkbenchViewModel;
}

function GroupCreateModal({
  viewModel
}: IGroupCreateModalProps): ReactElement {
  const {
    actions, dialogs, forms, state, userOptions
  } = viewModel;

  const avatarUrl = Form.useWatch("avatarUrl", forms.groupForm);

  const memberOptions = userOptions.map(option => {
    const user = state.users.find(item => {
      return item.id === option.value;
    });

    return {
      ...option,
      user
    };
  });

  return (
    <Modal
      okText="创建"
      open={dialogs.groupModalOpen}
      title="创建群聊"
      onCancel={() => {
        return actions.setGroupModalOpen(false);
      }}
      onOk={() => {
        return void actions.handleCreateGroup();
      }}>
      <Form
        form={forms.groupForm}
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
          <Input placeholder="例如：产品讨论组" />
        </Form.Item>

        <Form.Item
          name="avatarUrl"
          noStyle>
          <input type="hidden" />
        </Form.Item>

        <Form.Item label="群头像">
          <AvatarUploadField
            target="create"
            value={avatarUrl}
            viewModel={viewModel} />
        </Form.Item>

        <Form.Item
          label="成员"
          name="memberIds"
          rules={[
            {
              message: "请至少选择一位群成员",
              required: true
            }
          ]}>
          <Checkbox.Group className="flow-group-member-checkboxes">
            {memberOptions.map(option => {
              const userName = getUserName(option.user);

              const username = option.user?.username;

              const presence = state.presences[option.value];

              return (
                <Checkbox
                  key={option.value}
                  value={option.value}>
                  <span className="flow-group-member-option-content">
                    <Badge
                      color={presence?.online ? "green" : "default"}
                      dot>
                      <Avatar
                        className="flow-group-member-avatar"
                        size={34}
                        src={option.user?.avatar_url || undefined}>
                        {userName.slice(0, 1)}
                      </Avatar>
                    </Badge>

                    <span className="flow-group-member-option-copy">
                      <span
                        className="flow-group-member-option-name"
                        title={userName}>
                        {userName}
                      </span>

                      <span className="flow-group-member-option-meta">
                        {username ? `@${username}` : `用户 ${option.value}`}
                        {presence?.online ? " · 在线" : " · 离线"}
                      </span>
                    </span>
                  </span>
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { GroupCreateModal };
