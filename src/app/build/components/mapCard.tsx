"use client";

import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  LoadScript,
  CircleF,
  OverlayView,
  Polygon,
} from "@react-google-maps/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const containerStyle = { width: "100%", height: "650px" };
const defaultCenter = { lat: -6.1044, lng: 106.88 };

type DriverData = {
  userId: number;
  lat: number;
  lng: number;
  email?: string;
  booking_status?: "fit" | "none" | "error" | "strange" | "wrong_destination";
  arrival_status?: "ontime" | "early" | "late" | "outside" | "-" | "geofence_not_found";
  destination?: string;
  current_terminal?: string;
  alert?: string;
};

type GeofenceArea = {
  id: number;
  type: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
  polygon?: number[][];
};

interface GeofenceAPIResponse {
  id: number;
  type?: string;
  name: string;
  lat?: number;
  lng?: number;
  radius?: number;
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
  polygon?: number[][];
}


export default function MapCard() {
  const [drivers, setDrivers] = useState<Record<number, DriverData>>({});
  const [center, setCenter] = useState(defaultCenter);
  const [geofences, setGeofences] = useState<GeofenceArea[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/geofences")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          const mapped: GeofenceArea[] = data.data.map((g: GeofenceAPIResponse) => ({
            id: g.id,
  type: g.type || "port",
  name: g.name,
  lat: g.lat ?? 0,
  lng: g.lng ?? 0,
  radius: g.radius ?? 100,
  color:
    g.type === "port"
      ? "#1E90FF"
      : g.type === "terminal"
        ? "#32CD32"
        : "#FF8C00",
  latMin: g.latMin,
  latMax: g.latMax,
  lngMin: g.lngMin,
  lngMax: g.lngMax,
  polygon: g.polygon,
          }));

          setGeofences(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch geofences:", err));
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8080/ws");

      socket.onopen = () => console.log("Connected to WebSocket");
      socket.onclose = () => setTimeout(connectWebSocket, 2000);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as DriverData;
          if (data.alert) toast.info(data.alert, { position: "top-right", autoClose: 500 });
          if (typeof data.lat === "number" && typeof data.lng === "number") {
            setDrivers((prev) => ({ ...prev, [data.userId]: data }));
            setCenter({ lat: data.lat, lng: data.lng });
          }
        } catch (err) {
          console.error(err);
        }
      };
    };
    connectWebSocket();
    return () => socket?.close();
  }, []);

  const getMarkerColor = (driver: DriverData) => {
    if (driver.booking_status === "wrong_destination") return "orange";
    if (driver.booking_status === "none" || !driver.booking_status) return "ltblue";
    if (driver.booking_status === "error") return "gray";
    if (driver.booking_status === "strange") return "purple";

    switch (driver.arrival_status) {
      case "ontime":
        return "green";
      case "early":
        return "yellow";
      case "late":
        return "red";
      case "outside":
        return "blue";
      default:
        return "ltblue";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-col gap-4">
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
            {geofences.map((g) => {
              if (g.polygon && g.polygon.length > 0) {
                const path = g.polygon.map(p => ({ lat: Number(p[1]), lng: Number(p[0]) }));
                return (
                  <Polygon
                    key={`polygon-${g.id}`}
                    paths={path}
                    options={{
                      strokeColor: g.color,
                      strokeOpacity: 0.9,
                      strokeWeight: 2,
                      fillColor: g.color,
                      fillOpacity: 0.25,
                    }}
                  />
                );
              }
              if (g.lat && g.lng && g.radius > 0) {
                return (
                  <CircleF
                    key={`circle-${g.id}`}
                    center={{ lat: g.lat, lng: g.lng }}
                    radius={g.radius}
                    options={{
                      strokeColor: g.color,
                      strokeOpacity: 0.9,
                      strokeWeight: 2,
                      fillColor: g.color,
                      fillOpacity: 0.2,
                    }}
                  />
                );
              }
              return null;
            })}


            {Object.values(drivers).map((driver) => {
              const markerColor = getMarkerColor(driver);

              return (
                <div key={`driver-${driver.userId}`}>
                  <Marker
                    position={{ lat: driver.lat, lng: driver.lng }}
                    icon={
                      window.google
                        ? { url: `https://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`, scaledSize: new window.google.maps.Size(40, 40) }
                        : undefined
                    }
                  />
                  <OverlayView position={{ lat: driver.lat, lng: driver.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                    <div style={{ transform: "translate(-50%, -130%)" }}>
                      <div className="bg-white/90 border border-gray-200 rounded-xl shadow-md px-3 py-2 text-sm text-gray-700 backdrop-blur-sm min-w-[150px] hover:shadow-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold truncate">{driver.email ? driver.email.split("@")[0] : `Driver ${driver.userId}`}</span>
                        </div>
                        <div className="text-xs space-y-0.5">
                          <p>Booking: <b className={driver.booking_status === "fit" ? "text-emerald-600" : driver.booking_status === "wrong_destination" ? "text-orange-500" : driver.booking_status === "strange" ? "text-red-500" : "text-gray-400"}>{driver.booking_status}</b></p>
                          <p>Arrival: <b className={driver.arrival_status === "ontime" ? "text-emerald-600" : driver.arrival_status === "late" ? "text-rose-500" : driver.arrival_status === "early" ? "text-amber-500" : "text-gray-400"}>{driver.arrival_status}</b></p>
                          {driver.destination && <p>Destination: <b className="text-indigo-600">{driver.destination}</b></p>}
                          {driver.current_terminal && <p>Current: <b className="text-blue-600">{driver.current_terminal}</b></p>}
                        </div>
                      </div>
                    </div>
                  </OverlayView>
                </div>
              );
            })}
          </GoogleMap>
        </LoadScript>
      </div>
      <ToastContainer position="top-right" autoClose={5000} aria-label={undefined} />
    </div>
  );
}
