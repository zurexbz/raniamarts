import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, BarChart3, ChevronRight } from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      { label: "Daftar Menu", to: "/admin", icon: <LayoutDashboard size={18} />, match: (p) => p === "/admin" },
      { label: "Add Menu Baru", to: "/admin/menus/new", icon: <PlusCircle size={18} />, match: (p) => p.startsWith("/admin/menus") },
      { label: "Laporan Penjualan", to: "/admin/reports/sales", icon: <BarChart3 size={18} />, match: (p) => p.startsWith("/admin/reports/sales") },
    ],
    []
  );

  const isActive = (matchFn) => matchFn(location.pathname);

  return (
    <aside className="w-[260px] shrink-0">
      <div className="sticky top-6">
        <div className="rounded-[22px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.22)] overflow-hidden">
          <div className="px-5 py-5 border-b border-white/10">
            <div className="text-white font-extrabold tracking-wide text-lg">RaniaMart</div>
            <div className="text-white/70 text-xs mt-1">Admin Panel</div>
          </div>

          <nav className="p-3 space-y-2">
            {items.map((it) => {
              const active = isActive(it.match);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={[
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition border",
                    active
                      ? "bg-white/18 border-white/25 text-white"
                      : "bg-white/6 hover:bg-white/12 border-white/10 text-white/85",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-white" : "text-white/80"}>{it.icon}</span>
                    <span className="text-sm font-semibold">{it.label}</span>
                  </div>
                  <ChevronRight size={16} className={active ? "opacity-90" : "opacity-40"} />
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-3 w-full rounded-xl px-4 py-3 bg-white/6 hover:bg-white/12 border border-white/10 text-white/85 transition text-sm font-semibold text-left"
            >
              Ke Beranda User
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
