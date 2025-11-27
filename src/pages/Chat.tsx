import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { messageAPI } from "@/services/api";
import socketService from "@/services/socket";
import type { Message } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { formatTime, getInitials } from "@/lib/utils";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user?.teamId) return;

    try {
      const response = await messageAPI.getAll(user.teamId);
      setMessages(response.data?.messages || []);
    } catch {
      toast.error("Failed to fetch messages");
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.teamId) return;

    try {
      await messageAPI.send(newMessage, user.teamId);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user?.teamId) {
      fetchMessages();
      socketService.joinTeam(user.teamId);
      socketService.onMessage(handleNewMessage);
    }

    return () => {
      socketService.offMessage();
    };
  }, [user?.teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Chat</h1>
        <p className="text-muted-foreground">
          Communicate with your team in real-time
        </p>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => {
              const sender =
                typeof message.senderId === "object" ? message.senderId : null;
              const isOwn = user?.id === (sender?.id || message.senderId);

              return (
                <div
                  key={message._id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {sender ? getInitials(sender.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {sender?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-md ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
