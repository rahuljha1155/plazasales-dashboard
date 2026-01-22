import { useSocket } from "@/hooks/useSocket";

const LiveUsersDashboard = () => {
  const { activeUsers, statistics, notifications } = useSocket();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Summary Cards */}
      <div className="bg-white rounded-sm p-6  w-full">
        <h3 className="text-lg font-semibold text-gray-700">
          Current Visitors
        </h3>
        <div className="text-4xl font-extrabold text-primary">
          {statistics.totalUsers}
        </div>
        <p className="text-sm text-gray-500">
          {statistics.uniqueIps} unique IPs • {statistics.countryCount}{" "}
          countries
        </p>
      </div>

      <div className="bg-white rounded-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Top Countries</h3>
        <div className="space-y-2">
          {Object.entries(statistics.countries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([country, count]) => (
              <div key={country} className="flex items-center gap-2">
                <span className="w-24 truncate text-sm font-medium">
                  {country}
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(count / statistics.totalUsers) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-sm  p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Active Pages</h3>
        <div className="space-y-2 text-sm">
          {Object.entries(statistics.pages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([page, count]) => (
              <div key={page} className="flex justify-between">
                <span className="truncate">{page}</span>
                <span>{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Live Activity */}
      <div className="bg-white rounded-sm h-full p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Live Activity
        </h3>
        <div className="space-y-2">
          {[...notifications].reverse().map((note, i) => (
            <div
              key={i}
              className={`p-3 rounded-[2px] border text-sm ${note.type === "connect"
                ? "bg-orange-50 border-orange-200 text-orange-800"
                : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
            >
              <div className="font-medium">{note.message}</div>
              <div className="text-xs text-gray-500">
                {note.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveUsersDashboard;
