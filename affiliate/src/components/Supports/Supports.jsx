import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const API_URL = import.meta.env.VITE_APP_URL;

const getImageUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const fallbackContent = {
  title: {
    bn: "আমরা আপনার জন্য আছি।",
    en: "We are here for you.",
  },
  subtitle: {
    bn: "আমাদের ডেডিকেটেড টিম আপনাকে সহায়তা করতে প্রস্তুত। আপনার সন্তুষ্টিই আমাদের অগ্রাধিকার, এবং আমরা আপনার কাছ থেকে শুনতে আগ্রহী। নির্ভরযোগ্য ও সহজ যোগাযোগের জন্য আজই আমাদের সাথে যোগাযোগ করুন।",
    en: "Get in touch with us and let our dedicated team assist you. Your satisfaction is our priority, and we look forward to hearing from you. Contact us today for a seamless and reliable interaction.",
  },
  openText: {
    bn: "আমরা সপ্তাহে সাত দিন সকাল ৮:৩০ থেকে বিকাল ৫:৩০ পর্যন্ত খোলা থাকি (GMT +5:30)",
    en: "We are open seven days a week from 8:30 AM to 5:30 PM (GMT +5:30)",
  },
  liveChatText: {
    bn: "লাইভ চ্যাট",
    en: "Live Chat",
  },
  noteText: {
    bn: "*এই ফিচারটি ব্যবহার করতে আপনার অ্যাকাউন্টে লগইন করুন।",
    en: "*Note Login to your account to use this feature.",
  },
  messageButtonText: {
    bn: "Message us Now",
    en: "Message us Now",
  },
  backgroundImage:
    "https://beit365.bet/assets/affiliate/assets/bdt/live-chat.webp",
  isActive: true,
  channels: [
    {
      _id: "telegram",
      name: "Telegram",
      label: {
        bn: "beit365.bet Affiliates",
        en: "beit365.bet Affiliates",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/telegram.svg",
      link: "#",
      order: 1,
      isActive: true,
    },
    {
      _id: "whatsapp",
      name: "WhatsApp",
      label: {
        bn: "beit365.bet Affiliates",
        en: "beit365.bet Affiliates",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/watsap.svg",
      link: "#",
      order: 2,
      isActive: true,
    },
    {
      _id: "skype",
      name: "Skype",
      label: {
        bn: "beit365.bet Affiliates",
        en: "beit365.bet Affiliates",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/skype.svg",
      link: "#",
      order: 3,
      isActive: true,
    },
    {
      _id: "gmail",
      name: "Gmail",
      label: {
        bn: "beit365.bet Affiliates",
        en: "beit365.bet Affiliates",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/gmail.svg",
      link: "#",
      order: 4,
      isActive: true,
    },
    {
      _id: "imo",
      name: "IMO",
      label: {
        bn: "beit365.bet Affiliates",
        en: "beit365.bet Affiliates",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/bdt/icons/kakao.svg",
      link: "#",
      order: 5,
      isActive: true,
    },
  ],
};

const getText = (obj, lang, fallback = "") => {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.bn || fallback;
};

const Supports = () => {
  const { isBangla } = useLanguage();
  const lang = isBangla ? "bn" : "en";

  const [data, setData] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchSupportContent = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/aff-support-content`);
        const json = await res.json();

        if (!ignore && json?.success && json?.data) {
          setData({
            ...fallbackContent,
            ...json.data,
            title: {
              ...fallbackContent.title,
              ...(json.data.title || {}),
            },
            subtitle: {
              ...fallbackContent.subtitle,
              ...(json.data.subtitle || {}),
            },
            openText: {
              ...fallbackContent.openText,
              ...(json.data.openText || {}),
            },
            liveChatText: {
              ...fallbackContent.liveChatText,
              ...(json.data.liveChatText || {}),
            },
            noteText: {
              ...fallbackContent.noteText,
              ...(json.data.noteText || {}),
            },
            messageButtonText: {
              ...fallbackContent.messageButtonText,
              ...(json.data.messageButtonText || {}),
            },
            channels: Array.isArray(json.data.channels)
              ? json.data.channels
              : fallbackContent.channels,
          });
        }
      } catch (error) {
        console.error("Failed to fetch support content:", error);
        if (!ignore) setData(fallbackContent);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchSupportContent();

    return () => {
      ignore = true;
    };
  }, []);

  const channels = useMemo(() => {
    return [...(data.channels || [])]
      .filter((item) => item?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [data.channels]);

  if (data?.isActive === false) return null;

  const backgroundImage = getImageUrl(data.backgroundImage);
  const title = getText(data.title, lang, fallbackContent.title[lang]);
  const subtitle = getText(data.subtitle, lang, fallbackContent.subtitle[lang]);
  const openText = getText(data.openText, lang, fallbackContent.openText[lang]);
  const liveChat = getText(
    data.liveChatText,
    lang,
    fallbackContent.liveChatText[lang],
  );
  const note = getText(data.noteText, lang, fallbackContent.noteText[lang]);
  const message = getText(
    data.messageButtonText,
    lang,
    fallbackContent.messageButtonText[lang],
  );

  return (
    <section className="relative w-full overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : "",
        }}
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {loading ? (
          <div className="grid min-h-[520px] grid-cols-1 gap-8 lg:grid-cols-[1.55fr_0.95fr] lg:gap-12">
            <div className="flex flex-col justify-center space-y-5">
              <div className="h-16 max-w-[600px] animate-pulse rounded-2xl bg-white/10" />
              <div className="h-24 max-w-[850px] animate-pulse rounded-2xl bg-white/10" />
              <div className="h-28 max-w-[760px] animate-pulse rounded-2xl bg-white/10" />
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-[88px] animate-pulse rounded-[16px] bg-black/60"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_0.95fr] lg:gap-12">
            <div className="flex flex-col justify-center pt-2 lg:min-h-[520px]">
              <div className="max-w-[860px]">
                <h2 className="text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px] lg:text-[62px]">
                  {title}
                </h2>

                <p className="mt-5 max-w-[980px] text-[16px] font-medium leading-[1.6] text-white/60 sm:text-[22px] lg:text-[17px]">
                  {subtitle}
                </p>

                <h3 className="mt-10 max-w-[920px] text-[28px] font-medium leading-[1.18] tracking-[-0.03em] text-white sm:text-[46px] lg:text-[58px]">
                  {openText}
                </h3>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <NavLink
                    to="/login"
                    className="inline-flex h-[54px] min-w-[180px] cursor-pointer items-center justify-center rounded-full bg-white px-8 text-[18px] font-bold text-black transition hover:bg-white/90 sm:h-[60px] sm:min-w-[195px] sm:text-[22px] lg:text-[17px]"
                  >
                    {liveChat}
                  </NavLink>

                  <p className="text-[13px] font-semibold leading-[1.45] text-white sm:text-[16px] lg:text-[14px]">
                    {note}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:pt-2">
              {channels.map((item) => {
                const icon = getImageUrl(item.icon);
                const label = getText(item.label, lang, item.name || "");
                const link = item.link || "#";
                const isExternal =
                  /^https?:\/\//i.test(link) ||
                  link.startsWith("mailto:") ||
                  link.startsWith("tel:");

                return (
                  <div
                    key={item._id || item.name}
                    className="rounded-[16px] bg-black/70 px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.18)] backdrop-blur-[1px] sm:px-5 sm:py-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {icon ? (
                          <img
                            src={icon}
                            alt={item.name || "Support"}
                            className="h-[42px] w-[42px] shrink-0 object-contain sm:h-[46px] sm:w-[46px]"
                          />
                        ) : (
                          <div className="h-[42px] w-[42px] shrink-0 rounded-full bg-white/10 sm:h-[46px] sm:w-[46px]" />
                        )}

                        <div>
                          <p className="text-[15px] font-semibold text-white sm:text-[16px] lg:text-[14px]">
                            {label}
                          </p>

                          <h4 className="text-[28px] font-bold leading-none text-white sm:text-[30px] lg:text-[20px]">
                            {item.name}
                          </h4>
                        </div>
                      </div>

                      {isExternal ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-[46px] min-w-[175px] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-transparent px-6 text-[14px] font-bold text-white transition hover:bg-white hover:text-black sm:h-[50px] sm:min-w-[185px] sm:text-[15px] lg:text-[14px]"
                        >
                          {message}
                        </a>
                      ) : (
                        <NavLink
                          to={link}
                          className="inline-flex h-[46px] min-w-[175px] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-transparent px-6 text-[14px] font-bold text-white transition hover:bg-white hover:text-black sm:h-[50px] sm:min-w-[185px] sm:text-[15px] lg:text-[14px]"
                        >
                          {message}
                        </NavLink>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Supports;
