import {
  PaperClipOutlined,
  SendOutlined
} from "@ant-design/icons";
import {
  Button,
  Input,
  Tooltip,
  Upload
} from "antd";
import type {
  UploadProps
} from "antd";
import type {
  ReactElement,
  RefObject
} from "react";

import type {
  TextAreaRef
} from "antd/es/input/TextArea";

import type {
  IHomeWorkbenchViewModel
} from "../../type";

const {
  TextArea
} = Input;

interface IMessageComposerProps {
  inputRef: RefObject<TextAreaRef | null>;
  onSubmit: () => Promise<void>;
  viewModel: IHomeWorkbenchViewModel;
}

function MessageComposer({
  inputRef,
  onSubmit,
  viewModel
}: IMessageComposerProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const resourceUploadProps: UploadProps = {
    accept: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,image/*,video/*",
    beforeUpload(file) {
      void actions.handleSendResource(file);

      return Upload.LIST_IGNORE;
    },
    disabled: state.resourceUploading || state.sending,
    maxCount: 1,
    showUploadList: false
  };

  return (
    <footer className="flow-composer">
      <div className="flow-composer-inner">
        <Tooltip title="发送图片或视频">
          <Upload {...resourceUploadProps}>
            <Button
              aria-label="发送文件"
              className="flow-resource-button"
              icon={<PaperClipOutlined />}
              loading={state.resourceUploading}
              type="text" />
          </Upload>
        </Tooltip>

        <TextArea
          aria-label="流言内容"
          autoSize={{
            maxRows: 4,
            minRows: 1
          }}
          className="flow-message-input"
          disabled={state.resourceUploading}
          enterKeyHint="send"
          placeholder={state.resourceUploading ? "资源上传中…" : "说点什么…"}
          ref={inputRef}
          value={state.draftText}
          onChange={event => {
            return actions.setDraftText(event.target.value);
          }}
          onPressEnter={event => {
            if (event.shiftKey) {
              return;
            }

            event.preventDefault();
            void onSubmit();
          }} />

        <Button
          aria-label="发送消息"
          className="flow-send-button"
          disabled={!state.draftText.trim() || state.resourceUploading}
          icon={<SendOutlined />}
          loading={state.sending}
          type="primary"
          onMouseDown={event => {
            event.preventDefault();
          }}
          onPointerDown={event => {
            event.preventDefault();
          }}
          onClick={() => {
            return void onSubmit();
          }} />
      </div>
    </footer>
  );
}

export { MessageComposer };
