import { Outlet } from "react-router-dom";
import  Sidebar  from "../pages/Sidebar";
import { Footer } from "../components/Footer";

export const MainLayout = ({ theme, cambiarTema }) => {
  return (
    <div className="app" data-theme={theme}>
      <Sidebar
        theme={theme}
        cambiarTema={cambiarTema}
      />

      <div className="layout-content">
        <main className="main">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};