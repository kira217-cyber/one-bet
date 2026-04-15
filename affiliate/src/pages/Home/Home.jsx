import React, { useEffect } from "react";
import { useLocation } from "react-router";
import Hero from "../../components/Hero/Hero";
import Campaigns from "../../components/Campaigns/Campaigns";
import FAQ from "../../components/FAQ/FAQ";
import Commission from "../../components/Commission/Commission";
import CommissionStructure from "../../components/CommissionStructure/CommissionStructure";
import Jackpot from "../../components/Jackpot/Jackpot";
import JackpotStructure from "../../components/JackpotStructure/JackpotStructure";
import EliteClub from "../../components/EliteClub/EliteClub";
import HowToJoin from "../../components/HowToJoin/HowToJoin";
import AboutUs from "../../components/AboutUs/AboutUs";
import WhyUs from "../../components/WhyUs/WhyUs";
import Supports from "../../components/Supports/Supports";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div>
      <section id="home">
        <Hero />
      </section>

      <section id="campaigns">
        <Campaigns />
      </section>

      <section id="help-center">
        <FAQ />
      </section>

      <Commission />
      <CommissionStructure />
      <Jackpot />
      <JackpotStructure />
      <EliteClub />
      <HowToJoin />

      <section id="community">
        <AboutUs />
      </section>

      <WhyUs />

      <section id="contact">
        <Supports />
      </section>
    </div>
  );
};

export default Home;
