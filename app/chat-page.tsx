"use client";

import "./styles/chat.css";
/**
 * Corporate chat entry point (lazy-loaded by the dashboard). The page lives in
 * app/_components/chat/: data hooks (use-chat-feed, use-chat-contacts), the
 * upload helper and presentational parts (sidebar, message list, composer, group modal).
 */
import { ChatPage } from "./_components/chat/chat-page";

export { ChatPage };
export default ChatPage;
