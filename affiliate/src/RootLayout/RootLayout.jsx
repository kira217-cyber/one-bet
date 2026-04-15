import React from "react";
import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import AffSiteIdentity from "../components/AffSiteIdentity/AffSiteIdentity";
import AffSocialLink from "../components/AffSocialLink/AffSocialLink";

const RootLayout = () => {
  return (
    <div>
      <AffSiteIdentity />
      <AffSocialLink />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
