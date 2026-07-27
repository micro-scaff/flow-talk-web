import {
  CheckCircleOutlined, DeleteOutlined, LaptopOutlined
} from "@ant-design/icons";
import {
  Avatar, Button, Drawer, Empty, Space
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  formatDateTime
} from "../../utils";

interface IDevicesDrawerProps {
  viewModel: IHomeWorkbenchViewModel;
}

function DevicesDrawer({
  viewModel
}: IDevicesDrawerProps): ReactElement {
  const {
    actions, dialogs, state
  } = viewModel;

  return (
    <Drawer
      open={dialogs.devicesOpen}
      size={420}
      title="设备与离线同步"
      onClose={() => {
        return actions.setDevicesOpen(false);
      }}>
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
                    {device.updated_at ? `最后活跃：${formatDateTime(device.updated_at)}` : "等待同步"}
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
  );
}

export { DevicesDrawer };
