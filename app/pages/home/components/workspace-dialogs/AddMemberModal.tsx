import {
  Form, Modal, Select
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";

interface IAddMemberModalProps {
  viewModel: IHomeWorkbenchViewModel;
}

function AddMemberModal({
  viewModel
}: IAddMemberModalProps): ReactElement {
  const {
    actions, dialogs, forms, state, userOptions
  } = viewModel;

  const activeMemberIds = new Set(state.activeConversation?.members?.filter(member => {
    return member.status === "active";
  }).map(member => {
    return member.user_id;
  }) || []);

  const addableUserOptions = userOptions.filter(option => {
    return !activeMemberIds.has(option.value);
  });

  return (
    <Modal
      okText="添加"
      open={dialogs.memberModalOpen}
      title="添加群成员"
      onCancel={() => {
        return actions.setMemberModalOpen(false);
      }}
      onOk={() => {
        return void actions.handleAddMembers();
      }}>
      <Form
        form={forms.addMemberForm}
        layout="vertical">
        <Form.Item
          label="成员"
          name="userIds"
          rules={[
            {
              message: "请选择成员",
              required: true
            }
          ]}>
          <Select
            mode="multiple"
            options={addableUserOptions}
            placeholder="选择要添加的成员" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { AddMemberModal };
