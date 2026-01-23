import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, X } from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";
import AdminSidebar from "../components/AdminSidebar";

const API_BASE_URL = "http://localhost:8080/api/v1";
const ORDERS_ENDPOINT = `${API_BASE_URL}/admin/orders`;
const ORDER_DETAIL_ENDPOINT = (id) => `${API_BASE_URL}/admin/orders/${id}`;

const getAuthToken = () =>
  localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

const getAuthUser = () => {
  const raw = localStorage.getItem("rm_user") || sessionStorage.getItem("rm_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const toDateInputValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
};

const safeDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadCSV = (rows, filename) => {
  const csv = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-2xl border border-white/12 bg-white/8 px-5 py-4">
    <div className="text-xs text-white/75 font-semibold">{label}</div>
    <div className="mt-1 text-2xl font-extrabold text-white tracking-wide">{value}</div>
    {sub ? <div className="mt-1 text-xs text-white/70">{sub}</div> : null}
  </div>
);

function MiniLineChart({ data, height = 160 }) {
  const w = 520;
  const h = height;

  const points = useMemo(() => {
    if (!data || data.length <= 1) return "";
    const maxY = Math.max(...data.map((d) => d.value), 1);
    const minY = Math.min(...data.map((d) => d.value), 0);
    const pad = 12;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    return data
      .map((d, i) => {
        const x = pad + (innerW * i) / (data.length - 1);
        const norm = (d.value - minY) / (maxY - minY || 1);
        const y = pad + innerH - norm * innerH;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, w, h]);

  const maxLabel = useMemo(() => {
    if (!data?.length) return "0";
    const maxY = Math.max(...data.map((d) => d.value), 0);
    return formatIDR(maxY);
  }, [data]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-white tracking-wide">Revenue per Hari</div>
        <div className="text-xs text-white/70">Max: {maxLabel}</div>
      </div>

      <div className="mt-4">
        {data?.length ? (
          <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
            <polyline fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="3" points={points} />
            <polyline
              fill="none"
              stroke="white"
              strokeOpacity="0.20"
              strokeWidth="10"
              points={points}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="h-[160px] flex items-center justify-center text-white/70 text-sm">
            Belum ada data untuk ditampilkan.
          </div>
        )}
      </div>

      {data?.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/70">
          <div>{data[0]?.label}</div>
          <div className="text-center">{data[Math.floor(data.length / 2)]?.label}</div>
          <div className="text-right">{data[data.length - 1]?.label}</div>
        </div>
      ) : null}
    </div>
  );
}

function MiniBarList({ items }) {
  const maxVal = useMemo(() => (items?.length ? Math.max(...items.map((x) => x.value), 1) : 1), [items]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
      <div className="text-sm font-extrabold text-white tracking-wide">Top 10 Produk (by Revenue)</div>

      <div className="mt-4 space-y-3">
        {!items?.length ? (
          <div className="h-[160px] flex items-center justify-center text-white/70 text-sm">
            Belum ada data untuk ditampilkan.
          </div>
        ) : (
          items.map((it) => (
            <div key={it.name} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white/90 font-semibold truncate">{it.name}</div>
                <div className="text-xs text-white/75 shrink-0">{formatIDR(it.value)}</div>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
                <div className="h-full rounded-full bg-white/70" style={{ width: `${(it.value / maxVal) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const getSummaryOrders = (payload) => {
  const root = payload?.data ?? payload?.Data ?? payload;
  const orders = root?.orders ?? root?.Orders ?? root?.data?.orders ?? [];
  return Array.isArray(orders) ? orders : [];
};

const getOrderDetail = (payload) => {
  const root = payload?.data ?? payload?.Data ?? payload;
  return root?.order ?? root?.Order ?? root?.data?.order ?? null;
};

export default function AdminSalesReport() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(toDateInputValue(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toDateInputValue(today));

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role && user.role.toLowerCase() !== "admin") navigate("/");
  }, [user, navigate]);

  const fetchOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const currentUser = getAuthUser();
    const customerNameDefault = currentUser?.name || "Unknown";
    const customerEmailDefault = currentUser?.email || "";

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(ORDERS_ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      const rawText = await res.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = rawText;
      }

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const msg = typeof data === "string" ? data : data?.message || data?.error || `HTTP ${res.status}`;
        setOrders([]);
        setErrorMsg(`Gagal ambil order (${res.status}). ${msg}`);
        return;
      }

      const summary = getSummaryOrders(data);

      const summaryMapped = summary.map((o) => ({
        id: Number(o?.order_id ?? o?.orderId ?? o?.id),
        invoiceNo: o?.invoice_no ?? o?.invoiceNo ?? "",
        orderStatus: o?.order_status ?? o?.orderStatus ?? "",
        total: Number(o?.total || 0),
        createdAt: o?.created_at ?? o?.createdAt ?? null,
        customerName: customerNameDefault,
        customerEmail: customerEmailDefault,
        address: "",
        items: [],
      })).filter((x) => !!x.id);

      if (summaryMapped.length === 0) {
        setOrders([]);
        return;
      }

      const details = await Promise.all(
        summaryMapped.map(async (o) => {
          try {
            const r = await fetch(ORDER_DETAIL_ENDPOINT(o.id), {
              method: "GET",
              headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const t = await r.text();
            let j = null;
            try {
              j = t ? JSON.parse(t) : null;
            } catch {
              j = null;
            }
            if (!r.ok) return null;

            const detail = getOrderDetail(j);
            if (!detail) return null;

            const itemsRaw = Array.isArray(detail.items) ? detail.items : [];
            const items = itemsRaw.map((it) => ({
              productId: it?.product_id ?? it?.productId ?? null,
              productName: it?.nama_menu ?? it?.product_name ?? it?.name ?? "Unknown Product",
              qty: Number(it?.qty ?? it?.quantity ?? 0),
              price: Number(it?.unit_price ?? it?.price ?? 0),
              subtotal: Number(it?.subtotal ?? (Number(it?.qty ?? 0) * Number(it?.unit_price ?? it?.price ?? 0))),
            }));

            return {
              id: Number(detail?.order_id ?? o.id),
              invoiceNo: detail?.invoice_no ?? o.invoiceNo,
              orderStatus: detail?.order_status ?? o.orderStatus,
              total: Number(detail?.total ?? o.total ?? 0),
              createdAt: detail?.created_at ?? o.createdAt,
              address: detail?.shipping_address ?? "",
              shippingService: detail?.shipping_service ?? "",
              paymentMethod: detail?.payment_method ?? "",
              buyerNote: detail?.buyer_note ?? "",
              subtotalHeader: Number(detail?.subtotal ?? 0),
              shippingFee: Number(detail?.shipping_fee ?? 0),
              items,
            };
          } catch {
            return null;
          }
        })
      );

      const detailMap = new Map(details.filter(Boolean).map((d) => [d.id, d]));
      const merged = summaryMapped.map((o) => {
        const d = detailMap.get(o.id);
        if (!d) return o;
        return { ...o, ...d };
      });

      setOrders(merged);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal mengambil data order. Cek server & token.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromD = dateFrom ? safeDate(dateFrom) : null;
    const toD = dateTo ? safeDate(dateTo) : null;

    return orders.filter((o) => {
      const d = safeDate(o.createdAt);
      if (fromD && d && d < new Date(fromD.getTime())) return false;
      if (toD && d && d > new Date(toD.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;

      if (!q) return true;

      const inItems = (o.items || []).some((it) => (it.productName || "").toLowerCase().includes(q));

      return (
        String(o.invoiceNo || o.id).toLowerCase().includes(q) ||
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.customerEmail || "").toLowerCase().includes(q) ||
        (o.address || "").toLowerCase().includes(q) ||
        inItems
      );
    });
  }, [orders, search, dateFrom, dateTo]);

  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const itemsSold = filteredOrders.reduce(
      (sum, o) => sum + (o.items || []).reduce((s, it) => s + Number(it.qty || 0), 0),
      0
    );
    const uniqueCustomers = new Set(
      filteredOrders.map((o) => (o.customerEmail || o.customerName || "").toLowerCase()).filter(Boolean)
    ).size;
    const aov = totalOrders ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, itemsSold, uniqueCustomers, aov };
  }, [filteredOrders]);

  const revenueByDay = useMemo(() => {
    const map = new Map();
    for (const o of filteredOrders) {
      const d = safeDate(o.createdAt);
      const key = d ? toDateInputValue(d) : "unknown";
      map.set(key, (map.get(key) || 0) + Number(o.total || 0));
    }

    return Array.from(map.entries())
      .filter(([k]) => k !== "unknown")
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, value]) => ({ label: date.slice(5), value }));
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const map = new Map();
    for (const o of filteredOrders) {
      for (const it of o.items || []) {
        const name = it.productName || "Unknown Product";
        const revenue = Number(it.subtotal || (Number(it.qty || 0) * Number(it.price || 0)));
        map.set(name, (map.get(name) || 0) + revenue);
      }
    }

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredOrders]);

  const countItems = (o) => (o.items || []).reduce((sum, it) => sum + Number(it.qty || 0), 0);

  const handleExport = () => {
    const rows = [
      ["order_id", "invoice_no", "tanggal", "customer_name", "customer_email", "shipping_address", "product_name", "qty", "unit_price", "line_subtotal", "order_total"],
    ];

    for (const o of filteredOrders) {
      const d = safeDate(o.createdAt);
      const dateStr = d ? d.toISOString() : "";

      if (!o.items?.length) {
        rows.push([o.id, o.invoiceNo, dateStr, o.customerName, o.customerEmail, o.address, "", "", "", "", o.total]);
        continue;
      }

      for (const it of o.items) {
        rows.push([o.id, o.invoiceNo, dateStr, o.customerName, o.customerEmail, o.address, it.productName, it.qty, it.price, it.subtotal, o.total]);
      }
    }

    const fname = `sales_report_${dateFrom || "all"}_to_${dateTo || "all"}.csv`;
    downloadCSV(rows, fname);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B2D6B] via-[#1C56AE] to-[#2B7AD8] px-6 py-6">
      <div className="max-w-[1400px] mx-auto flex gap-6">
        <AdminSidebar />

        <div className="flex-1 min-w-0">
          <div className="rounded-[26px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden">
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide">Laporan Penjualan</h1>
                <ProfileMenu mode="admin" />
              </div>

              <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/75 font-semibold">From</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="rounded-xl bg-white/10 border border-white/15 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/75 font-semibold">To</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="rounded-xl bg-white/10 border border-white/15 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-[#16408F] font-semibold px-4 py-2.5 shadow hover:shadow-md transition w-fit"
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 text-white font-semibold px-4 py-2.5 hover:bg-white/15 transition w-fit"
                  >
                    <Download size={16} />
                    Export Excel (CSV)
                  </button>
                </div>

                <div className="w-full lg:w-[360px] relative">
                  <span className="absolute pl-3 top-1/2 -translate-y-1/2 text-white/70">
                    <Search size={16} />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search order/customer/alamat/produk..."
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/60 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 rounded-xl bg-red-500/10 border border-red-400/50 text-xs text-red-100 px-4 py-2">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="mt-5 px-4 pb-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                <StatCard label="Total Revenue" value={formatIDR(kpis.totalRevenue)} />
                <StatCard label="Total Orders" value={kpis.totalOrders} />
                <StatCard label="Items Sold" value={kpis.itemsSold} />
                <StatCard label="Avg Order Value" value={formatIDR(kpis.aov)} />
                <StatCard label="Unique Customers" value={kpis.uniqueCustomers} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MiniLineChart data={revenueByDay} />
                <MiniBarList items={topProducts} />
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/8 overflow-hidden">
                <div className="bg-[#0E3A7E]/70 border-b border-white/10">
                  <div className="grid grid-cols-[140px_150px_1.1fr_1.6fr_140px_110px_120px] gap-2 px-4 py-3 text-[12.5px] font-semibold text-white/95">
                    <div>Order ID</div>
                    <div>Tanggal</div>
                    <div>Customer</div>
                    <div>Alamat</div>
                    <div>Total</div>
                    <div>Items</div>
                    <div className="text-right pr-2">Action</div>
                  </div>
                </div>

                <div className="max-h-[520px] overflow-auto">
                  {loading ? (
                    <div className="px-4 py-10 text-center text-white/80 text-sm">Memuat data penjualan...</div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="px-4 py-10 text-center text-white/80 text-sm">Data tidak ditemukan.</div>
                  ) : (
                    filteredOrders.map((o, idx) => {
                      const d = safeDate(o.createdAt);
                      const t = d ? d.toLocaleString("id-ID") : "-";
                      const addrShort = (o.address || "-").length > 48 ? `${o.address.slice(0, 48)}...` : (o.address || "-");
                      const displayId = o.invoiceNo || String(o.id);

                      return (
                        <div
                          key={`${o.id}-${idx}`}
                          className={`grid grid-cols-[140px_150px_1.1fr_1.6fr_140px_110px_120px] gap-2 px-4 py-3 text-sm text-white/90 border-b border-white/5 ${
                            idx % 2 === 0 ? "bg-white/6" : "bg-white/10"
                          }`}
                        >
                          <div className="flex items-center font-semibold">{displayId}</div>
                          <div className="flex items-center text-white/85">{t}</div>
                          <div className="flex flex-col justify-center min-w-0">
                            <div className="font-semibold truncate">{o.customerName || "Unknown"}</div>
                            {o.customerEmail ? <div className="text-xs text-white/70 truncate">{o.customerEmail}</div> : null}
                          </div>
                          <div className="flex items-center text-white/85">{addrShort}</div>
                          <div className="flex items-center font-semibold">{formatIDR(o.total)}</div>
                          <div className="flex items-center font-semibold">{countItems(o)}</div>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 transition"
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedOrder && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedOrder(null)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-[#0E3A7E]/95 border-l border-white/10 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-extrabold text-lg">Detail Order</div>
                    <div className="text-white/70 text-xs mt-1">
                      Order ID: <span className="font-semibold text-white/90">{selectedOrder.invoiceNo || selectedOrder.id}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-auto h-[calc(100%-72px)]">
                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <div className="text-xs text-white/70 font-semibold">Customer</div>
                    <div className="text-white font-semibold mt-1">{selectedOrder.customerName || "Unknown"}</div>
                    {selectedOrder.customerEmail ? <div className="text-xs text-white/70 mt-1">{selectedOrder.customerEmail}</div> : null}
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <div className="text-xs text-white/70 font-semibold">Alamat Pengiriman</div>
                    <div className="text-white/90 mt-1 whitespace-pre-wrap">{selectedOrder.address || "-"}</div>
                    {selectedOrder.shippingService ? (
                      <div className="text-xs text-white/70 mt-2">Service: <span className="text-white/90 font-semibold">{selectedOrder.shippingService}</span></div>
                    ) : null}
                    {selectedOrder.paymentMethod ? (
                      <div className="text-xs text-white/70 mt-1">Payment: <span className="text-white/90 font-semibold">{selectedOrder.paymentMethod}</span></div>
                    ) : null}
                    {selectedOrder.buyerNote ? (
                      <div className="text-xs text-white/70 mt-1">Note: <span className="text-white/90">{selectedOrder.buyerNote}</span></div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/70 font-semibold">Items</div>
                      <div className="text-xs text-white/70">
                        Total: <span className="font-semibold text-white/90">{formatIDR(selectedOrder.total)}</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {selectedOrder.items?.length ? (
                        selectedOrder.items.map((it, i) => (
                          <div key={`${it.productId || it.productName}-${i}`} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2">
                            <div className="text-white/95 font-semibold text-sm">{it.productName}</div>
                            <div className="mt-1 text-xs text-white/70 flex items-center justify-between">
                              <span>
                                Qty: <span className="font-semibold text-white/85">{it.qty}</span> • Harga:{" "}
                                <span className="font-semibold text-white/85">{formatIDR(it.price)}</span>
                              </span>
                              <span className="font-semibold text-white/90">
                                {formatIDR(it.subtotal || (it.qty * it.price))}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-white/70 text-sm">Tidak ada item.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
