import { Outlet } from "react-router-dom";
import { MobileNav } from "../components/navigation/MobileNav";
import { DesktopSidebar } from "../components/navigation/DesktopSideBar";
import { useAuth } from "../hooks/useAuth";

export const AppLayout = () => {
  const isAuth = useAuth();

  return (
    <div className="min-h-screen flex">
      {isAuth && (
        <aside className="hidden md:block w-64 border-r">
          <DesktopSidebar />
        </aside>
      )}

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {isAuth && <MobileNav />}
    </div>
  );
};
