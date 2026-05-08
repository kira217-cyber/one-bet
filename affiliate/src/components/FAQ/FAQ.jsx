import React, { useEffect, useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const defaultData = {
  isActive: true,
  tabs: [
    {
      id: "general",
      tabKey: "general",
      label: {
        bn: "General",
        en: "General",
      },
      items: [
        {
          question: {
            bn: "আমরা কারা?",
            en: "Who are we?",
          },
          answer: {
            bn: "beit365.bet ২০২০ সালে প্রতিষ্ঠিত একটি শীর্ষমানের অনলাইন গেমিং ও অ্যাফিলিয়েট প্ল্যাটফর্ম। আমরা ক্রিকেট, ফুটবল, টেনিস, লাইভ ক্যাসিনো, টেবিল গেমস এবং স্লটভিত্তিক প্রচারণা ও পার্টনারশিপ সিস্টেম নিয়ে কাজ করি।",
            en: "Founded in 2020, beit365.bet is a top-tier online gaming and affiliate platform in Asia. We focus on betting exchange, live casino, table games, slots, and strong affiliate growth opportunities.",
          },
          order: 1,
          isActive: true,
        },
      ],
      order: 1,
      isActive: true,
    },
  ],
};

const FAQ = () => {
  const { isBangla } = useLanguage();

  const [faqData, setFaqData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("");
  const [openItem, setOpenItem] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchFaqContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-faq-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const tabs = Array.isArray(data.data.tabs) ? data.data.tabs : [];

          setFaqData({
            isActive: data.data.isActive !== false,
            tabs,
          });

          const firstTab = tabs?.[0];
          const firstTabId = firstTab?._id || firstTab?.tabKey || "";

          setActiveTab(firstTabId);
          setOpenItem(firstTabId ? `${firstTabId}-0` : "");
        } else {
          setFaqData(defaultData);
          setActiveTab("general");
          setOpenItem("general-0");
        }
      } catch (error) {
        console.error("Failed to fetch FAQ content:", error);

        setFaqData(defaultData);
        setActiveTab("general");
        setOpenItem("general-0");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFaqContent();

    return () => {
      mounted = false;
    };
  }, []);

  const faqContent = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const tabs = (faqData.tabs || [])
      .filter((tab) => tab?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((tab, tabIndex) => {
        const tabId = tab?._id || tab?.tabKey || `tab-${tabIndex}`;

        return {
          id: tabId,
          tabKey: tab?.tabKey || tabId,
          label:
            tab?.label?.[lang] || tab?.label?.en || tab?.label?.bn || "FAQ",

          items: (tab?.items || [])
            .filter((item) => item?.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
            .map((item, itemIndex) => ({
              id: item?._id || `${tabId}-${itemIndex}`,
              question:
                item?.question?.[lang] ||
                item?.question?.en ||
                item?.question?.bn ||
                "",
              answer:
                item?.answer?.[lang] ||
                item?.answer?.en ||
                item?.answer?.bn ||
                "",
            })),
        };
      });

    return { tabs };
  }, [faqData, isBangla]);

  useEffect(() => {
    if (!faqContent.tabs.length) return;

    const exists = faqContent.tabs.some((tab) => tab.id === activeTab);

    if (!activeTab || !exists) {
      const firstTabId = faqContent.tabs[0].id;
      setActiveTab(firstTabId);
      setOpenItem(`${firstTabId}-0`);
    }
  }, [faqContent.tabs, activeTab]);

  const activeTabData =
    faqContent.tabs.find((tab) => tab.id === activeTab) || faqContent.tabs[0];

  const handleToggle = (key) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-8 text-white lg:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-10">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-28 animate-pulse rounded-lg bg-white/10"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[14px] bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (faqData?.isActive === false || !faqContent.tabs.length) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-8 text-white lg:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:mb-10 lg:mb-12">
          {faqContent.tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setOpenItem(`${tab.id}-0`);
                }}
                className={`inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] border px-4 text-[13px] font-semibold transition sm:px-5 sm:text-[15px] ${
                  isActive
                    ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                    : "border-[#475569] bg-transparent text-[#cbd5e1] hover:border-[#64748b] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-5">
          {(activeTabData?.items || []).map((item, index) => {
            const itemKey = `${activeTab}-${index}`;
            const isOpen = openItem === itemKey;

            return (
              <div
                key={item.id || itemKey}
                className="overflow-hidden rounded-[14px] border border-[#00d0c7] bg-[#011926]"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(itemKey)}
                  className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-5 text-left sm:px-5 sm:py-5"
                >
                  <span className="pr-2 text-[20px] font-semibold leading-[1.45] text-[#c7d2fe] sm:text-[24px] lg:text-[18px]">
                    {item.question}
                  </span>

                  <span className="mt-0.5 shrink-0 text-[#c7d2fe] transition-transform duration-300">
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5">
                      <p className="max-w-[95%] text-[16px] leading-[1.7] text-[#cbd5e1] sm:text-[17px] lg:text-[14px]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!activeTabData?.items?.length && (
            <div className="col-span-full rounded-[14px] border border-[#00d0c7]/40 bg-[#011926] p-6 text-center text-[#cbd5e1]">
              {isBangla ? "কোনো FAQ পাওয়া যায়নি" : "No FAQ found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
