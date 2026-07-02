import {
  LaptopOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";

const {
  Text,
  Title
} = Typography;

interface IWorkspaceHeaderProps {
  viewModel: IHomeWorkbenchViewModel;
}

function WorkspaceHeader({
  viewModel
}: IWorkspaceHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  return (
    <header className="flex min-h-18 items-center justify-between border-b border-[#dadde1] bg-white px-6 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-[#1877f2]" />

          <Title
            className="!mb-0 !text-lg"
            level={2}>
            {state.activeTitle}
          </Title>

          {state.activeConversation?.type === "group" && (
            <Tag color="blue">
              {state.activeConversation.member_count || state.activeConversation.members?.length || 0}
              {" "}
              人
            </Tag>
          )}
        </div>

        <Text className="text-[#65676b]">
          {state.onlineCount}
          {" "}
          位联系人在线，设备
          {" "}
          {state.devices.length}
          {" "}
          台
        </Text>
      </div>

      <Space>
        <Input.Search
          allowClear
          className="w-72"
          enterButton={<SearchOutlined />}
          placeholder="搜索消息"
          value={state.searchText}
          onChange={event => {
            return actions.setSearchText(event.target.value);
          }}
          onSearch={() => {
            return void actions.handleSearch();
          }} />

        <Tooltip title="设备管理">
          <Button
            icon={<LaptopOutlined />}
            onClick={() => {
              return actions.setDevicesOpen(true);
            }} />
        </Tooltip>

        {state.activeConversation?.type === "group" && (
          <Tooltip title="添加群成员">
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                return actions.setMemberModalOpen(true);
              }} />
          </Tooltip>
        )}
      </Space>
    </header>
  );
}

export { WorkspaceHeader };
