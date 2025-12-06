import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, User, Search, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const raw =
      localStorage.getItem("rm_user") || sessionStorage.getItem("rm_user");

    try {
      setUserData(raw ? JSON.parse(raw) : null);
    } catch {
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rm_token");
    localStorage.removeItem("rm_user");
    sessionStorage.removeItem("rm_token");
    sessionStorage.removeItem("rm_user");

    setUserData(null);
    setProfileOpen(false);

    navigate("/login");
  };

  const displayName = userData?.name || "My Profile";
  const avatarLetter = (userData?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white">
      <h1 className="text-2xl font-bold">RaniaMart</h1>

      <div className="flex items-center w-1/2 relative">
        <input
          type="text"
          placeholder="Search Bar"
          className="w-full border rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring"
        />
        <Search className="absolute left-3 text-gray-400" size={20} />
      </div>

      <div className="flex gap-6 items-center">
        {!userData ? (
          <Link to="/login" className="flex items-center gap-1">
            <User size={20} />
            <span className="font-medium">Masuk/Daftar</span>
          </Link>
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-full border bg-white hover:bg-gray-50 transition"
            >
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                {avatarLetter}
              </span>
              <span className="font-medium">{displayName}</span>
              <ChevronDown
                size={16}
                className={`transition ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border shadow-lg overflow-hidden z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* CART */}
        <button className="flex items-center gap-2">
          <ShoppingCart size={22} />
          <span className="font-medium">Cart</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
