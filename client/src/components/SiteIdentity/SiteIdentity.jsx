import { useEffect } from "react";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const SiteIdentity = () => {
  const { isBangla } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const setFavicon = (href) => {
      if (!href) return;

      let link =
        document.querySelector("link[rel='icon']") ||
        document.querySelector("link[rel='shortcut icon']");

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = href;
    };

    const fetchSiteIdentity = async () => {
      try {
        const res = await api.get("/api/site-identity");
        const data = res?.data?.data;

        if (!isMounted || !data) return;

        const title = isBangla
          ? data?.title?.bn || data?.title?.en
          : data?.title?.en || data?.title?.bn;

        if (title) {
          document.title = title;
        }

        if (data?.favicon) {
          const faviconUrl = data.favicon.startsWith("http")
            ? data.favicon
            : `${import.meta.env.VITE_APP_URL}${data.favicon}`;
          setFavicon(faviconUrl);
        }
      } catch (error) {
        console.error("Failed to fetch site identity:", error);
      }
    };

    fetchSiteIdentity();

    return () => {
      isMounted = false;
    };
  }, [isBangla]);

  return null;
};

export default SiteIdentity;
