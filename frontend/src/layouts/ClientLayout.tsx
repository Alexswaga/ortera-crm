import React from "react";
import { Outlet } from "react-router-dom";
import ClientHeader from "../components/ClientHeader";

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <ClientHeader />
      <main id="crm-page-content">
        <Outlet />
      </main>
    </div>
  );
}