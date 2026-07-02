import {
  LaptopOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Avatar,
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
    <header className="flow-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          className="shrink-0 bg-[#e7f3ff] text-[#1877f2]"
          size={40}
          src={state.activeConversation?.avatar_url}>
          {state.activeTitle.slice(0, 1)}
        </Avatar>

        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Title
                className="!mb-0 !text-lg !font-black"
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

            <Text className="mt-1 block text-[#65676b]">
              {state.onlineCount}
              {" "}
              位在线
            </Text>
          </div>
        </div>
      </div>

      <Space>
        <Input
          allowClear
          className="flow-search-input flow-message-search"
          prefix={<SearchOutlined />}
          placeholder="搜索消息"
          value={state.searchText}
          onChange={event => {
            return actions.setSearchText(event.target.value);
          }}
          onPressEnter={() => {
            void actions.handleSearch();
          }} />

        <Tooltip title="设备管理">
          <Button
            className="flow-icon-button"
            icon={<LaptopOutlined />}
            shape="circle"
            onClick={() => {
              return actions.setDevicesOpen(true);
            }} />
        </Tooltip>

        {state.activeConversation?.type === "group" && (
          <Tooltip title="添加群成员">
            <Button
              className="flow-icon-button"
              icon={<PlusOutlined />}
              shape="circle"
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
