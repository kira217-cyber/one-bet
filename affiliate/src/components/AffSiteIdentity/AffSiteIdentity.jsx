import { useEffect } from "react";
import { api } from "../../api/axios";


const AffSiteIdentity = () => {
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

    const fetchAffSiteIdentity = async () => {
      try {
        const res = await api.get("/api/aff-site-identity");
        const data = res?.data?.data;

        if (!isMounted || !data) return;

        const title = data?.title?.en || data?.title?.bn;
        if (title) {
          document.title = title;
        }

        if (data?.favicon) {
          const faviconUrl = data.favicon.startsWith("http")
            ? data.favicon
            : `${import.meta.env.VITE_APP_URL}${data.favicon}`;

          setFavicon(faviconUrl);
        }

        if (data?.logo) {
          const logoUrl = data.logo.startsWith("http")
            ? data.logo
            : `${import.meta.env.VITE_APP_URL}${data.logo}`;

          const img = new Image();
          img.src = logoUrl;
        }
      } catch (error) {
        console.error("Failed to fetch affiliate site identity:", error);
      }
    };

    fetchAffSiteIdentity();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default AffSiteIdentity;
