import { useSocketPresence } from "../hooks/useSocketPresence";

interface SocketPresenceProps {
    className?: string;
    showSockets?: boolean;
}

export const SocketPresence = ({
    className = "",
    showSockets = true
}: SocketPresenceProps) => {
    const { onlineUsers, liveSockets, isConnected } = useSocketPresence();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                aria-hidden="true"
            />
            <div className="flex flex-col">
                <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium">
                        {onlineUsers ?? "—"} {onlineUsers === 1 ? "user" : "users"} online
                    </span>
                    {showSockets && (
                        <span className="text-muted-foreground text-xs">
                            {liveSockets ?? "—"} {liveSockets === 1 ? "connection" : "connections"}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {isConnected ? "Live" : "Connecting..."}
                </p>
            </div>
        </div>
    );
};
