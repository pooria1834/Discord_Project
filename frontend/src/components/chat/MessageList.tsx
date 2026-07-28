import type { ChatMessage } from "../../types/chat";
import type { User } from "../../types/user";
import MessageItem from "./MessageItem";

type MessageListProps = {
  messages: ChatMessage[];
  currentUser: User | null;
  onMessageEdited: (message: ChatMessage) => void;
  onMessageDeleted: (messageId: number) => void;
};

function MessageList({ messages, currentUser, onMessageEdited, onMessageDeleted }: MessageListProps) {
  return (
    <ul className="grid gap-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUser={currentUser}
          onMessageEdited={onMessageEdited}
          onMessageDeleted={onMessageDeleted}
        />
      ))}
    </ul>
  );
}

export default MessageList;
