import React, { useMemo, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ChevronDown, UploadCloud, Image as ImageIcon, ArrowLeft, LogOut} from "lucide-react";

const TYPE_OPTIONS = ["Main Course", "Beverage", "Snack"];

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function AddMenu() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // Profile Menu Handle
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

  // Form Handle
  const [name, setName] = useState("");
  const [type, setType] = useState("Main Course");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const imagePreview = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const canSubmit =
    name.trim() &&
    type.trim() &&
    String(price).trim() !== "" &&
    Number(price) > 0 &&
    description.trim() &&
    String(stock).trim() !== "" &&
    Number(stock) >= 0;

  const handlePickFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (jpg/png).");
      return;
    }

    setErrorMsg("");
    setImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (jpg/png).");
      return;
    }

    setErrorMsg("");
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!canSubmit) {
      setErrorMsg("Mohon lengkapi data wajib terlebih dahulu.");
      return;
    }

    const payload = {
      name,
      type,
      price: Number(price),
      description,
      stock: Number(stock),
    };

    console.log("ADD MENU PAYLOAD:", payload, imageFile);

    alert("Form OK (nanti kita sambungkan ke API)");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B2D6B] via-[#1C56AE] to-[#2B7AD8] px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="rounded-[26px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Top header */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide">
                  Add Menu Baru
                </h1>
              </div>

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
          </div>

          {/* Form card */}
          <div className="px-6 pb-8 pt-5">
            <div className="rounded-2xl border border-white/12 bg-white/8 p-6 md:p-8">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Nama Menu */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Nama Menu
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama menu..."
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/55 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                {/* Tipe */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Tipe
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="text-slate-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Harga
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 25000"
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/55 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <div className="mt-1 text-xs text-white/60">
                    Preview: {formatIDR(price)}
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi menu..."
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/55 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                  />
                </div>

                {/* Stok */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Contoh: 50"
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/55 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                {/* Gambar */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Gambar
                  </label>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-2xl border border-dashed ${
                      dragOver ? "border-white/60" : "border-white/25"
                    } bg-white/10 p-6 md:p-8 transition`}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* Preview */}
                      <div className="w-full md:w-[220px]">
                        <div className="aspect-square rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-white/70">
                              <ImageIcon size={28} />
                              <span className="text-xs">
                                Preview gambar
                              </span>
                            </div>
                          )}
                        </div>

                        {imageFile && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="mt-3 w-full rounded-lg bg-white/10 border border-white/15 text-white/90 text-xs font-semibold py-2 hover:bg-white/15 transition"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      {/* Upload text */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white/90 text-sm font-semibold">
                          <UploadCloud size={16} />
                          Upload Image
                        </div>

                        <p className="mt-3 text-white/80 text-sm font-semibold">
                          Choose file atau drag file ke area ini
                        </p>
                        <p className="mt-1 text-white/55 text-xs">
                          Format disarankan: JPG/PNG/WebP.
                        </p>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handlePickFile}
                            className="rounded-xl bg-white text-[#16408F] font-semibold px-4 py-2.5 shadow hover:shadow-md transition"
                          >
                            Choose files
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Error */}
                {errorMsg && (
                  <div className="text-sm text-[#ffb4c7] bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
                      canSubmit
                        ? "bg-white text-[#16408F] hover:brightness-95 shadow"
                        : "bg-white/30 text-white/70 cursor-not-allowed"
                    }`}
                    disabled={!canSubmit}
                  >
                    Submit
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
