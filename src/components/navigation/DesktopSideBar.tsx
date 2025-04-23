import { useUser } from "../../hooks/useUser"; // o la ruta correcta
import { Home, LayoutGrid, BarChart2, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/transactions", icon: BarChart2, label: "Movimientos" },
  { href: "/budgets", icon: LayoutGrid, label: "Presupuestos" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export const DesktopSidebar = () => {
  const user = useUser();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600">Koink</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors 
              ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
            }
          >
            {href === "/profile" && user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <Icon className="h-5 w-5" />
            )}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
