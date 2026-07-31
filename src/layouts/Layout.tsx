import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import ErrorBoundary from "../components/ErrorBoundary.tsx";

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
