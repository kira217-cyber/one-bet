import React from "react";
import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";

const RootLayout = () => {
  return (
    <div>
      <Navbar />
      {/* <FloatingSocial /> */}
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
