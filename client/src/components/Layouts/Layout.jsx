import React from "react";
import { Outlet } from "react-router-dom";
import VerticalBar from "../common/VerticalBar/VerticalBar";

const Layout = () => {
  return (
    <div className="layout">
      <VerticalBar />

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
