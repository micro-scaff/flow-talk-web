import {
  CheckCircleOutlined,
  DeleteOutlined,
  LaptopOutlined,
  UploadOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Upload
} from "antd";
import type {
  UploadProps
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

  const groupAvatarUrl = Form.useWatch("avatarUrl", forms.groupForm);

  const profileAvatarUrl = Form.useWatch("avatarUrl", forms.profileForm);

  function getAvatarUploadProps(target: "create" | "profile"): UploadProps {
    return {
      accept: "image/*",
      beforeUpload(file) {
        void actions.handleUploadGroupAvatar(file, target);

        return Upload.LIST_IGNORE;
      },
      maxCount: 1,
      showUploadList: false
    };
  }

  return (
    <>
      {/* 兼容旧的单聊选择弹窗；当前单聊主入口为联系人列表。 */}
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
        {/* 群聊创建只提交 OpenAPI 定义的 title/avatar_url/member_ids 字段。 */}
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

          {/* 资源 URL 由上传动作回填，隐藏字段只参与表单提交。 */}
          <Form.Item
            name="avatarUrl"
            noStyle>
            <input type="hidden" />
          </Form.Item>

          <Form.Item label="群头像">
            <Space align="center">
              <Avatar
                shape="square"
                size={64}
                src={groupAvatarUrl || undefined}>
                群
              </Avatar>

              <Upload {...getAvatarUploadProps("create")}>
                <Button
                  icon={<UploadOutlined />}
                  loading={state.groupAvatarUploading}>
                  {groupAvatarUrl ? "重新上传" : "上传头像"}
                </Button>
              </Upload>
            </Space>
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
            <Checkbox.Group
              className="flow-group-member-checkboxes"
              options={userOptions} />
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
            name="avatarUrl"
            noStyle>
            <input type="hidden" />
          </Form.Item>

          <Form.Item label="群头像">
            <Space align="center">
              <Avatar
                shape="square"
                size={64}
                src={profileAvatarUrl || undefined}>
                群
              </Avatar>

              <Upload {...getAvatarUploadProps("profile")}>
                <Button
                  icon={<UploadOutlined />}
                  loading={state.groupAvatarUploading}>
                  {profileAvatarUrl ? "重新上传" : "上传头像"}
                </Button>
              </Upload>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={dialogs.devicesOpen}
        size={420}
        title="设备与离线同步"
        onClose={() => {
          return actions.setDevicesOpen(false);
        }}>
        {/* 设备上报用于 WebSocket device_id 和离线同步排查，不参与消息展示主流程。 */}
        <Space
          className="w-full"
          orientation="vertical">
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={() => {
              return void actions.handleUpsertDevice();
            }}>
            上报当前设备
          </Button>

          <div className="grid w-full gap-2">
            {state.devices.map(device => {
              const deviceData = device.data;

              const deviceId = typeof deviceData.device_id === "string" ? deviceData.device_id : String(device.id);

              const platform = typeof deviceData.platform === "string" ? deviceData.platform : "web";

              const updatedAt = device.updated_at;

              return (
                <div
                  key={device.id}
                  className="flow-device-row flex items-center gap-3 rounded-lg border p-3">
                  <Avatar icon={<LaptopOutlined />} />

                  <div className="min-w-0 flex-1">
                    <div className="font-bold">
                      {deviceId === state.deviceId ? `${platform}（当前）` : platform}
                    </div>

                    <div className="flow-muted-text mt-1 text-xs">
                      {updatedAt ? `最后活跃：${formatDateTime(updatedAt)}` : "等待同步"}
                    </div>
                  </div>

                  <Button
                    danger
                    aria-label={`删除 ${platform} 设备`}
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => {
                      return void actions.handleDeleteDevice();
                    }} />
                </div>
              );
            })}

            {state.devices.length === 0 && (
              <Empty description="暂无设备" />
            )}
          </div>
        </Space>
      </Drawer>

    </>
  );
}

export { WorkspaceDialogs };
