import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Home,
  User as UserIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ProfileMenu = ({ mode = "header" }) => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const raw =
      localStorage.getItem("rm_user") || sessionStorage.getItem("rm_user");

    try {
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rm_token");
    localStorage.removeItem("rm_user");
    sessionStorage.removeItem("rm_token");
    sessionStorage.removeItem("rm_user");
    navigate("/login");
  };

  const isAdminUser =
    user?.role && user.role.toLowerCase() === "admin";
  const onAdminPage = location.pathname.startsWith("/admin");

  if (!user && mode === "header") {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-900"
      >
        <UserIcon size={20} />
        <span>Masuk/Daftar</span>
      </Link>
    );
  }

  if (!user) return null;

  const displayName = user.name || "My Profile";
  const avatarLetter = (user.name || "U").charAt(0).toUpperCase();

  const buttonClass =
    mode === "admin"
      ? "flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
      : "flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition";

  const dropdownClass =
    mode === "admin"
      ? "absolute right-0 mt-2 w-44 rounded-xl bg-[#0E3A7E]/95 border border-white/10 backdrop-blur-xl shadow-lg overflow-hidden z-50 text-white"
      : "absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden z-50 text-slate-800";

  const itemClass =
    mode === "admin"
      ? "w-full flex items-center gap-2 px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition"
      : "w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-100 transition";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            mode === "admin" ? "bg-white/20" : "bg-white/10"
          }`}
        >
          {avatarLetter}
        </span>
        <span className="text-sm font-semibold truncate max-w-[140px]">
          {displayName}
        </span>
        <ChevronDown
          size={16}
          className={`opacity-80 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className={dropdownClass}>
          {isAdminUser && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (onAdminPage) {
                  navigate("/");
                } else {
                  navigate("/admin");
                }
              }}
              className={itemClass}
            >
              {onAdminPage ? <Home size={16} /> : <LayoutDashboard size={16} />}
              <span>
                {onAdminPage ? "Ke Beranda User" : "Ke Dashboard Admin"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={itemClass}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
