import { getTranslations } from "next-intl/server";
import { ChatPanel } from "@/components/chat/chat-panel";

export default async function ChatPage() {
  const t = await getTranslations("chat");

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <ChatPanel />
    </div>
  );
}
