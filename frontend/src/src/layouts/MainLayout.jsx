import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
