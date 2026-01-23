import React, { useEffect, useRef, useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const API_BASE_URL = "http://localhost:8080/api/v1";

const getAuthToken = () =>
  localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

const normalize = (json) => json?.data ?? json?.Data ?? json;

const formatRp = (n) => (Number(n) || 0).toLocaleString("id-ID");

export default function Cart() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalQty: 0 });
  const [busy, setBusy] = useState({}); // productId -> boolean

  const token = getAuthToken();

  const productLookupRef = useRef(null);

  const loadProductLookup = async () => {
    if (productLookupRef.current) return productLookupRef.current;

    try {
      const res = await fetch(`${API_BASE_URL}/home`);
      if (!res.ok) {
        productLookupRef.current = {};
        return productLookupRef.current;
      }

      const json = await res.json();

      const list =
        json?.all_list_product ||
        [];

      const lookup = {};
      (list || []).forEach((p) => {
        const pid = Number(p.product_id ?? p.id ?? 0);
        const imageId = p.image_id ?? p.ImageID ?? null;
        if (pid) lookup[pid] = imageId;
      });

      productLookupRef.current = lookup;
      return lookup;
    } catch (e) {
      console.error("loadProductLookup error:", e);
      productLookupRef.current = {};
      return productLookupRef.current;
    }
  };

  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      setCart({ items: [], subtotal: 0, totalQty: 0 });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setLoading(false);
        setCart({ items: [], subtotal: 0, totalQty: 0 });
        refreshCart();
        return;
      }

      const json = await res.json();
      const payload = normalize(json);

      const items = payload?.items ?? payload?.Items ?? [];

      const lookup = await loadProductLookup();

      const mapped = (items || []).map((it) => {
        const productId = Number(
          it.product_id ?? it.ProductID ?? it.id ?? it.ID ?? 0
        );

        const name =
          it.nama_menu ??
          it.NamaMenu ??
          it.product_name ??
          it.ProductName ??
          "-";

        const price = Number(
          it.harga ?? it.Harga ?? it.unit_price ?? it.UnitPrice ?? 0
        );

        const qty = Number(it.qty ?? it.Qty ?? 0);

        const imageId =
          it.image_id ??
          it.ImageID ??
          it.imageId ??
          (productId ? lookup[productId] : null) ??
          null;

        const imageUrl = imageId ? `${API_BASE_URL}/home/${imageId}` : "";

        return { productId, name, price, qty, imageUrl };
      });

      setCart({
        items: mapped,
        subtotal: Number(payload?.subtotal ?? payload?.Subtotal ?? 0),
        totalQty: Number(payload?.total_qty ?? payload?.TotalQty ?? 0),
      });

      refreshCart();
    } catch (e) {
      console.error("fetchCart error:", e);
      setCart({ items: [], subtotal: 0, totalQty: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchQty = async (productId, nextQty) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setBusy((p) => ({ ...p, [productId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart/items/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qty: Number(nextQty) }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.message || json?.Message || "Gagal update qty");
        return;
      }

      await fetchCart();
    } finally {
      setBusy((p) => ({ ...p, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const ok = window.confirm("Hapus item ini dari keranjang?");
    if (!ok) return;

    setBusy((p) => ({ ...p, [productId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart/items/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.message || json?.Message || "Gagal hapus item");
        return;
      }

      await fetchCart();
    } finally {
      setBusy((p) => ({ ...p, [productId]: false }));
    }
  };

  const isEmpty = cart.items.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Keranjang
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {token
                ? `${cart.items.length} item • total qty ${cart.totalQty}`
                : "Silakan login untuk melihat keranjang"}
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Memuat keranjang...
            </div>
          ) : !token ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-600">
                Kamu belum login. Keranjang hanya tersedia untuk user yang login.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-100 text-sm font-semibold text-slate-700"
                >
                  Kembali
                </Link>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-600">Keranjang kamu masih kosong.</p>
              <Link
                to="/"
                className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
              >
                Belanja sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: LIST ITEMS */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-slate-900">
                      Daftar item
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cart.items.map((it) => {
                      const isBusy = !!busy[it.productId];

                      return (
                        <div key={it.productId} className="p-5 flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            {it.imageUrl ? (
                              <img
                                src={it.imageUrl}
                                alt={it.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="text-xs text-gray-400">No image</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                              {it.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Rp {formatRp(it.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                              <button
                                type="button"
                                disabled={isBusy || it.qty <= 1}
                                onClick={() => patchQty(it.productId, it.qty - 1)}
                                className={`w-9 h-9 flex items-center justify-center ${
                                  isBusy || it.qty <= 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <Minus size={16} />
                              </button>

                              <div className="w-10 text-center text-sm font-semibold text-slate-800">
                                {it.qty}
                              </div>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => patchQty(it.productId, it.qty + 1)}
                                className={`w-9 h-9 flex items-center justify-center ${
                                  isBusy
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => removeItem(it.productId)}
                              className={`p-2 rounded-full border ${
                                isBusy
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-200 text-slate-600 hover:bg-gray-50"
                              }`}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: SUMMARY */}
              <aside className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sticky top-24">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Ringkasan belanja
                  </h2>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        Rp {formatRp(cart.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total qty</span>
                      <span className="font-semibold text-slate-900">
                        {cart.totalQty}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="mt-5 w-full py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition"
                    >
                    Lanjut Checkout
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
