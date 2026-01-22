import { type FormEvent, useState } from "react";
import { useSocketPresence } from "../hooks/useSocketPresence";
import { socketService } from "../services/socketService";

export const SocketExample = () => {
    const { onlineUsers, liveSockets, isConnected } = useSocketPresence(true);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!message.trim()) {
            setStatus("Message cannot be empty");
            return;
        }

        // Example: emit a custom event
        socketService.emit("custom-message", { text: message });
        setStatus(`Sent: ${message}`);
        setMessage("");

        // Clear status after 3 seconds
        setTimeout(() => setStatus(null), 3000);
    };

    return (
        <div className="space-y-6 p-6 bg-card border rounded-lg">
            <div>
                <h2 className="text-2xl font-bold mb-2">Socket.IO Live Presence</h2>
                <p className="text-muted-foreground">
                    Real-time user presence tracking using Socket.IO
                </p>
            </div>

            {/* Presence Indicator */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <span
                    className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        }`}
                    aria-hidden="true"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="font-medium">
                            {onlineUsers ?? "—"} unique{" "}
                            {onlineUsers === 1 ? "visitor" : "visitors"}
                        </div>
                        <div className="text-muted-foreground">
                            {liveSockets ?? "—"} live socket{liveSockets === 1 ? "" : "s"}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isConnected
                            ? "Real-time via socket"
                            : "Connecting to live presence..."}
                    </p>
                </div>
            </div>

            {/* Example Message Form */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Send Socket Message</h3>
                <form onSubmit={handleSendMessage} className="space-y-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!isConnected}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConnected ? "Send Message" : "Connecting..."}
                    </button>
                </form>
                {status && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                        {status}
                    </div>
                )}
            </div>

            {/* Connection Info */}
            <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-md">
                <p><strong>Socket URL:</strong> {import.meta.env.VITE_SOCKET_URL || "Auto-detected"}</p>
                <p><strong>Transport:</strong> {import.meta.env.VITE_SOCKET_TRANSPORTS || "polling"}</p>
                <p><strong>Status:</strong> {isConnected ? "Connected" : "Disconnected"}</p>
            </div>
        </div>
    );
};
