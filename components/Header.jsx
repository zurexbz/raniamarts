import React, { useEffect, useRef, useState, useMemo } from "react";
import { ShoppingCart, User, Search, ChevronDown, LogOut, LayoutDashboard, Home as HomeIcon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE_URL = "http://localhost:8080/api/v1";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartQty, refreshCart, clearCartState } = useCart();

  const [userData, setUserData] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const raw =
      localStorage.getItem("rm_user") || sessionStorage.getItem("rm_user");

    if (!raw) {
      setUserData(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setUserData(parsed);
    } catch (err) {
      console.error("Gagal parse rm_user:", err);
      setUserData(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (userData) refreshCart();
    else clearCartState();
  }, [userData, refreshCart, clearCartState]);

  const handleLogout = () => {
    localStorage.removeItem("rm_user");
    sessionStorage.removeItem("rm_user");
    localStorage.removeItem("rm_token");
    sessionStorage.removeItem("rm_token");

    setUserData(null);
    setProfileOpen(false);
    clearCartState();
    navigate("/login");
  };

  const isAdmin = userData?.role === "admin";

  const [query, setQuery] = useState("");
  const [allMenus, setAllMenus] = useState([]);
  const [menusLoaded, setMenusLoaded] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (menusLoaded) return;

    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home`);
        if (!res.ok) return;

        const data = await res.json();
        const all = data.all_list_product || data.AllListProduct || data.data || [];

        const mapped = all.map((p) => ({
          id: p.product_id || p.id,
          name: p.nama_menu || p.name,
        }));

        setAllMenus(mapped);
        setMenusLoaded(true);
      } catch (err) {
        console.error("Error fetch /home untuk search:", err);
      }
    };

    fetchMenus();
  }, [menusLoaded]);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.trim().toLowerCase();
    return allMenus
      .filter((m) => m.name.toLowerCase().includes(lower))
      .slice(0, 6);
  }, [query, allMenus]);

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    setShowSearchDropdown(false);
    navigate(`/menus?keyword=${encodeURIComponent(term)}`);
  };

  const handleSelectSuggestion = (id) => {
    setQuery("");
    setShowSearchDropdown(false);
    navigate(`/menu/${id}`);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    userData?.name && userData.name.length > 18
      ? `${userData.name.slice(0, 18)}…`
      : userData?.name;

  const onProfilePrimaryClick = () => {
    if (!isAdmin) return;

    if (location.pathname.startsWith("/admin")) navigate("/");
    else navigate("/admin");

    setProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 gap-4">
        <Link to="/" className="text-2xl font-extrabold text-slate-900">
          RaniaMart
        </Link>

        <div
          ref={searchRef}
          className="flex-1 max-w-2xl mx-4 relative hidden sm:block"
        >
          <form onSubmit={handleSubmitSearch}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search menu…"
                className="w-full border border-gray-200 rounded-full py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/80"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-medium bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors"
              >
                Cari
              </button>
            </div>
          </form>

          {showSearchDropdown && query.trim() && (
            <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-gray-200 shadow-lg max-h-80 overflow-y-auto">
              {filteredSuggestions.length > 0 ? (
                <ul className="py-2 text-sm">
                  {filteredSuggestions.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(item.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Search size={14} className="text-gray-400" />
                        <span className="text-gray-800">{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-xs text-gray-500">
                  Menu tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative" ref={profileRef}>
            {!userData ? (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-slate-900"
              >
                <User size={20} />
                <span>Masuk/Daftar</span>
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-slate-800 hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-600 text-white text-xs font-semibold">
                    {userData.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block max-w-[140px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-gray-200 shadow-lg py-2 text-sm z-40">
                    <div className="px-3 pb-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{userData.name}</p>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={onProfilePrimaryClick}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-800"
                      >
                        {location.pathname.startsWith("/admin") ? (
                          <>
                            <HomeIcon size={16} className="text-sky-600" />
                            <span>Ke Halaman Utama</span>
                          </>
                        ) : (
                          <>
                            <LayoutDashboard size={16} className="text-sky-600" />
                            <span>Dashboard Admin</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-slate-900"
          >
            <span className="relative inline-flex">
              <ShoppingCart size={22} />
              {cartQty > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center font-semibold">
                  {cartQty}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
