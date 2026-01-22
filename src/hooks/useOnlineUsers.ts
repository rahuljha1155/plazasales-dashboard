import { useEffect, useState } from "react";
import { getSocket } from "@/services/socket";

interface OnlineUsersPayload {
    total?: number;
    totalUnique?: number;
    totalSockets?: number;
}

export const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState<number | null>(null);
    const [liveSockets, setLiveSockets] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = getSocket();

        const handleOnlineUsers = (payload?: OnlineUsersPayload) => {
            const unique =
                typeof payload?.totalUnique === "number"
                    ? payload.totalUnique
                    : typeof payload?.total === "number"
                        ? payload.total
                        : null;

            if (unique !== null) setOnlineUsers(unique);
            if (typeof payload?.totalSockets === "number") {
                setLiveSockets(payload.totalSockets);
            }
        };

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => {
            setIsConnected(false);
            setOnlineUsers(null);
            setLiveSockets(null);
        };
        const handleConnectError = () => {
            setIsConnected(false);
            setOnlineUsers(null);
            setLiveSockets(null);
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);
        socket.on("online-users", handleOnlineUsers);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
            socket.off("online-users", handleOnlineUsers);
        };
    }, []);

    return { onlineUsers, liveSockets, isConnected };
};
