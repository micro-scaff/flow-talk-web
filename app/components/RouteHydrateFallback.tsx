import type {
  ReactElement
} from "react";

function RouteHydrateFallback(): ReactElement {
  return (
    <main className="flow-route-loading">
      <div className="flow-route-loading-mark">
        FT
      </div>
    </main>
  );
}

export { RouteHydrateFallback };
