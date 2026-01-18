import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const API_BASE_URL = "http://localhost:8080/api/v1";

const getAuthToken = () =>
  localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

const normalize = (json) => json?.data ?? json?.Data ?? json;

const formatRp = (n) => (Number(n) || 0).toLocaleString("id-ID");

function safeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function pick(obj, keys, fallback = "") {
  for (const k of keys) {
    const val = obj?.[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
}

function addLine(doc, text, x, y, maxWidth = 180) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 6;
}

function generateReceiptPdf(receipt) {
  const doc = new jsPDF("p", "mm", "a4");

  const invoiceNo = safeText(
    pick(receipt, ["invoice_no", "invoiceNo", "InvoiceNo"], "INV-UNKNOWN")
  );
  const createdAt = safeText(
    pick(receipt, ["created_at", "createdAt", "CreatedAt"], new Date().toISOString())
  );

  const shippingAddress = safeText(
    pick(receipt, ["shipping_address", "shippingAddress", "ShippingAddress"], "-")
  );
  const shippingService = safeText(
    pick(receipt, ["shipping_service", "shippingService", "ShippingService"], "-")
  );
  const buyerNote = safeText(
    pick(receipt, ["buyer_note", "buyerNote", "BuyerNote"], "-")
  );
  const paymentMethod = safeText(
    pick(receipt, ["payment_method", "paymentMethod", "PaymentMethod"], "-")
  );

  const items = receipt?.items ?? receipt?.Items ?? [];
  const subtotal = Number(pick(receipt, ["subtotal", "Subtotal"], 0));
  const shippingFee = Number(pick(receipt, ["shipping_fee", "shippingFee", "ShippingFee"], 0));
  const total = Number(pick(receipt, ["total", "Total"], subtotal + shippingFee));

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RaniaMart", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Receipt / Nota Pembelian", 14, 24);

  doc.setDrawColor(220);
  doc.line(14, 28, 196, 28);

  // Meta
  let y = 36;
  doc.setFontSize(10);
  doc.text(`Invoice: ${invoiceNo}`, 14, y);
  doc.text(`Tanggal: ${createdAt}`, 14, y + 6);

  y += 16;

  doc.setFont("helvetica", "bold");
  doc.text("Detail Pengiriman", 14, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addLine(doc, `Alamat: ${shippingAddress}`, 14, y);
  y = addLine(doc, `Jasa Kirim: ${shippingService}`, 14, y);
  y = addLine(doc, `Metode Bayar: ${paymentMethod}`, 14, y);
  y = addLine(doc, `Catatan: ${buyerNote}`, 14, y);

  y += 4;
  doc.setDrawColor(230);
  doc.line(14, y, 196, y);
  y += 10;

  // Items table (simple)
  doc.setFont("helvetica", "bold");
  doc.text("Item", 14, y);
  doc.text("Qty", 140, y);
  doc.text("Harga", 156, y);
  doc.text("Total", 186, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(240);
  doc.line(14, y, 196, y);
  y += 6;

  const ensurePage = () => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
  };

  (items || []).forEach((it, idx) => {
    ensurePage();

    const name = safeText(
      pick(it, ["nama_menu", "NamaMenu", "product_name", "ProductName", "name", "Name"], `Item ${idx + 1}`)
    );
    const qty = Number(pick(it, ["qty", "Qty"], 0));
    const price = Number(pick(it, ["harga", "Harga", "unit_price", "UnitPrice", "price", "Price"], 0));
    const lineTotal = qty * price;

    const startY = y;
    const nextY = addLine(doc, name, 14, y, 120);

    doc.text(String(qty), 142, startY);
    doc.text(`Rp ${formatRp(price)}`, 156, startY);
    doc.text(`Rp ${formatRp(lineTotal)}`, 196, startY, { align: "right" });

    y = Math.max(nextY, startY + 8);
  });

  y += 4;
  ensurePage();
  doc.setDrawColor(230);
  doc.line(14, y, 196, y);
  y += 8;

  // Totals
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", 140, y);
  doc.text(`Rp ${formatRp(subtotal)}`, 196, y, { align: "right" });

  y += 6;
  doc.text("Ongkir", 140, y);
  doc.text(`Rp ${formatRp(shippingFee)}`, 196, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Total", 140, y);
  doc.text(`Rp ${formatRp(total)}`, 196, y, { align: "right" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Terima kasih sudah berbelanja di RaniaMart!", 14, y);

  doc.save(`RaniaMart-Receipt-${invoiceNo}.pdf`);
}

export default function Checkout() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const token = getAuthToken();

  const [loadingCart, setLoadingCart] = useState(true);
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalQty: 0 });

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingService, setShippingService] = useState("JNE REG");
  const [buyerNote, setBuyerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [shippingFee, setShippingFee] = useState(10000);

  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  const serviceOptions = useMemo(
    () => [
      { label: "JNE REG (Rp 10.000)", value: "JNE REG", fee: 10000 },
      { label: "JNE YES (Rp 20.000)", value: "JNE YES", fee: 20000 },
      { label: "SiCepat REG (Rp 12.000)", value: "SiCepat REG", fee: 12000 },
      { label: "GoSend Instant (Rp 25.000)", value: "GoSend Instant", fee: 25000 },
    ],
    []
  );

  useEffect(() => {
    const found = serviceOptions.find((s) => s.value === shippingService);
    if (found) setShippingFee(found.fee);
  }, [shippingService, serviceOptions]);

  const fetchCart = async () => {
    if (!token) {
      setLoadingCart(false);
      setCart({ items: [], subtotal: 0, totalQty: 0 });
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setLoadingCart(false);
        setCart({ items: [], subtotal: 0, totalQty: 0 });
        return;
      }

      const json = await res.json();
      const payload = normalize(json);

      const items = payload?.items ?? payload?.Items ?? [];
      const subtotal = Number(payload?.subtotal ?? payload?.Subtotal ?? 0);
      const totalQty = Number(payload?.total_qty ?? payload?.TotalQty ?? 0);

      setCart({ items, subtotal, totalQty });
    } catch (e) {
      console.error("fetchCart error:", e);
      setCart({ items: [], subtotal: 0, totalQty: 0 });
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = cart?.items?.length === 0;

  const total = (Number(cart.subtotal) || 0) + (Number(shippingFee) || 0);

  const handleCheckout = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!shippingAddress.trim()) {
      alert("Alamat wajib diisi.");
      return;
    }

    if (isEmpty) {
      alert("Keranjang kosong.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          shipping_service: shippingService,
          buyer_note: buyerNote,
          payment_method: paymentMethod,
          shipping_fee: Number(shippingFee),
        }),
      });

      const json = await res.json().catch(() => null);
      const payload = normalize(json);

      if (!res.ok) {
        if (res.status === 401) {
          alert("Silakan login kembali.");
          navigate("/login");
          return;
        }
        alert(json?.message || json?.Message || "Checkout gagal");
        return;
      }
      setLastReceipt(payload);
      refreshCart();
      generateReceiptPdf(payload);

      // optional: balik ke cart atau orders, tapi sekarang cukup stay + info sukses
    } catch (e) {
      console.error("checkout error:", e);
      alert("Checkout gagal (network error).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Checkout
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Isi alamat, pilih jasa kirim & metode bayar (dummy), lalu download receipt (PDF).
            </p>
          </div>

          {!token ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-600">
                Kamu belum login. Silakan login untuk checkout.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/cart"
                  className="px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-100 text-sm font-semibold text-slate-700"
                >
                  Kembali ke Keranjang
                </Link>
              </div>
            </div>
          ) : loadingCart ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Memuat data keranjang...
            </div>
          ) : isEmpty ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-600">Keranjang kamu kosong.</p>
              <Link
                to="/"
                className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
              >
                Belanja dulu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: FORM */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Data pengiriman & pembayaran
                  </h2>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Alamat pengiriman
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={4}
                        placeholder="Contoh: Jl. Contoh No. 10, Surabaya, Jawa Timur 60123"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Jasa kirim
                        </label>
                        <select
                          value={shippingService}
                          onChange={(e) => setShippingService(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                        >
                          {serviceOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Metode pembayaran (dummy)
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                        >
                          <option value="QRIS">QRIS</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Catatan pembeli (opsional)
                      </label>
                      <textarea
                        value={buyerNote}
                        onChange={(e) => setBuyerNote(e.target.value)}
                        rows={3}
                        placeholder="Contoh: Tolong packing rapat, hati-hati pengiriman."
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                      />
                    </div>
                  </div>

                  {lastReceipt && (
                    <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Checkout berhasil.
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Receipt sudah ter-download. Kalau perlu, kamu bisa download ulang.
                      </p>
                      <button
                        type="button"
                        onClick={() => generateReceiptPdf(lastReceipt)}
                        className="mt-3 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                      >
                        Download ulang PDF
                      </button>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Link
                      to="/cart"
                      className="px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-100 text-sm font-semibold text-slate-700"
                    >
                      Kembali
                    </Link>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={submitting}
                      className={`px-6 py-2.5 rounded-full text-sm font-semibold text-white transition ${
                        submitting
                          ? "bg-sky-300 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    >
                      {submitting ? "Memproses..." : "Checkout & Download Receipt (PDF)"}
                    </button>
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
                      <span>Ongkir</span>
                      <span className="font-semibold text-slate-900">
                        Rp {formatRp(shippingFee)}
                      </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Total</span>
                      <span className="text-slate-900 font-extrabold">
                        Rp {formatRp(total)}
                      </span>
                    </div>
                  </div>
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
