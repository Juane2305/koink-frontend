import { Home, LayoutGrid, BarChart2, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/transactions", icon: BarChart2, label: "Movimientos" },
  { href: "/budgets", icon: LayoutGrid, label: "Presupuestos" },
  { href: "/profile", icon: User, label: "" },
];

export const MobileNav = () => {

  const user = useUser();

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-white border-t border-gray-200 shadow-inner md:hidden">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <NavLink
              to={href}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 
                ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`
              }
            >
              {href === "/profile" && user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <Icon className="h-5 w-5" />
            )}
            {label}
          </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
