import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Generate 14-day bookings and cancellations
const generateRealTimeOrderData = () => {
  const now = new Date();
  const data = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseOrders = isWeekend ? 120 : 180;
    const randomFactor = Math.random() * 40 - 20;

    data.push({
      date: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
      Bookings: Math.floor(baseOrders + randomFactor),
      Cancelled: Math.floor(Math.random() * (isWeekend ? 15 : 25)),
    });
  }

  return data;
};

// Generate hourly sales data
const generateRealTimeSalesData = () => {
  const data = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');

    let baseAmount;
    if (i >= 9 && i <= 17) baseAmount = 2500;
    else if (i >= 18 && i <= 21) baseAmount = 1800;
    else baseAmount = 800;

    const variation = Math.random() * 1000 - 500;
    let sales = Math.max(0, Math.round(baseAmount + variation));

    if (i === currentHour) {
      const progress = currentMinute / 60;
      sales = Math.round(sales * progress);
    } else if (i > currentHour) {
      sales = 0;
    }

    data.push({
      time: `${hour}:00`,
      sales: sales
    });
  }

  return data;
};

const CustomActiveBar = (props: any) => {
  const { fill, x, y, width, height, radius } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={radius?.[0] || 0}
      ry={radius?.[1] || 0}
      fill={fill}
      stroke="none"
    />
  );
};

const GaugeChart = ({ value, max, color }: { value: number, max: number, color: string }) => {
  const angle = (value / max) * 180;
  return (
    <div className="relative w-full h-32">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-16 overflow-hidden">
          <div
            className="w-32 h-32 rounded-full border-8"
            style={{
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0% 100%)',
              transform: `rotate(${angle}deg)`,
              borderColor: color,
              borderTopColor: '#000',
              borderRightColor: '#000',
              transition: 'transform 1s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Bookinginfo() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<number>(0);
  const [selectedCancelled, setSelectedCancelled] = useState<number>(0);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString(undefined, options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateChartData = () => {
      setOrderData(generateRealTimeOrderData());
      setSalesData(generateRealTimeSalesData());
    };

    updateChartData();
    const interval = setInterval(updateChartData, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = new Date().getHours();
  const totalSalesToday = salesData
    .filter((data, index) => index <= currentHour)
    .reduce((acc, curr) => acc + curr.sales, 0);

  const bookingsToday = orderData.length > 0 ? orderData[orderData.length - 1]?.Bookings || 0 : 0;
  const bookingsYesterday = orderData.length > 1 ? orderData[orderData.length - 2].Bookings : 0;
  const bookingsDiff = bookingsToday - bookingsYesterday;
  const bookingsDiffText = bookingsDiff === 0 ? 'No change' : `${bookingsDiff > 0 ? '↑' : '↓'} ${Math.abs(bookingsDiff)} Vs yesterday`;

  const totalBookings14Days = orderData.reduce((acc, curr) => acc + curr.Bookings, 0);
  const avgBookingsPerDay = (totalBookings14Days / orderData.length).toFixed(1);

  const totalCancellations14Days = orderData.reduce((acc, curr) => acc + curr.Cancelled, 0);
  const avgCancellationsPerDay = (totalCancellations14Days / orderData.length).toFixed(1);

  return (
    <>
      <CardHeader>
        <CardTitle>Booking & Sales Activity</CardTitle>
        <CardDescription>{currentDateTime || 'Loading date and time...'}</CardDescription>
      </CardHeader>

      <div className='p-6 rounded-sm shadow-lg w-full bg-[#FFB47F] text-white'>
        <div className="grid grid-cols-12 gap-4 h-full">

          {/* Bar chart for bookings */}
          <div className="col-span-8 bg-[#fff] rounded-sm p-4 text-black">
            <h2 className="text-[1rem] mb-4 font-semibold">Past 14 days</h2>
            <div className="h-[70%]">
              <div className="h-[20%] w-full">
                <div className="ping flex justify-end items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#36BFFA]"></div>
                    <span className='text-xs text-zinc-500 font-semibold'>Number of Bookings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#FF4D4F]"></div>
                    <span className='text-xs text-zinc-500 font-semibold'>Number of Cancellations</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderData}
                  onClick={(data) => {
                    if (data && data.activePayload) {
                      const payload = data.activePayload[0].payload;
                      setSelectedDate(payload.date);
                      setSelectedBookings(payload.Bookings);
                      setSelectedCancelled(payload.Cancelled);
                    }
                  }}
                >
                  <XAxis dataKey="date" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip />
                  <Bar dataKey="Bookings" fill="#36bffa" activeBar={<CustomActiveBar />} />
                  <Bar dataKey="Cancelled" fill="#FF7700" activeBar={<CustomActiveBar />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gauges */}
          <div className="col-span-4 space-y-4">
            <div className="bg-[#F0F8FF] p-4 rounded-sm text-black">
              <h3 className="text-sm mb-2 font-semibold">Avg. Bookings per day (14 days)</h3>
              <GaugeChart value={Number(avgBookingsPerDay)} max={300} color="#36bffa" />
              <p className="text-center text-2xl font-bold">{avgBookingsPerDay}</p>
              <p className="text-center text-xs text-gray-400">Total: {totalBookings14Days}</p>
            </div>
            <div className="bg-[#fff] p-4 rounded-sm text-black">
              <h3 className="text-sm mb-2 font-semibold">Avg. cancellations per day (14 days)</h3>
              <GaugeChart value={Number(avgCancellationsPerDay)} max={50} color="#36bffa" />
              <p className="text-center text-2xl font-bold">{avgCancellationsPerDay}</p>
              <p className="text-center text-xs text-gray-400">Total: {totalCancellations14Days}</p>
            </div>
          </div>

          {/* Sales chart */}
          <div className="col-span-8 bg-[#ffffff] rounded-sm p-4 text-black">
            <h2 className="text-[1rem] mb-4 font-semibold">Sales today</h2>
            <div className="h-48 mt-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <XAxis dataKey="time" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#FF7700" fill="#36bffa33" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's metrics */}
          <div className="col-span-4 space-y-4">
            <div className="bg-[#fff] p-4 rounded-sm text-black">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{selectedDate ? selectedBookings : bookingsToday}</h3>
                <p className="text-sm">{selectedDate ? `Bookings (${selectedDate})` : 'Bookings today'}</p>
                {selectedDate ? (
                  <p className="text-xs text-blue-400">Cancelled: {selectedCancelled}</p>
                ) : (
                  <p className={`text-xs ${bookingsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>{bookingsDiffText}</p>
                )}
              </div>
            </div>
            <div className="bg-white p-4 rounded-sm text-[#242738]">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">£{totalSalesToday.toLocaleString('en-GB', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</h3>
                <p className="text-sm">Sales today</p>
                <p className="text-xs text-gray-400">Updated: {new Date().toLocaleTimeString('en-GB')}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-sm text-black">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">87%</h3>
                <p className="text-sm">Goal abandonment rate</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
