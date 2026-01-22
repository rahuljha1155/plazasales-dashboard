import { useSocketPresence } from "@/hooks/useSocketPresence";

interface OnlinePresenceProps {
    enabled?: boolean;
}

export const OnlinePresence = ({ enabled = false }: OnlinePresenceProps) => {
    const { onlineUsers, liveSockets, isConnected } = useSocketPresence(enabled);

    if (!enabled) {
        return (
            <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                    Real-time presence disabled
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                aria-hidden="true"
            />
            <div className="flex flex-col">
                <div className="flex items-center gap-4 text-sm">
                    <div className="font-medium">
                        {onlineUsers ?? "—"} unique{" "}
                        {onlineUsers === 1 ? "visitor" : "visitors"}
                    </div>
                    <div className="text-muted-foreground">
                        {liveSockets ?? "—"} live socket{liveSockets === 1 ? "" : "s"}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {isConnected
                        ? "Real-time via socket"
                        : "Socket connection unavailable"}
                </p>
            </div>
        </div>
    );
};
