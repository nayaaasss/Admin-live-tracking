export interface Booking {
  id: number;
  user_id: number;
  port_name: string;
  terminal_name: string;
  container_no: string;
  container_type: string;
  container_size: string;
  container_status: string;
  gate_in_plan: string;
  shift_in_plan: string;
  iso_code: string;
  stid?: string;
  is_active?: boolean;
  arrival_status?: string;
}

export interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const active = booking.is_active;

  return (
    <div
      className={`p-4 rounded-xl border shadow transition-all ${
        active
          ? "border-green-400 bg-green-50"
          : "border-gray-300 bg-gray-100"
      }`}
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg">{booking.container_no}</h3>

        <span
          className={`px-3 py-1 text-xs rounded-full ${
            active ? "bg-green-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {active ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <p className="text-sm text-gray-700">
        <strong>Shift:</strong> {booking.shift_in_plan}
      </p>

      <p className="text-sm text-gray-700">
        <strong>Status Kedatangan:</strong>{" "}
        {booking.arrival_status || "Unknown"}
      </p>

      <p className="text-sm text-gray-700">
        <strong>Terminal:</strong> {booking.terminal_name}
      </p>

      <p className="text-sm text-gray-700">
        <strong>Container:</strong> {booking.container_status} /{" "}
        {booking.container_type} / {booking.container_size}
      </p>
    </div>
  );
}
