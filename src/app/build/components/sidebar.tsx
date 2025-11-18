import { usePathname } from "next/navigation";
import Link from "next/link";
import { Gauge, BarChart3} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Gauge size={18} /> },
    { name: "Reports", href: "/admin/reports", icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside className="w-64 h-250 bg-white shadow-md p-4">
      <h1 className="text-2xl font-bold mb-8">TBS</h1>

      <nav className="space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-800 hover:bg-blue-500 hover:text-white"}
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
