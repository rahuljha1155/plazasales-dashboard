import { OnlinePresence } from "@/components/OnlinePresence";
import { useSocketPresence } from "@/hooks/useSocketPresence";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Collection of examples showing different ways to use the Socket.IO presence feature
 */

// Example 1: Basic usage in a header
export function HeaderWithPresence() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <OnlinePresence enabled={true} />
            </div>
        </header>
    );
}

// Example 2: In a card/widget
export function PresenceWidget() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Activity</CardTitle>
                <CardDescription>Real-time visitor tracking</CardDescription>
            </CardHeader>
            <CardContent>
                <OnlinePresence enabled={true} />
            </CardContent>
        </Card>
    );
}

// Example 3: Custom styled with the hook
export function CustomPresenceDisplay() {
    const { onlineUsers, liveSockets, isConnected } = useSocketPresence(true);

    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                <h3 className="text-lg font-semibold">
                    {isConnected ? 'Live Now' : 'Offline'}
                </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <div className="text-3xl font-bold">{onlineUsers ?? '—'}</div>
                    <div className="text-sm opacity-90">Active Users</div>
                </div>
                <div>
                    <div className="text-3xl font-bold">{liveSockets ?? '—'}</div>
                    <div className="text-sm opacity-90">Connections</div>
                </div>
            </div>
        </div>
    );
}

// Example 4: Minimal badge style
export function PresenceBadge() {
    const { onlineUsers, isConnected } = useSocketPresence(true);

    if (!isConnected) return null;

    return (
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{onlineUsers} online</span>
        </div>
    );
}

// Example 5: Sidebar widget
export function SidebarPresence() {
    const { onlineUsers, liveSockets, isConnected } = useSocketPresence(true);

    return (
        <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activity</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                    <span>Visitors:</span>
                    <span className="font-medium text-foreground">{onlineUsers ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Sockets:</span>
                    <span className="font-medium text-foreground">{liveSockets ?? '—'}</span>
                </div>
            </div>
        </div>
    );
}

// Example 6: Conditional rendering based on user role
export function AdminOnlyPresence({ userRole }: { userRole: string }) {
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    if (!isAdmin) {
        return null; // Don't show to regular users
    }

    return (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Admin View</span>
                <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded">ADMIN</span>
            </div>
            <OnlinePresence enabled={true} />
        </div>
    );
}

// Example 7: With loading state
export function PresenceWithLoading() {
    const { onlineUsers, isConnected } = useSocketPresence(true);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate initial loading
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <span>Loading presence...</span>
            </div>
        );
    }

    return <OnlinePresence enabled={true} />;
}

// Example 8: All examples showcase
export default function SocketPresenceExamples() {
    return (
        <div className="container mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Socket.IO Presence Examples</h1>
                <p className="text-muted-foreground">
                    Different ways to display real-time user presence in your application
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Header Style</CardTitle>
                        <CardDescription>Presence indicator in page header</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HeaderWithPresence />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Widget Card</CardTitle>
                        <CardDescription>Standalone presence widget</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PresenceWidget />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. Custom Styled</CardTitle>
                        <CardDescription>Using the hook with custom design</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomPresenceDisplay />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>4. Badge Style</CardTitle>
                        <CardDescription>Minimal inline badge</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PresenceBadge />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>5. Sidebar Widget</CardTitle>
                        <CardDescription>Compact sidebar display</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SidebarPresence />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Admin Only</CardTitle>
                        <CardDescription>Conditional rendering by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminOnlyPresence userRole="admin" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Default Component</CardTitle>
                    <CardDescription>The standard OnlinePresence component</CardDescription>
                </CardHeader>
                <CardContent>
                    <OnlinePresence enabled={true} />
                </CardContent>
            </Card>
        </div>
    );
}

// Don't forget to import React for the loading example
import * as React from "react";
