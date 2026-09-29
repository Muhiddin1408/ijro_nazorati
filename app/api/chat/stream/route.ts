import { getD1 } from "../../../../db";
import { apiError, requireActor } from "../../../../lib/auth";
import { createChatEventFilter, subscribeChatEvents, type ChatEvent } from "../../../../lib/chat-events";

export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;
// Streams end periodically so EventSource reconnects and the session is re-checked.
const MAX_STREAM_MS = 5 * 60_000;

/** Server-sent events: `message` events carry only { channelId, messageId }. */
export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const mayReceive = createChatEventFilter(await getD1(), actor);
    const encoder = new TextEncoder();
    let cleanup = () => {};

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const send = (chunk: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            cleanup();
          }
        };
        // Deliver events in order; access checks may await the database.
        let queue = Promise.resolve();
        const unsubscribe = subscribeChatEvents((event: ChatEvent) => {
          queue = queue
            .then(async () => {
              if (closed || !(await mayReceive(event))) return;
              send(
                `event: message\ndata: ${JSON.stringify({ channelId: event.channelId, messageId: event.messageId })}\n\n`,
              );
            })
            .catch((error) => console.error("Chat stream event failed", error));
        });
        const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);
        const lifetime = setTimeout(() => cleanup(), MAX_STREAM_MS);
        cleanup = () => {
          if (closed) return;
          closed = true;
          unsubscribe();
          clearInterval(heartbeat);
          clearTimeout(lifetime);
          request.signal.removeEventListener("abort", cleanup);
          try {
            controller.close();
          } catch {
            // Already closed by the runtime.
          }
        };
        request.signal.addEventListener("abort", cleanup);
        send("retry: 5000\n: connected\n\n");
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
