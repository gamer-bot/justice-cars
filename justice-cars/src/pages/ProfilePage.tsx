import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Car, DEMO_CARS } from "@/types/car";
import { formatPrice } from "@/lib/utils";
import { MessageSquare, Heart, User, Camera, Loader2, Check } from "lucide-react";

interface Inquiry {
  id: string;
  carTitle?: string;
  carName?: string;
  message: string;
  createdAt?: { seconds: number };
  timestamp?: { seconds: number };
}

async function fileToCompressedDataURL(file: File, maxDim = 480, quality = 0.85): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  if (!file.type.startsWith("image/")) return dataUrl;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
    else { width = Math.round((width * maxDim) / height); height = maxDim; }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ProfilePage() {
  const { currentUser, userProfile, favorites, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [loadingInq, setLoadingInq] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(userProfile.displayName || "");
    setPhone(userProfile.phone || "");
    setPhotoURL(userProfile.photoURL || "");
  }, [userProfile.displayName, userProfile.phone, userProfile.photoURL]);

  useEffect(() => {
    if (!currentUser) { setLocation("/login"); return; }
    async function load() {
      try {
        const q = query(collection(db, "inquiries"), where("userId", "==", currentUser!.uid));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
        items.sort((a, b) => (b.createdAt?.seconds || b.timestamp?.seconds || 0) - (a.createdAt?.seconds || a.timestamp?.seconds || 0));
        setInquiries(items);
      } catch {}
      setLoadingInq(false);
    }
    load();
  }, [currentUser, setLocation]);

  useEffect(() => {
    if (!favorites.length) { setFavoriteCars([]); return; }
    const all = [...DEMO_CARS];
    const matched = all.filter((c) => favorites.includes(c.id));
    setFavoriteCars(matched);
  }, [favorites]);

  async function handlePhotoChange(file: File) {
    setUploading(true);
    try {
      const url = await fileToCompressedDataURL(file, 480, 0.85);
      setPhotoURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not process the image. Try a different photo.");
    }
    setUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateProfile({ displayName: displayName.trim(), phone: phone.trim(), photoURL });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (e) {
      console.error(e);
      alert("Failed to save your profile. Please try again.");
    }
    setSavingProfile(false);
  }

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {photoURL ? <img src={photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-primary" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>My Profile</h1>
          <p className="text-muted-foreground text-sm">{displayName || currentUser.email}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-4">Profile Setup</h2>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden border border-border">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                  aria-label="Change profile picture"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePhotoChange(e.target.files[0])}
                />
              </div>
              {photoURL && (
                <button
                  onClick={() => setPhotoURL("")}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >Remove photo</button>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input
                  value={currentUser.email || ""}
                  disabled
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-muted text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Profile
                </button>
                {savedFlash && <span className="text-xs text-green-600">Saved!</span>}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">My Inquiries</h2>
          </div>
          {loadingInq ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : inquiries.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
              No inquiries yet. Browse cars and send your first inquiry!
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => {
                const ts = inq.createdAt?.seconds || inq.timestamp?.seconds;
                return (
                  <div key={inq.id} className="bg-card border border-border rounded-xl p-4">
                    <p className="font-semibold text-sm">{inq.carTitle || inq.carName || "Listing"}</p>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2 whitespace-pre-wrap">{inq.message}</p>
                    {ts && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(ts * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg">Saved Cars</h2>
          </div>
          {favoriteCars.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
              No saved cars yet. Tap the heart icon on any car to save it.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {favoriteCars.map((car) => (
                <div key={car.id} className="bg-card border border-border rounded-xl p-4 flex gap-3">
                  <img
                    src={car.imageUrls?.[0]}
                    alt={car.title}
                    className="w-20 h-16 rounded-lg object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&auto=format&fit=crop"; }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{car.title}</p>
                    <p className="text-primary font-bold text-sm">{formatPrice(car.price)}</p>
                    <p className="text-xs text-muted-foreground">{car.city}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
