import type {
  ReactElement
} from "react";
import {
  redirect
} from "react-router";

import {
  getSession
} from "~/utils";

function clientLoader(): Response | null {
  const session = getSession();

  if (!session?.token) {
    return redirect("/login");
  }

  return null;
}

clientLoader.hydrate = true as const;

export default function Home(): ReactElement {
  return <>111</>;
}

export { clientLoader };
