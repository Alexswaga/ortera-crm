import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main id="crm-page-content">
        <Outlet />
      </main>
    </div>
  );
}