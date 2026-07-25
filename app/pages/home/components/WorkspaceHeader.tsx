import {
  LaptopOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
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
  onOpenMobileSidebar: () => void;
}

function WorkspaceHeader({
  viewModel,
  onOpenMobileSidebar
}: IWorkspaceHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const selectedCount = state.selectedGroupUserIds.length;

  const hasActiveConversation = Boolean(state.activeConversationId);

  return (
    <header className="flow-topbar">
      {/* 只有用户明确选择会话后才展示会话信息，首页保持未打开状态。 */}
      <div className="flow-topbar-title flex min-w-0 items-center gap-3">
        <Button
          aria-label="打开联系人栏"
          className="flow-icon-button flow-mobile-menu-button"
          icon={<MenuOutlined />}
          shape="circle"
          onClick={onOpenMobileSidebar} />

        {hasActiveConversation ? (
          <>
            <Avatar
              className="flow-active-avatar shrink-0 bg-[#e7f3ff] text-[#1877f2]"
              size={40}
              src={state.activeConversation?.avatar_url}>
              {state.activeTitle.slice(0, 1)}
            </Avatar>

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
          </>
        ) : (
          <div className="min-w-0">
            <Title
              className="!mb-0 !text-lg !font-black"
              level={2}>
              尚未选择会话
            </Title>

            <Text className="mt-1 block text-[#65676b]">
              从左侧选择联系人后创建对话
            </Text>
          </div>
        )}
      </div>

      <Space className="flow-topbar-actions">
        {/* 统一创建入口：左侧选 1 人创建单聊，选多人创建群聊。 */}
        <Tooltip title={selectedCount > 0 ? `基于已选 ${selectedCount} 人创建对话` : "先在联系人栏选择人员"}>
          <Badge
            className="flow-create-badge"
            count={selectedCount}
            offset={[
              -2,
              3
            ]}
            size="small">
            <Button
              className="flow-topbar-action"
              disabled={selectedCount === 0}
              icon={<TeamOutlined />}
              type="primary"
              onClick={actions.handleOpenGroupFromSelection}>
              创建对话
              {selectedCount > 0 ? ` ${selectedCount}` : ""}
            </Button>
          </Badge>
        </Tooltip>

        {hasActiveConversation && (
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
        )}

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
