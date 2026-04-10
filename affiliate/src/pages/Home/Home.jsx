import React from "react";
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
  return (
    <div>
      <Hero />
      <Campaigns />
      <FAQ />
      <Commission />
      <CommissionStructure />
      <Jackpot />
      <JackpotStructure />
      <EliteClub />
      <HowToJoin />
      <AboutUs />
      <WhyUs />
      <Supports />
      
    </div>
  );
};

export default Home;
