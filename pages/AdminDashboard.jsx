import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Pencil, Trash2, Plus, LogOut } from "lucide-react";

const initialMenus = [
  {
    id: 1,
    name: "Tteokbokki & Saus 100gr",
    type: "Main Course",
    price: 25000,
    description: "Menu korea berbahan beras dengan saus gochujang yang pedas!",
    stock: 24,
    image: "menu/Tteokbokki.jpg",
  },
  {
    id: 2,
    name: "Caramel Machito",
    type: "Beverage",
    price: 15000,
    description: "Kopi arabica dengan saus caramel yang manis dan menenangkan",
    stock: 18,
    image: "menu/caramel.jpg",
  }
];

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const MenuImage = ({ name, image }) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-14 h-14 rounded-xl object-cover bg-white/60"
      />
    );
  }

  // placeholder glass
  return (
    <div className="w-14 h-14 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center text-[10px] font-semibold text-slate-500">
      IMG
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Handling Menu & Search
  const [menus, setMenus] = useState(initialMenus);
  const [search, setSearch] = useState("");
  
  // Handling Profile
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
    navigate("/login");
  };

  // Profile Menu Display Name
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const raw =
      localStorage.getItem("rm_user") || sessionStorage.getItem("rm_user");
  
    try {
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);
  
  const displayName = user?.name || "My Profile";
  const avatarLetter = (user?.name || "U").charAt(0).toUpperCase();

  const filteredMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;

    return menus.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        String(m.price).includes(q) ||
        (m.description || "").toLowerCase().includes(q)
      );
    });
  }, [menus, search]);

  const handleDelete = (menu) => {
    const ok = window.confirm(`Hapus menu "${menu.name}"?`);
    if (!ok) return;
    setMenus((prev) => prev.filter((m) => m.id !== menu.id));
  };

  const handleAdd = () => {
    navigate("/admin/menus/new");
  };

  const handleEdit = (menu) => {
    navigate("/admin/menus/new");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B2D6B] via-[#1C56AE] to-[#2B7AD8] px-6 py-6">
      {/* Outer glass shell */}
      <div className="max-w-[1400px] mx-auto">
        <div className="rounded-[26px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Header area */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide">
                Daftar Menu
              </h1>

              {/* My Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                >
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {avatarLetter}
                  </span>
                  <span className="text-sm font-semibold">{displayName}</span>
                  <ChevronDown
                    size={16}
                    className={`opacity-80 transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0E3A7E]/95 border border-white/10 backdrop-blur-xl shadow-lg overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sub header controls */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#16408F] font-semibold px-4 py-2.5 shadow hover:shadow-md transition w-fit"
              >
                <Plus size={16} />
                Add Menu Baru
              </button>

              {/* Search bar */}
              <div className="w-full md:w-[340px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                  <Search size={16} />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/60 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          </div>

          {/* Table container */}
          <div className="mt-5 px-4 pb-6">
            <div className="rounded-2xl border border-white/12 bg-white/8 overflow-hidden">
              {/* Table header bar */}
              <div className="bg-[#0E3A7E]/70 border-b border-white/10">
                <div className="grid grid-cols-[60px_90px_1.4fr_1fr_120px_1.8fr_90px_140px] gap-2 px-4 py-3 text-[12.5px] font-semibold text-white/95">
                  <div>No</div>
                  <div>Gambar</div>
                  <div>Nama Menu</div>
                  <div>Tipe</div>
                  <div>Harga</div>
                  <div>Deskripsi</div>
                  <div>Stok</div>
                  <div className="text-right pr-2">Action</div>
                </div>
              </div>

              {/* Table body */}
              <div className="max-h-[520px] overflow-auto">
                {filteredMenus.length === 0 ? (
                  <div className="px-4 py-10 text-center text-white/80 text-sm">
                    Data tidak ditemukan.
                  </div>
                ) : (
                  filteredMenus.map((menu, idx) => (
                    <div
                      key={menu.id}
                      className={`grid grid-cols-[60px_90px_1.4fr_1fr_120px_1.8fr_90px_140px] gap-2 px-4 py-3 text-sm text-white/90 border-b border-white/5 ${
                        idx % 2 === 0
                          ? "bg-white/6"
                          : "bg-white/10"
                      }`}
                    >
                      <div className="flex items-center">{idx + 1}</div>

                      <div className="flex items-center">
                        <MenuImage name={menu.name} image={menu.image} />
                      </div>

                      <div className="flex items-center font-semibold">
                        {menu.name}
                      </div>

                      <div className="flex items-center">{menu.type}</div>

                      <div className="flex items-center">
                        {formatIDR(menu.price)}
                      </div>

                      <div className="flex items-center">
                        <span className="line-clamp-2">
                          {menu.description}
                        </span>
                      </div>

                      <div className="flex items-center font-semibold">
                        {menu.stock}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(menu)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E28A3B]/90 hover:bg-[#E28A3B] text-white text-xs font-semibold px-3 py-1.5 transition"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(menu)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#D64C7F]/90 hover:bg-[#D64C7F] text-white text-xs font-semibold px-3 py-1.5 transition"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
