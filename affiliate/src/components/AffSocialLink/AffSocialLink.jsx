import React, { useEffect, useState } from "react";
import { api } from "../../api/axios";

const AffSocialLink = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchAffSocialLinks = async () => {
      try {
        const res = await api.get("/api/aff-social-link");
        setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to fetch affiliate social links:", error);
        setItems([]);
      }
    };

    fetchAffSocialLinks();
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed right-4 md:right-18 bottom-8 md:bottom-22 z-[999] flex flex-col gap-3">
      {items.map((item) => {
        const iconSrc = item?.iconUrl
          ? item.iconUrl.startsWith("http")
            ? item.iconUrl
            : `${import.meta.env.VITE_APP_URL}${item.iconUrl}`
          : "";

        if (!item?.url || !iconSrc) return null;

        return (
          <a
            key={item._id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Affiliate Social Link"
            className="group flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full"
          >
            <img
              src={iconSrc}
              alt="affiliate-social-icon"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
            />
            <span className="sr-only">Affiliate Social Link</span>
          </a>
        );
      })}
    </div>
  );
};

export default AffSocialLink;
