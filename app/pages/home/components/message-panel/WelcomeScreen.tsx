import {
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

const {
  Text
} = Typography;

function WelcomeScreen(): ReactElement {
  return (
    <div className="flow-default-screen">
      <div
        className="flow-signal-visual"
        aria-hidden="true">
        <span className="flow-signal-line is-one">
          <i />
        </span>

        <span className="flow-signal-line is-two">
          <i />
        </span>

        <span className="flow-signal-line is-three">
          <i />
        </span>

        <div className="flow-signal-core">
          <span>F</span>
          <i />
        </div>
      </div>

      <div className="flow-default-copy">
        <Text className="flow-default-eyebrow">THE WORD IS OUT</Text>
        <Text className="flow-default-title">听听他们在说什么</Text>

        <Text className="flow-default-support">
          最近流言、未读消息和在线的人都在左侧。
        </Text>
      </div>
    </div>
  );
}

export { WelcomeScreen };
