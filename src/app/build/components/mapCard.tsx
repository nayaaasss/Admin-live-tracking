"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";

export type DriverTrackingWS = {
  ID: number;
  UserID: string;
  Name: string;
  Lat: number;
  Lng: number;
  Status: string;
  ArrivalStatus: string;
  PortName: string;
  TerminalName: string;
  ZoneName: string;
  IsActive: boolean;
};

export type Zone = {
  id: number;
  type: string;
  name: string;
  category: "port" | "terminal" | "depo" | string;
  polygon?: number[][];
};

const containerStyle = { width: "100%", height: "650px" };
const defaultCenter = { lat: -6.1044, lng: 106.88 };

const zoneColor = (z: Zone) => {
  switch ((z.category || "").toLowerCase()) {
    case "port":
      return "#1E90FF";
    case "terminal":
      return "#32CD32";
    case "depo":
      return "#FF8C00";
    default:
      return "#999999";
  }
};

export default function MapCard() {
  const [drivers, setDrivers] = useState<DriverTrackingWS[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [animatedPositions, setAnimatedPositions] = useState<
    Record<string, { lat: number; lng: number }>
  >({});
  const lastPositionRef = useRef<Record<string, { lat: number; lng: number }>>({});

  const animateMovement = (
    key: string,
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ) => {
    const distance = Math.hypot(from.lat - to.lat, from.lng - to.lng);
    if (distance < 0.00001) {
      setAnimatedPositions((p) => ({ ...p, [key]: to }));
      return;
    }

    const frames = 30;
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / frames;

      const lat = from.lat + (to.lat - from.lat) * progress;
      const lng = from.lng + (to.lng - from.lng) * progress;

      setAnimatedPositions((prev) => ({
        ...prev,
        [key]: { lat, lng },
      }));

      if (frame < frames) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await fetch("http://localhost:8080/zones/custom");
        const json = await res.json();


        if (Array.isArray(json.data)) setZones(json.data);
        else if (Array.isArray(json)) setZones(json);
        else setZones([]);
      } catch (err) {
        console.error(err);
        setZones([]);
      }
    };
    loadZones();
  }, []);


  useEffect(() => {
    const connectWS = () => {
      socketRef.current = new WebSocket("ws://localhost:8080/ws");

      socketRef.current.onopen = () => console.log("WS CONNECTED");

      socketRef.current.onclose = () => {
        console.log("WS DISCONNECTED, RECONNECTING...");
        setTimeout(connectWS, 1500);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let arrayData: Record<string, unknown>[] = [];

          if (Array.isArray(data)) arrayData = data;
          else if (data?.data && Array.isArray(data.data)) arrayData = data.data;
          else arrayData = [data];

          const normalized = arrayData
            .filter((o): o is Record<string, unknown> => o !== null && typeof o === "object")
            .map((o) => ({
              ID: Number(o.ID ?? o.id ?? 0),
              UserID: String(o.UserID ?? o.userId ?? o.user_id ?? ""),
              Name: String(o.Name ?? o.name ?? ""),
              Lat: Number(o.Lat ?? o.lat ?? 0),
              Lng: Number(o.Lng ?? o.lng ?? 0),
              Status: String(o.Status ?? o.status ?? ""),
              ArrivalStatus: String(
                o.ArrivalStatus ?? o.arrivalStatus ?? o.arrival_status ?? ""
              ),
              PortName: String(o.PortName ?? o.portName ?? o.port_name ?? ""),
              TerminalName: String(
                o.TerminalName ?? o.terminalName ?? o.terminal_name ?? ""
              ),
              ZoneName: String(o.ZoneName ?? o.zoneName ?? o.zone_name ?? ""),
              IsActive: Boolean(o.IsActive ?? o.isActive ?? o.is_active ?? true),
            }))
            .filter((d) => d.IsActive && d.Lat !== 0 && d.Lng !== 0)


          setDrivers(normalized);

          normalized.forEach((driver) => {
            const key = `${driver.ID}-${driver.UserID}`;
            const oldPos = lastPositionRef.current[key] || {
              lat: driver.Lat,
              lng: driver.Lng,
            };
            const newPos = { lat: driver.Lat, lng: driver.Lng };
            lastPositionRef.current[key] = newPos;
            animateMovement(key, oldPos, newPos);
          });
        } catch (err) {
          console.error(err);
        }
      };
    };

    connectWS();
    return () => socketRef.current?.close();
  }, []);

  if (!isLoaded)
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        Loading map...
      </div>
    );

  return (
    <div className="rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={14}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {zones.map((zone) =>
          zone.polygon ? (
            <Polygon
              key={zone.id}
              paths={zone.polygon.map((p) => ({ lat: p[1], lng: p[0] }))}
              options={{
                strokeColor: zoneColor(zone),
                strokeWeight: 2,
                fillColor: zoneColor(zone),
                fillOpacity: 0.2,
              }}
            />
          ) : null
        )}

        {drivers.map((driver) => {
          const pos =
            animatedPositions[`${driver.ID}-${driver.UserID}`] || {
              lat: driver.Lat,
              lng: driver.Lng,
            };

          return (
            <div key={`wrap-${driver.ID}-${driver.UserID}`} style={{ display: "contents" }}>
              <Marker
                key={`marker-${driver.ID}-${driver.UserID}`}
                position={pos}
                icon={{
                  url: "/car.png",
                  scaledSize: new google.maps.Size(38, 38),
                  anchor: new google.maps.Point(19, 19),
                }}
              />

              <OverlayView
                key={`overlay-${driver.ID}-${driver.UserID}`}
                position={pos}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative flex flex-col items-center group">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold shadow-md mb-1 border border-gray-200">
                    {driver.Name}
                  </div>

                  <div
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[230px]
                    bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl 
                    shadow-xl p-4 text-xs opacity-0 group-hover:opacity-100 
                    transition-all duration-200 pointer-events-none z-20"
                  >
                    <div className="font-bold text-gray-900 text-sm mb-2 truncate">
                      {driver.Name}
                    </div>

                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${driver.ArrivalStatus === "ontime"
                          ? "bg-green-100 text-green-700"
                          : driver.ArrivalStatus === "early"
                            ? "bg-blue-100 text-blue-700"
                            : driver.ArrivalStatus === "late"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {driver.Status}
                      </span>

                    </div>

                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Arrival</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${driver.ArrivalStatus === "ontime"
                          ? "bg-green-100 text-green-700"
                          : driver.ArrivalStatus === "late"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {driver.ArrivalStatus}
                      </span>
                    </div>

                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Port</span>
                      <span className="text-indigo-600 font-semibold">
                        {driver.TerminalName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Terminal</span>
                      <span className="text-blue-600 font-semibold">
                        {driver.PortName}
                      </span>
                    </div>

                    {driver.ZoneName && (
                      <div className="mt-2 text-xs text-red-600 font-semibold truncate">
                        Inside: {driver.ZoneName}
                      </div>
                    )}
                  </div>
                </div>
              </OverlayView>
            </div>
          );
        })}
      </GoogleMap>
    </div>
  );
}
