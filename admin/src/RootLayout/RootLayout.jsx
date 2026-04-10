import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import Sidebar from "../components/Sidebar/Sidebar";

const RootLayout = () => {
  return (
    <div>
      {/* <Navber /> */}
      <Sidebar />
      {/* <FloatingSocial /> */}
      {/* <Outlet /> */}
      {/* <Footer /> */}
    </div>
  );
};

export default RootLayout;
