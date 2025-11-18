import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-4">
      <div className="flex items-center gap-2">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search or type command..."
          className="outline-none text-sm bg-transparent"
        />
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500 cursor-pointer" />
        <img
          src="https://i.pravatar.cc/40"
          alt="Admin"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
}
