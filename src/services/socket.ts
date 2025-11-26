import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTeam(teamId: string) {
    if (this.socket) {
      this.socket.emit("join-team", teamId);
    }
  }

  leaveTeam(teamId: string) {
    if (this.socket) {
      this.socket.emit("leave-team", teamId);
    }
  }

  sendMessage(teamId: string, message: string) {
    if (this.socket) {
      this.socket.emit("send-message", { teamId, message });
    }
  }

  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  onTaskUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("task-updated", callback);
    }
  }

  offMessage() {
    if (this.socket) {
      this.socket.off("new-message");
    }
  }

  offTaskUpdate() {
    if (this.socket) {
      this.socket.off("task-updated");
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
