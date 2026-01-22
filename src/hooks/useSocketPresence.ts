import { useEffect, useState } from "react";
import { socketService } from "../services/socketService";

interface PresenceData {
    total?: number;
    totalUnique?: number;
    totalSockets?: number;
}

interface UseSocketPresenceReturn {
    onlineUsers: number | null;
    liveSockets: number | null;
    isConnected: boolean;
}

interface UseSocketPresenceOptions {
    enabled?: boolean;
    onUserCountChange?: (count: number, sockets: number) => void;
}

export const useSocketPresence = (
    options: UseSocketPresenceOptions | boolean = true
): UseSocketPresenceReturn => {
    const enabled = typeof options === 'boolean' ? options : options.enabled ?? true;
    const onUserCountChange = typeof options === 'object' ? options.onUserCountChange : undefined;
    const [onlineUsers, setOnlineUsers] = useState<number | null>(null);
    const [liveSockets, setLiveSockets] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        socketService.connect();

        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            setOnlineUsers(null);
            setLiveSockets(null);
        };

        const handleConnectError = (err: Error) => {
            setIsConnected(false);
            setOnlineUsers(null);
            setLiveSockets(null);
        };

        const handleOnlineUsers = (payload?: PresenceData) => {
            const unique =
                typeof payload?.totalUnique === "number"
                    ? payload.totalUnique
                    : typeof payload?.total === "number"
                        ? payload.total
                        : null;

            if (unique !== null) setOnlineUsers(unique);

            const sockets = typeof payload?.totalSockets === "number"
                ? payload.totalSockets
                : null;

            if (sockets !== null) {
                setLiveSockets(sockets);
            }

            // Trigger callback when user count changes
            if (onUserCountChange && unique !== null && sockets !== null) {
                onUserCountChange(unique, sockets);
            }
        };

        socketService.on("connect", handleConnect);
        socketService.on("disconnect", handleDisconnect);
        socketService.on("connect_error", handleConnectError);
        socketService.on("online-users", handleOnlineUsers);

        return () => {
            socketService.off("connect", handleConnect);
            socketService.off("disconnect", handleDisconnect);
            socketService.off("connect_error", handleConnectError);
            socketService.off("online-users", handleOnlineUsers);
            socketService.disconnect();
        };
    }, [enabled, onUserCountChange]);

    return { onlineUsers, liveSockets, isConnected };
};
