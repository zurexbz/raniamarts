import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";

const API_BASE_URL = "http://localhost:8080/api/v1";

const getAuthToken = () =>
  localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

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

  return (
    <div className="w-14 h-14 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center text-[10px] font-semibold text-slate-500">
      IMG
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    if (!user) return;
    if (user.role && user.role.toLowerCase() !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchMenus = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(`${API_BASE_URL}/admin/product`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        const list = (data.all_list_product || []).map((p) => ({
          id: p.product_id,
          name: p.nama_menu,
          type: p.tipe_menu,
          price: p.harga,
          description: p.deskripsi,
          stock: p.stok,
          image: p.image_path
            ? `${API_BASE_URL}/admin/product/${p.image_id}`
            : null,
        }));

        setMenus(list);
      } catch (err) {
        console.error("Error fetch menu:", err);
        setErrorMsg("Gagal mengambil data menu. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [navigate]);

  // FILTER PENCARIAN
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

  // DELETE MENU
  const handleDelete = async (menu) => {
    const ok = window.confirm(`Hapus menu "${menu.name}"?`);
    if (!ok) return;

    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/product/${menu.id}/delete`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status && data.status >= 400)) {
        throw new Error(data?.message || "Gagal menghapus menu");
      }

      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
    } catch (err) {
      console.error("Error delete menu:", err);
      setErrorMsg(
        err.message || "Terjadi kesalahan saat menghapus menu. Coba lagi."
      );
    }
  };

  const handleAdd = () => {
    navigate("/admin/menus/new");
  };

  const handleEdit = (menu) => {
    navigate("/admin/menus/new", {
      state: {
        mode: "edit",
        productId: menu.id,
        product: menu,
      },
    });
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

              <ProfileMenu mode="admin" />
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

            {/* Error message */}
            {errorMsg && (
              <div className="mt-3 rounded-xl bg-red-500/10 border border-red-400/50 text-xs text-red-100 px-4 py-2">
                {errorMsg}
              </div>
            )}
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
                {loading ? (
                  <div className="px-4 py-10 text-center text-white/80 text-sm">
                    Memuat data menu...
                  </div>
                ) : filteredMenus.length === 0 ? (
                  <div className="px-4 py-10 text-center text-white/80 text-sm">
                    Data tidak ditemukan.
                  </div>
                ) : (
                  filteredMenus.map((menu, idx) => (
                    <div
                      key={menu.id}
                      className={`grid grid-cols-[60px_90px_1.4fr_1fr_120px_1.8fr_90px_140px] gap-2 px-4 py-3 text-sm text-white/90 border-b border-white/5 ${
                        idx % 2 === 0 ? "bg-white/6" : "bg-white/10"
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
