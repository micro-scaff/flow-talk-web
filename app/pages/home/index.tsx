import type {
  ReactElement
} from "react";
import {
  redirect
} from "react-router";

import {
  getSession
} from "~/utils";

import {
  HomeWorkbench
} from "./components/HomeWorkbench";
import {
  useHomeWorkbenchHook
} from "./hooks/use-home-workbench-hook";

function meta(): Array<{ title: string }> {
  return [
    {
      title: "Flow Talk 工作台"
    }
  ];
}

function clientLoader(): Response | null {
  const session = getSession();

  if (!session?.token) {

    // 工作台只在浏览器端校验本地 token，后端有效性由初始化时的 GET /api/me 再确认。
    return redirect("/login");
  }

  return null;
}

clientLoader.hydrate = true as const;

export default function Home(): ReactElement {

  // 页面组件只负责组装 viewModel 和视图，复杂状态集中在 useHomeWorkbenchHook。
  const viewModel = useHomeWorkbenchHook();

  return <HomeWorkbench viewModel={viewModel} />;
}

export {
  clientLoader,
  meta
};
