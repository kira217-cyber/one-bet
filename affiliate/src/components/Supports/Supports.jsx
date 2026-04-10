import React from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Supports = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "আমরা আপনার জন্য আছি।",
        subtitle:
          "আমাদের ডেডিকেটেড টিম আপনাকে সহায়তা করতে প্রস্তুত। আপনার সন্তুষ্টিই আমাদের অগ্রাধিকার, এবং আমরা আপনার কাছ থেকে শুনতে আগ্রহী। নির্ভরযোগ্য ও সহজ যোগাযোগের জন্য আজই আমাদের সাথে যোগাযোগ করুন।",
        openText:
          "আমরা সপ্তাহে সাত দিন সকাল ৮:৩০ থেকে বিকাল ৫:৩০ পর্যন্ত খোলা থাকি (GMT +5:30)",
        liveChat: "লাইভ চ্যাট",
        note: "*এই ফিচারটি ব্যবহার করতে আপনার অ্যাকাউন্টে লগইন করুন।",
        message: "Message us Now",
        channels: [
          {
            id: 1,
            name: "Telegram",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/telegram.svg",
            link: "#",
          },
          {
            id: 2,
            name: "WhatsApp",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/watsap.svg",
            link: "#",
          },
          {
            id: 3,
            name: "Skype",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/skype.svg",
            link: "#",
          },
          {
            id: 4,
            name: "Gmail",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/gmail.svg",
            link: "#",
          },
          {
            id: 5,
            name: "IMO",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/kakao.svg",
            link: "#",
          },
        ],
      }
    : {
        title: "We are here for you.",
        subtitle:
          "Get in touch with us and let our dedicated team assist you. Your satisfaction is our priority, and we look forward to hearing from you. Contact us today for a seamless and reliable interaction.",
        openText:
          "We are open seven days a week from 8:30 AM to 5:30 PM (GMT +5:30)",
        liveChat: "Live Chat",
        note: "*Note Login to your account to use this feature.",
        message: "Message us Now",
        channels: [
          {
            id: 1,
            name: "Telegram",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/telegram.svg",
            link: "#",
          },
          {
            id: 2,
            name: "WhatsApp",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/watsap.svg",
            link: "#",
          },
          {
            id: 3,
            name: "Skype",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/skype.svg",
            link: "#",
          },
          {
            id: 4,
            name: "Gmail",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/gmail.svg",
            link: "#",
          },
          {
            id: 5,
            name: "IMO",
            label: "beit365.bet Affiliates",
            icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/kakao.svg",
            link: "#",
          },
        ],
      };

  return (
    <section className="relative w-full overflow-hidden text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/affiliate/assets/bdt/live-chat.webp')",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_0.95fr] lg:gap-12">
          {/* Left Section */}
          <div className="flex flex-col justify-center pt-2 lg:min-h-[520px]">
            <div className="max-w-[860px]">
              <h2 className="text-[34px] sm:text-[52px] lg:text-[62px] font-bold leading-[1.05] tracking-[-0.03em] text-white">
                {content.title}
              </h2>

              <p className="mt-5 max-w-[980px] text-[16px] sm:text-[22px] lg:text-[17px] font-medium leading-[1.6] text-white/60">
                {content.subtitle}
              </p>

              <h3 className="mt-10 max-w-[920px] text-[28px] sm:text-[46px] lg:text-[58px] font-medium leading-[1.18] tracking-[-0.03em] text-white">
                {content.openText}
              </h3>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <NavLink
                  to="/login"
                  className="inline-flex h-[54px] sm:h-[60px] min-w-[180px] sm:min-w-[195px] items-center justify-center rounded-full bg-white px-8 text-[18px] sm:text-[22px] lg:text-[17px] font-bold text-black transition hover:bg-white/90"
                >
                  {content.liveChat}
                </NavLink>

                <p className="text-[13px] sm:text-[16px] lg:text-[14px] font-semibold leading-[1.45] text-white">
                  {content.note}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-4 lg:pt-2">
            {content.channels.map((item) => (
              <div
                key={item.id}
                className="rounded-[16px] bg-black/70 px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.18)] backdrop-blur-[1px] sm:px-5 sm:py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="h-[42px] w-[42px] sm:h-[46px] sm:w-[46px] object-contain shrink-0"
                    />

                    <div>
                      <p className="text-[15px] sm:text-[16px] lg:text-[14px] font-semibold text-white">
                        {item.label}
                      </p>
                      <h4 className="text-[28px] sm:text-[30px] lg:text-[20px] font-bold leading-none text-white">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  <NavLink
                    to={item.link}
                    className="inline-flex h-[46px] sm:h-[50px] min-w-[175px] sm:min-w-[185px] items-center justify-center rounded-full border-2 border-white bg-transparent px-6 text-[14px] sm:text-[15px] lg:text-[14px] font-bold text-white transition hover:bg-white hover:text-black"
                  >
                    {content.message}
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Supports;
