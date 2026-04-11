// import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import Categories from "../../components/Categories/Categories";
import FavouriteGames from "../../components/FavouriteGames/FavouriteGames";
import FeatureGames from "../../components/FeatureGames/FeatureGames";
import Footer from "../../components/Footer/Footer";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Sports from "../../components/Sports/Sports";

const Home = () => {
  return (
    <div>
      <Slider />
      <Notice />
      <Categories />
      <FeatureGames />
      <FavouriteGames />
      <Footer />
      
    </div>
  );
};

export default Home;
