import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UploadCloud, Image as ImageIcon, ChevronDown } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const API_BASE = "http://localhost:8080/api/v1";

export default function AddMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==== MODE: ADD vs EDIT ====
  const isEdit = location.state?.mode === "edit";
  const editingProduct = location.state?.product || null;
  const editingId = location.state?.productId || editingProduct?.id || null;

  // ==== FORM STATE ====
  const [namaMenu, setNamaMenu] = useState("");
  const [tipeMenu, setTipeMenu] = useState("");
  const [harga, setHarga] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [stok, setStok] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ==== UI STATE ====
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Prefill form kalau mode EDIT
  useEffect(() => {
    if (isEdit && editingProduct) {
      setNamaMenu(editingProduct.name || "");
      setTipeMenu(editingProduct.type || "");
      setHarga(editingProduct.price ?? "");
      setDeskripsi(editingProduct.description || "");
      setStok(editingProduct.stock ?? "");
      if (editingProduct.image) {
        setImagePreview(editingProduct.image); 
      }
    }
  }, [isEdit, editingProduct]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setImageFile(file);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!namaMenu.trim()) {
      setErrorMsg("Nama menu wajib diisi.");
      return;
    }
    if (!tipeMenu) {
      setErrorMsg("Tipe menu wajib dipilih.");
      return;
    }
    if (!harga || Number(harga) <= 0) {
      setErrorMsg("Harga wajib diisi dan harus lebih dari 0.");
      return;
    }
    if (!stok || Number(stok) < 0) {
      setErrorMsg("Stok wajib diisi dan tidak boleh negatif.");
      return;
    }

    const token =
      localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

    if (!token) {
      setErrorMsg("Sesi login berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("nama_menu", namaMenu.trim());
    formData.append("tipe_menu", tipeMenu);
    formData.append("harga", String(harga));
    formData.append("deskripsi", deskripsi.trim());
    formData.append("stok", String(stok));

    if (imageFile) {
      formData.append("Menu", imageFile);
    }

    const url = isEdit
      ? `${API_BASE}/admin/product/${editingId}/update`
      : `${API_BASE}/admin/product/create`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      setSubmitting(true);
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.error) {
        const msg =
          data?.message ||
          data?.error ||
          `Gagal ${isEdit ? "mengupdate" : "menyimpan"} menu.`;
        throw new Error(msg);
      }

      setSuccessMsg(
        isEdit ? "Menu berhasil diupdate 🎉" : "Menu berhasil ditambahkan 🎉"
      );
      setErrorMsg("");

      if (!isEdit) {
        setNamaMenu("");
        setTipeMenu("");
        setHarga("");
        setDeskripsi("");
        setStok("");
        setImageFile(null);
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
      } else {
        setTimeout(() => {
          navigate("/admin");
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(
        err.message ||
          `Terjadi kesalahan saat ${isEdit ? "mengupdate" : "menyimpan"} menu.`
      );
      setSuccessMsg("");
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? "Edit Menu" : "Add Menu Baru";
  const subtitle = isEdit
    ? "Perbarui informasi menu yang sudah ada di RaniaMart."
    : "Tambahkan menu baru ke RaniaMart lengkap dengan informasi dan gambar.";
  const submitLabel = isEdit ? "Update" : "Submit";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B2D6B] via-[#1C56AE] to-[#2B7AD8] px-6 py-6">
      <div className="max-w-[1400px] mx-auto flex gap-6">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto">
            {/* Outer glass card */}
            <div className="rounded-[26px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.28)] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-white text-2xl font-extrabold tracking-wide">
                      {title}
                    </h1>
                    <p className="text-sm text-white/75">{subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Body / Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                {/* Alert error / success */}
                {errorMsg && (
                  <div className="rounded-xl border border-red-300/60 bg-red-50/90 text-red-700 px-4 py-2 text-sm">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded-xl border border-emerald-300/70 bg-emerald-50/90 text-emerald-700 px-4 py-2 text-sm flex items-center justify-between gap-3">
                    <span>{successMsg}</span>
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="text-xs font-semibold underline underline-offset-2"
                    >
                      Kembali ke Daftar Menu
                    </button>
                  </div>
                )}

                {/* Nama Menu */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1.5">
                    Nama Menu
                  </label>
                  <input
                    type="text"
                    value={namaMenu}
                    onChange={(e) => setNamaMenu(e.target.value)}
                    placeholder="Contoh: Nasi Ayam with Buldak Sauce"
                    className="w-full rounded-xl bg-white/12 border border-white/30 text-white placeholder:text-white/60 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/35"
                  />
                </div>

                {/* Tipe + Harga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1.5">
                      Tipe Menu
                    </label>

                    <div className="relative">
                      <select
                        value={tipeMenu}
                        onChange={(e) => setTipeMenu(e.target.value)}
                        className="w-full rounded-xl bg-white/12 border border-white/30 text-white text-sm px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-white/35 appearance-none"
                      >
                        <option className="bg-[#1C56AE] text-white" value="">
                          -- Pilih tipe menu --
                        </option>
                        <option className="bg-[#1C56AE] text-white" value="Main Course">
                          Main Course
                        </option>
                        <option className="bg-[#1C56AE] text-white" value="Beverage">
                          Beverage
                        </option>
                        <option className="bg-[#1C56AE] text-white" value="Snack">
                          Snack
                        </option>
                      </select>

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1.5">
                      Harga (IDR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="Contoh: 15000"
                      className="w-full rounded-xl bg-white/12 border border-white/30 text-white placeholder:text-white/60 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/35"
                    />
                  </div>
                </div>

                {/* Stok */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1.5">
                      Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      placeholder="Contoh: 20"
                      className="w-full rounded-xl bg-white/12 border border-white/30 text-white placeholder:text-white/60 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/35"
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan deskripsi singkat menu, rasa, bahan utama, dsb."
                    className="w-full rounded-xl bg-white/12 border border-white/30 text-white placeholder:text-white/60 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/35 resize-none"
                  />
                </div>

                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1.5">
                    Gambar Menu
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-[1.6fr_minmax(0,1fr)] gap-4 items-stretch">
                    {/* Dropzone / chooser */}
                    <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer px-4 py-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      <UploadCloud className="mb-2 text-white/80" size={22} />
                      <p className="text-sm text-white/90 font-medium">
                        Pilih file atau drag &amp; drop
                      </p>
                      <p className="text-xs mt-1 text-white/65">
                        Format gambar (JPG, PNG)
                      </p>
                      {imageFile && (
                        <p className="mt-2 text-xs text-white/80">
                          Dipilih:{" "}
                          <span className="font-semibold">{imageFile.name}</span>
                        </p>
                      )}
                      {!imageFile && isEdit && imagePreview && (
                        <p className="mt-2 text-xs text-white/80">
                          Menggunakan gambar yang sudah ada.
                        </p>
                      )}
                    </label>

                    {/* Preview */}
                    <div className="rounded-2xl border border-white/25 bg-white/10 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview menu"
                          className="w-full h-full max-h-52 object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white/70 text-xs gap-2 p-4">
                          <ImageIcon size={22} />
                          <span>Preview gambar</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Button submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-8 py-3 rounded-2xl bg-white text-[#16408F] font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-white/95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Menyimpan..." : submitLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
}
