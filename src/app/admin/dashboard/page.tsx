"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import MapCard from "../../build/components/mapCard";
import API from "@/src/utils/api";

interface Booking {
  id: number;
  name?: string;
  user_id: number;
  port_name?: string;
  terminal_name?: string;
  container_no?: string;
  container_type?: string;
  container_size?: string;
  container_status?: string;
  gate_in_time: string;
  shift_in_plan?: string;
  iso_code?: string;
  stid?: string;

  is_active?: boolean;
  status?: string;
  arrival_status?: string;
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

  const formatGateIn = (gateIn?: string) => {
    if (!gateIn) return "-";
    const date = new Date(gateIn);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getArrivalBadge = (status?: string) => {
    switch (status) {
      case "on_time":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-red-100 text-red-800";
      case "early":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getStatusBookingBadge = (status?: string) => {
    switch (status) {
      case "fit":
        return "bg-green-100 text-green-800";
      case "strange":
        return "bg-gray-200 text-gray-600";
      case "not_match":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-600";
    }
  }

  const fetchBookings = async (decoded: DecodedToken) => {
    try {
      const res = await API.get("http://localhost:8080/api/location/active");
      const allBookings: Booking[] = Array.isArray(res.data.data) ? res.data.data : [];

      const filtered =
        decoded.role === "admin"
          ? allBookings
          : allBookings.filter((b) => String(b.user_id) === String(decoded.user_id));

      const sorted = filtered.sort(
        (a, b) => new Date(a.gate_in_time).getTime() - new Date(b.gate_in_time).getTime()
      );

      setBookings(sorted);
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

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-7 flex flex-col">
          <h2 className="text-lg font-semibold mb-3">Your Bookings</h2>
          <p className="text-gray-500 text-sm mb-4">Active and pending assignments</p>

          <div className="flex-1 overflow-y-auto pr-2 text-sm space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full py-10 mt-2">
                <span className="text-gray-500">Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className=" text-gray-500 text-center mt-20">
                Driver tidak ada booking
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-lg border ${b.is_active === false
                      ? "bg-gray-100 border-gray-200 text-gray-400"
                      : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">
                      {b.name || "Driver tidak ada booking"}
                    </span>

                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${getArrivalBadge(
                          b.arrival_status
                        )}`}
                      >
                        {b.arrival_status || "unknown"}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBookingBadge(
                          b.status
                        )}`}
                      >
                        {b.status || "strange"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Pelabuhan: <span className="font-medium">{b.port_name || "-"}</span> | Terminal: <span className="font-medium">{b.terminal_name || "-"}</span>
                  </p>
                  <p className="text-sm text-gray-500">Gate In: {formatGateIn(b.gate_in_time)}</p>
                  {b.container_no && b.container_type && (
                    <p className="text-sm text-gray-500">Container: {b.container_no} {b.container_type}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
          <h2 className="text-xl font-semibold mb-3">Live Tracking</h2>
          <p className="text-gray-500 text-sm">Real-time driver location and geofence detection</p>
          <div className="rounded-xl overflow-hidden mt-2">
            <MapCard/>
          </div>
        </div>
      </main>
    </div>
  );
}
