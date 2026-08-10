import { ChatPage } from "@/components/chat/chat-page";

export default async function ChatRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ initialMessage?: string }>;
}) {
  const { id } = await params;
  const { initialMessage } = await searchParams;

  return <ChatPage chatId={id} initialMessage={initialMessage} />;
}
