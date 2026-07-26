import {
  createCache,
  extractStyle,
  StyleProvider
} from "@ant-design/cssinjs";
import type {
  EntryContext
} from "react-router";
import {
  ServerRouter
} from "react-router";

import {
  renderToPipeableStream
} from "react-dom/server";

import {
  PassThrough
} from "node:stream";

export const streamTimeout = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext
): Promise<Response> | Response {
  let statusCode = responseStatusCode;

  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      headers: responseHeaders,
      status: statusCode
    });
  }

  return new Promise<Response>((resolve, reject) => {
    const styleCache = createCache();

    let shellRendered = false;

    let streamAborted = false;

    let abortRender: () => void = () => {
      streamAborted = true;
    };

    const timeoutId = setTimeout(() => {
      abortRender();
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

              const headCloseIndex = html.indexOf("</head>");

              const document = headCloseIndex === -1
                ? `${antDesignStyles}${html}`
                : `${html.slice(0, headCloseIndex)}${antDesignStyles}${html.slice(headCloseIndex)}`;

              responseHeaders.set("Content-Type", "text/html");

              resolve(new Response(document, {
                headers: responseHeaders,
                status: statusCode
              }));
            });

            pipe(body);
          },
          onError(error: unknown) {
            statusCode = 500;

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

    abortRender = abort;

    if (streamAborted) {
      abort();
    }
  });
}
