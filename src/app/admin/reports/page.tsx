"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API from "@/src/utils/api";

interface Booking {
  id: number;
  name?: string;
  user_id: number;
  port_name?: string;
  terminal_name?: string;
  container_no?: string;
  iso_code?: string;
  gate_in_time: string;
  start_time?: string;
  is_active?: boolean;
  arrival_status?: string;
  status?: string;
}


interface DecodedToken {
  email: string;
  exp: number;
  role: string;
  user_id: string;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (decoded: DecodedToken) => {
    try {
      const res = await API.get("http://localhost:8080/api/location/active");
      const allBookings: Booking[] = Array.isArray(res.data.data) ? res.data.data : [];

      const filtered =
        decoded.role === "admin"
          ? allBookings
          : allBookings.filter((b) => String(b.user_id) === String(decoded.user_id));

      setBookings(filtered);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      fetchBookings(decoded);

      const interval = setInterval(() => fetchBookings(decoded), 10000);
      return () => clearInterval(interval);
    } catch {
      setBookings([]);
      setLoading(false);
    }
  }, []);

  const getAggregates = () => {
    const result = {
      early: 0,
      on_time: 0,
      late: 0,
      fit: 0,
      strange: 0,
      off_schedule: 0,
    };

    bookings.forEach((b) => {
      if (b.arrival_status === "early") result.early += 1;
      if (b.arrival_status === "on_time") result.on_time += 1;
      if (b.arrival_status === "late") result.late += 1;

      if (b.status === "fit") result.fit += 1;
      if (b.status === "strange") result.strange += 1;
      if (b.status === "off_schedule") result.off_schedule += 1;
    });

    return result;
  };

  const aggregates = getAggregates();

  const formatGateIn = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Booking & Arrival Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Early" amount={aggregates.early} />
        <Card title="On Time" amount={aggregates.on_time} />
        <Card title="Late" amount={aggregates.late} />
        <Card title="Fit" amount={aggregates.fit} />
        <Card title="Strange" amount={aggregates.strange} />
        <Card title="Off-schedule" amount={aggregates.off_schedule} />
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700 text-sm">
            <thead className="border-b border-gray-300">
              <tr>
                <th className="p-3">Driver</th>
                <th className="p-3">Port</th>
                <th className="p-3">Terminal</th>
                <th className="p-3">Gate In</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">Container No</th>
                <th className="p-3">ISO Code</th>
                <th className="p-3">Arrival</th>
                <th className="p-3">Status Booking</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-500">
                    No bookings available
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{b.name || "-"}</td>
                    <td className="p-3">{b.port_name || "-"}</td>
                    <td className="p-3">{b.terminal_name || "-"}</td>

                    <td className="p-3">{formatGateIn(b.gate_in_time)}</td>
                    <td className="p-3">{formatGateIn(b.start_time)}</td>
                    <td className="p-3">{b.container_no || "-"}</td>
                    <td className="p-3">{b.iso_code || "-"}</td>
                    <td className="p-3">{b.arrival_status || "-"}</td>
                    <td className="p-3">{b.status || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, amount }: { title: string; amount: number }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-semibold mt-2">{amount}</h2>
    </div>
  );
}
