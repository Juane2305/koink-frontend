import { Outlet } from "react-router-dom";
import { MobileNav } from "../components/navigation/MobileNav";
import { DesktopSidebar } from "../components/navigation/DesktopSideBar";
import { useAuth } from "../hooks/useAuth";

export const AppLayout = () => {
  const { user } = useAuth(); // Asumo que useAuth devuelve un objeto con user

  return (
    // Agregamos bg-slate-50 (un gris muy clarito y elegante)
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {user && (
        <aside className="hidden md:block w-64 border-r bg-white">
          <DesktopSidebar />
        </aside>
      )}

      {/* Main content: le damos un fondo blanco o transparente sobre el gris */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>

      {user && <MobileNav />}
    </div>
  );
};