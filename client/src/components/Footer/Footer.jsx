import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const Footer = () => {
  const { isBangla } = useLanguage();

  return (
    <div className="bg-[#063D2E] text-white px-4 py-6 text-sm">
      {/* 🔹 Payment Methods */}
      <div>
        <h2 className="text-yellow-400 font-semibold text-xl mb-3">
          {isBangla ? "পেমেন্ট পদ্ধতি" : "Payment Methods"}
        </h2>

        <div className="grid grid-cols-4 gap-4 items-center opacity-80">
          <img
            src="https://beit365.bet/assets/images/pay33.png?v=%271.01%27"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay22.png?v=%271.01%27"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay34.png?v=%271.01%27"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay45.png?v=%271.01%27"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay17.png"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay18.png"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay20.png"
            className="h-6"
          />
          <img
            src="https://beit365.bet/assets/images/pay47.png"
            className="h-6"
          />
        </div>
      </div>

      {/* 🔹 Responsible + Community */}
      <div className="grid grid-cols-2 mt-6 gap-6">
        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {isBangla ? "দায়িত্বশীল গেমিং" : "Responsible Gaming"}
          </h2>
          <div className="flex gap-4 opacity-80">
            <img
              src="https://beit365.bet/assets/images/gamcare.png"
              className="h-8"
            />
            <img
              src="https://beit365.bet/assets/images/age-limit.png"
              className="h-8"
            />
            <img
              src="https://beit365.bet/assets/images/regulations.png"
              className="h-8"
            />
          </div>
        </div>

        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {isBangla ? "কমিউনিটি ওয়েবসাইট" : "Community Websites"}
          </h2>
        </div>
      </div>

      {/* 🔹 Divider */}
      <div className="border-t border-white/20 my-6"></div>

      {/* 🔹 License + App */}
      <div className="grid grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {isBangla ? "গেমিং লাইসেন্স" : "Gaming License"}
          </h2>
          <img
            src="https://beit365.bet/assets/images/gaming_license.png"
            className="h-10 opacity-80"
          />
        </div>

        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {isBangla ? "অ্যাপ ডাউনলোড" : "APP Download"}
          </h2>
          <img
            src="https://beit365.bet/assets/desktop/footer/android-en.png"
            className="h-10"
          />
        </div>
      </div>

      {/* 🔹 Divider */}
      <div className="border-t border-white/20 my-6"></div>

      {/* 🔹 Description */}
      <div className="text-gray-300 leading-relaxed text-sm">
        <h3 className="font-semibold text-gray-200 mb-2">
          {isBangla
            ? "বাংলাদেশ, ভারত ও দক্ষিণ-পূর্ব এশিয়ার সেরা বেটিং এক্সচেঞ্জ সাইট"
            : "Top Betting Exchange Sites Bangladesh, India & South East Asia"}
        </h3>

        <p>
          {isBangla
            ? "বেটিং এক্সচেঞ্জ হলো একটি অনলাইন প্ল্যাটফর্ম যেখানে ব্যবহারকারীরা সরাসরি একে অপরের সাথে বাজি ধরতে পারে, কোনো বুকমেকার ছাড়াই। ক্রিকেট বেটিং সাধারণত দুইভাবে করা হয়।"
            : "A betting exchange is practically an online tool that is designed for gamblers to bet directly against each other and not involve any of the traditional bookmakers. Cricket Betting indicates two ways of betting in a cricket match."}
        </p>

        <p className="mt-2">
          {isBangla
            ? "অনলাইন বেটিং দক্ষিণ-পূর্ব এশিয়ায় দ্রুত জনপ্রিয় হয়ে উঠেছে, বিশেষ করে বাংলাদেশ ও ভারতে, যেখানে ব্যবহারকারীরা বিভিন্ন সাইট থেকে পছন্দ করতে পারে।"
            : "Online betting has developed as a booming industry in South East Asia especially in Bangladesh and India, where the bettors get to choose from an exciting range of Top Betting Exchange Sites."}
        </p>

        <p className="mt-2">
          {isBangla
            ? "আপনি যদি নিরাপদ ও নির্ভরযোগ্য ক্রিকেট বেটিং সাইট খুঁজে থাকেন, তাহলে আমাদের সাথে যোগ দিন। আমরা একটি বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম।"
            : "If you find this interesting and are in search of a reliable and safe Cricket Betting Sites Bangladesh and India, then you should enroll with us. We are a reputed online gambling site."}
        </p>
      </div>

      {/* 🔹 Divider */}
      <div className="border-t border-white/20 my-6"></div>

      {/* 🔹 Bottom */}
      <div className="flex justify-start gap-4 items-center">
        <div>
          <img
            src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
            alt=""
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-yellow-400">
            {isBangla ? "সেরা মানের প্ল্যাটফর্ম" : "The Best Quality Platform"}
          </h3>
          <p className="text-sm text-gray-300">
            {isBangla
              ? "©২০২৫ বেটিং এক্সচেঞ্জ অনলাইন গেমিং সাইট"
              : "@2025 Betting Exchange online gambling site."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
