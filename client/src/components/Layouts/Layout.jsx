import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="admin-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
