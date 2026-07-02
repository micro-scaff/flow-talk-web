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
    return redirect("/login");
  }

  return null;
}

clientLoader.hydrate = true as const;

export default function Home(): ReactElement {
  const viewModel = useHomeWorkbenchHook();

  return <HomeWorkbench viewModel={viewModel} />;
}

export {
  clientLoader,
  meta
};
