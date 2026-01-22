import { io, Socket } from "socket.io-client";

// Use the plaza API URL for socket connection based on your backend setup
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/v1$/, "") || "https://plaza-api.webxnepal.com";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
