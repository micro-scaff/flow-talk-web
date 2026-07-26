import {
  PassThrough
} from "node:stream";

import {
  createCache,
  extractStyle,
  StyleProvider
} from "@ant-design/cssinjs";
import type {
  AppLoadContext,
  EntryContext
} from "react-router";
import {
  ServerRouter
} from "react-router";
import {
  renderToPipeableStream
} from "react-dom/server";

export const streamTimeout = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    _loadContext: AppLoadContext
): Promise<Response> | Response {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      headers: responseHeaders,
      status: responseStatusCode
    });
  }

  return new Promise<Response>((resolve, reject) => {
    const styleCache = createCache();

    let shellRendered = false;

    const timeoutId = setTimeout(() => {
      abort();
    }, streamTimeout + 1000);

    const {
      abort,
      pipe
    } = renderToPipeableStream(
        <StyleProvider cache={styleCache}>
          <ServerRouter
            context={routerContext}
            url={request.url} />
        </StyleProvider>,
        {
          onAllReady() {
            shellRendered = true;

            const body = new PassThrough();

            const chunks: Buffer[] = [];

            body.on("data", (chunk: Buffer | string) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            body.on("error", error => {
              clearTimeout(timeoutId);
              reject(error);
            });
            body.on("end", () => {
              clearTimeout(timeoutId);

              const html = Buffer.concat(chunks).toString("utf8");

              const antDesignStyles = extractStyle(styleCache);

              const document = html.replace("</head>", `${antDesignStyles}</head>`);

              responseHeaders.set("Content-Type", "text/html");

              resolve(new Response(document, {
                headers: responseHeaders,
                status: responseStatusCode
              }));
            });

            pipe(body);
          },
          onError(error: unknown) {
            responseStatusCode = 500;

            if (shellRendered) {
              console.error(error);
            }
          },
          onShellError(error: unknown) {
            clearTimeout(timeoutId);
            reject(error);
          }
        }
    );
  });
}
