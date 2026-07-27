import {
  Modal, Select
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";

interface IDirectConversationModalProps {
  viewModel: IHomeWorkbenchViewModel;
}

function DirectConversationModal({
  viewModel
}: IDirectConversationModalProps): ReactElement {
  const {
    actions, dialogs, state, userOptions
  } = viewModel;

  return (
    <Modal
      okText="创建"
      open={dialogs.directModalOpen}
      title="创建单聊"
      onCancel={() => {
        return actions.setDirectModalOpen(false);
      }}
      onOk={() => {
        return void actions.handleCreateDirect();
      }}>
      <Select
        className="w-full"
        options={userOptions}
        placeholder="选择联系人"
        value={state.selectedDirectUserId}
        onChange={value => {
          return actions.setSelectedDirectUserId(value);
        }} />
    </Modal>
  );
}

export { DirectConversationModal };
