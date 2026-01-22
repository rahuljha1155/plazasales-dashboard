import { OnlinePresence } from "@/components/OnlinePresence";

/**
 * Example usage of the OnlinePresence component
 * 
 * This component displays real-time user count using Socket.IO
 * It connects to your backend at: https://plaza-api.webxnepal.com
 * 
 * The socket listens for 'online-users' events with this payload:
 * {
 *   total?: number;
 *   totalUnique?: number;
 *   totalSockets?: number;
 * }
 */

export default function TestOnlinePresence() {
    return (
        <div className="p-8 space-y-8">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Online Presence Test</h1>
                <p className="text-muted-foreground mb-6">
                    This demonstrates the real-time user count feature using Socket.IO.
                </p>

                {/* Example 1: Enabled presence */}
                <div className="border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Live User Count (Enabled)</h2>
                    <OnlinePresence enabled={true} />
                </div>

                {/* Example 2: Disabled presence */}
                <div className="border rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Disabled State</h2>
                    <OnlinePresence enabled={false} />
                </div>

                {/* Usage instructions */}
                <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-3">How to use in your components:</h3>
                    <pre className="bg-background p-4 rounded border overflow-x-auto text-sm">
                        {`import { OnlinePresence } from "@/components/OnlinePresence";

// In your component:
<OnlinePresence enabled={true} />

// Or conditionally enable:
<OnlinePresence enabled={isUserLoggedIn} />`}
                    </pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 mt-6">
                    <h3 className="font-semibold mb-3">Backend Requirements:</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Socket.IO server running at: <code className="bg-background px-2 py-1 rounded">https://plaza-api.webxnepal.com</code></li>
                        <li>Server must emit <code className="bg-background px-2 py-1 rounded">'online-users'</code> events</li>
                        <li>Event payload should include: <code className="bg-background px-2 py-1 rounded">totalUnique</code> and <code className="bg-background px-2 py-1 rounded">totalSockets</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
