import React, { useEffect, useState } from "react";
import { api } from "../../api/axios";

const SocialLink = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/api/social-link");
      setItems(res.data.data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="absolute right-3 bottom-24 z-[999] flex flex-col gap-3">
      {items.map((item) => {
        const icon = item.iconUrl.startsWith("http")
          ? item.iconUrl
          : `${import.meta.env.VITE_APP_URL}${item.iconUrl}`;

        return (
          <a
            key={item._id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full"
          >
            <img src={icon} className="w-14 h-14 object-contain" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLink;
