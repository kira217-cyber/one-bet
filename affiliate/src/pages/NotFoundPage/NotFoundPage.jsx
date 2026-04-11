import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleNavigate = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#06110b] via-[#0b1f14] to-[#041008] flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="absolute top-[-80px] left-[-80px] h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-80px] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-green-500/20 bg-white/5 p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400" />

        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-7xl sm:text-8xl font-extrabold text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.35)]"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-4 text-2xl sm:text-3xl font-bold text-white"
        >
          Not Found Page
        </motion.h2>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8"
        >
          <button
            onClick={handleNavigate}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-bold text-black shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:from-green-400 hover:to-emerald-400"
          >
            <Home size={18} />
            Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
