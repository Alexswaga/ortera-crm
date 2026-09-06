import React from "react";
import { Outlet } from "react-router-dom";
import PartnerHeader from "../components/PartnerHeader";

export default function PartnerLayout() {
  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <PartnerHeader />
      <main id="crm-page-content">
        <Outlet />
      </main>
    </div>
  );
}