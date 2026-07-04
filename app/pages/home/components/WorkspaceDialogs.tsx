import {
  CheckCircleOutlined,
  DeleteOutlined,
  LaptopOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  formatDateTime
} from "../utils";

interface IWorkspaceDialogsProps {
  viewModel: IHomeWorkbenchViewModel;
}

function WorkspaceDialogs({
  viewModel
}: IWorkspaceDialogsProps): ReactElement {
  const {
    actions,
    dialogs,
    forms,
    state,
    userOptions
  } = viewModel;

  return (
    <>
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
            label="群头像 URL"
            name="avatarUrl">
            <Input placeholder="可选" />
          </Form.Item>

          <Form.Item
            label="成员"
            name="memberIds">
            <Select
              mode="multiple"
              options={userOptions}
              placeholder="选择群成员" />
          </Form.Item>
        </Form>
      </Modal>

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
              options={userOptions}
              placeholder="选择要添加的成员" />
          </Form.Item>
        </Form>
      </Modal>

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
            label="群头像 URL"
            name="avatarUrl">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={dialogs.devicesOpen}
        title="设备与离线同步"
        width={420}
        onClose={() => {
          return actions.setDevicesOpen(false);
        }}>
        <Space
          className="w-full"
          direction="vertical">
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={() => {
              return void actions.handleUpsertDevice();
            }}>
            上报当前设备
          </Button>

          <List
            dataSource={state.devices}
            locale={{
              emptyText: <Empty description="暂无设备" />
            }}
            renderItem={device => {
              const deviceData = device.data || {};

              const deviceId = typeof deviceData.device_id === "string" ? deviceData.device_id : device.device_id || String(device.id);

              const platform = typeof deviceData.platform === "string" ? deviceData.platform : device.platform || "web";

              const updatedAt = device.updated_at || device.last_seen_at;

              return (
                <List.Item
                  actions={[
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      key="delete"
                      type="text"
                      onClick={() => {
                        return void actions.handleDeleteDevice(deviceId);
                      }} />
                  ]}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<LaptopOutlined />} />}
                    description={updatedAt ? `最后活跃：${formatDateTime(updatedAt)}` : "等待同步"}
                    title={deviceId === state.deviceId ? `${platform}（当前）` : platform} />
                </List.Item>
              );
            }} />
        </Space>
      </Drawer>

    </>
  );
}

export { WorkspaceDialogs };
