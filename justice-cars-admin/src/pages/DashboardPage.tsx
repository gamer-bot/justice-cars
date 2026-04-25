import { useState, useEffect, useRef } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query as fbQuery
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Car, FileText, MessageSquare, AlertTriangle, BarChart2,
  Plus, Upload, Download, Pencil, Trash2, Check, X,
  Search, ChevronDown, Image, Loader2
} from "lucide-react";
import Papa from "papaparse";

const TABS = [
  { id: "cars", label: "Cars", icon: Car },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "bulk", label: "Bulk Import", icon: Upload },
];

const CAR_TYPES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Van", "Bus", "Convertible"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];
const CONDITIONS = ["New", "Foreign Used", "Nigerian Used"];
const Conditions = CONDITIONS;
const STATES = ["Lagos", "Abuja", "Rivers", "Kano", "Ibadan", "Enugu", "Kaduna", "Owerri", "Benin City", "Port Harcourt", "Other"];

interface CarDoc {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  type: string;
  fuel: string;
  state: string;
  transmission: string;
  color: string;
  description: string;
  images: string[];
  featured: boolean;
  sold: boolean;
  createdAt?: { seconds: number };
}

interface BlogDoc { id: string; title: string; content: string; author: string; date?: { seconds: number }; }
interface InquiryDoc { id: string; carId?: string; carName?: string; name?: string; email?: string; phone?: string; message?: string; createdAt?: { seconds: number }; }
interface ReportDoc { id: string; carId?: string; reason?: string; userId?: string; createdAt?: { seconds: number }; }

const EMPTY_CAR: Omit<CarDoc, "id"> = {
  make: "", model: "", year: 2020, price: 0, mileage: 0,
  condition: "Foreign Used", type: "Sedan", fuel: "Petrol", state: "Lagos",
  transmission: "Automatic", color: "", description: "", images: [], featured: false, sold: false
};

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>;
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("cars");

  const [cars, setCars] = useState<CarDoc[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogDoc[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingCar, setEditingCar] = useState<Partial<CarDoc> | null>(null);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogDoc> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [bulkPreview, setBulkPreview] = useState<Partial<CarDoc>[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [carsSnap, blogSnap, inqSnap, repSnap] = await Promise.all([
        getDocs(fbQuery(collection(db, "cars"), orderBy("createdAt", "desc"))),
        getDocs(fbQuery(collection(db, "blog"), orderBy("date", "desc"))),
        getDocs(fbQuery(collection(db, "inquiries"), orderBy("createdAt", "desc"))),
        getDocs(fbQuery(collection(db, "reports"), orderBy("createdAt", "desc"))),
      ]);
      setCars(carsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CarDoc)));
      setBlogPosts(blogSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogDoc)));
      setInquiries(inqSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InquiryDoc)));
      setReports(repSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportDoc)));
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleSaveCar() {
    if (!editingCar) return;
    setSaving(true);
    try {
      if (editingCar.id) {
        const { id, ...data } = editingCar;
        await updateDoc(doc(db, "cars", id), data);
      } else {
        await addDoc(collection(db, "cars"), { ...EMPTY_CAR, ...editingCar, createdAt: serverTimestamp() });
      }
      await loadAll();
      setEditingCar(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleDeleteCar(id: string) {
    if (!confirm("Delete this car listing? This cannot be undone.")) return;
    await deleteDoc(doc(db, "cars", id));
    await loadAll();
  }

  async function handleUploadImages(files: FileList) {
    if (!editingCar) return;
    setUploadingImages(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const r = ref(storage, `cars/${Date.now()}_${file.name}`);
      await uploadBytes(r, file);
      urls.push(await getDownloadURL(r));
    }
    setEditingCar((prev) => ({ ...prev, images: [...(prev?.images || []), ...urls] }));
    setUploadingImages(false);
  }

  async function handleSaveBlog() {
    if (!editingBlog) return;
    setSaving(true);
    try {
      if (editingBlog.id) {
        const { id, ...data } = editingBlog;
        await updateDoc(doc(db, "blog", id), data);
      } else {
        await addDoc(collection(db, "blog"), { title: "", content: "", author: "Justice Cars Team", ...editingBlog, date: serverTimestamp() });
      }
      await loadAll();
      setEditingBlog(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleDeleteBlog(id: string) {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "blog", id));
    await loadAll();
  }

  async function handleDeleteReport(id: string) {
    if (!confirm("Dismiss this report?")) return;
    await deleteDoc(doc(db, "reports", id));
    await loadAll();
  }

  function handleBulkFile(file: File) {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const rows = (result.data as Record<string, string>[]).map((row) => ({
          make: row.make || "",
          model: row.model || "",
          year: Number(row.year) || 2020,
          price: Number(row.price) || 0,
          mileage: Number(row.mileage) || 0,
          condition: row.condition || "Foreign Used",
          type: row.type || "Sedan",
          fuel: row.fuel || "Petrol",
          state: row.state || "Lagos",
          transmission: row.transmission || "Automatic",
          color: row.color || "",
          description: row.description || "",
          images: [],
          featured: row.featured === "true",
          sold: false,
        } as Partial<CarDoc>));
        setBulkPreview(rows);
      },
    });
  }

  async function handleBulkImport() {
    if (!bulkPreview.length) return;
    setBulkImporting(true);
    for (const car of bulkPreview) {
      await addDoc(collection(db, "cars"), { ...EMPTY_CAR, ...car, createdAt: serverTimestamp() });
    }
    setBulkImporting(false);
    setBulkPreview([]);
    await loadAll();
    setTab("cars");
  }

  function exportCarsCSV() {
    const data = cars.map((c) => ({
      make: c.make, model: c.model, year: c.year, price: c.price,
      mileage: c.mileage, condition: c.condition, type: c.type, fuel: c.fuel,
      state: c.state, transmission: c.transmission, color: c.color, sold: c.sold,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "justice-cars-export.csv";
    a.click();
  }

  const filteredCars = cars.filter((c) =>
    search === "" || `${c.make} ${c.model} ${c.state}`.toLowerCase().includes(search.toLowerCase())
  );

  const analyticsData = {
    byType: CAR_TYPES.map((t) => ({ name: t, count: cars.filter((c) => c.type === t).length })).filter((d) => d.count),
    byState: STATES.map((s) => ({ name: s, count: cars.filter((c) => c.state === s).length })).filter((d) => d.count),
    byCondition: Conditions.map((c) => ({ name: c, value: cars.filter((car) => car.condition === c).length })).filter((d) => d.value),
  };

  const COLORS = ["hsl(43,96%,56%)", "hsl(200,95%,55%)", "hsl(145,60%,50%)", "hsl(280,60%,65%)", "hsl(0,63%,60%)"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm" style={{ fontFamily: 'Poppins' }}>JC</div>
          <span className="font-bold" style={{ fontFamily: 'Poppins' }}>Admin Panel</span>
        </div>
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          Sign Out
        </button>
      </header>

      <div className="flex border-b border-border bg-card overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "inquiries" && inquiries.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{inquiries.length}</span>
            )}
            {id === "reports" && reports.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 sm:p-6">
        {loading && tab !== "analytics" && tab !== "bulk" && (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        )}

        {/* ── CARS TAB ── */}
        {tab === "cars" && !loading && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex-1 relative min-w-48">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cars..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button onClick={exportCarsCSV} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => setEditingCar({ ...EMPTY_CAR })} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Car
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{filteredCars.length} listing{filteredCars.length !== 1 ? "s" : ""}</p>
            <div className="space-y-2">
              {filteredCars.map((car) => (
                <div key={car.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                  <div className="w-12 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {car.images?.[0] ? <img src={car.images[0]} className="w-full h-full object-cover" /> : <Car className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{car.year} {car.make} {car.model}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(car.price)} · {car.state} · {car.condition}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {car.featured && <Badge label="Featured" color="bg-primary/20 text-primary" />}
                    {car.sold && <Badge label="Sold" color="bg-destructive/20 text-destructive" />}
                    <button onClick={() => setEditingCar(car)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDeleteCar(car.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              ))}
              {!filteredCars.length && (
                <div className="text-center py-16 text-muted-foreground">
                  <Car className="w-10 h-10 mx-auto mb-3" />
                  <p>No car listings yet. Add your first car.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BLOG TAB ── */}
        {tab === "blog" && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Blog Posts ({blogPosts.length})</h2>
              <button onClick={() => setEditingBlog({ title: "", content: "", author: "Justice Cars Team" })} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> New Post
              </button>
            </div>
            <div className="space-y-2">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.author} · {post.date?.seconds ? new Date(post.date.seconds * 1000).toLocaleDateString("en-NG") : ""}
                    </p>
                  </div>
                  <button onClick={() => setEditingBlog(post)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => handleDeleteBlog(post.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              ))}
              {!blogPosts.length && (
                <div className="text-center py-16 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3" />
                  <p>No blog posts yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INQUIRIES TAB ── */}
        {tab === "inquiries" && !loading && (
          <div>
            <h2 className="font-bold mb-4">Inquiries ({inquiries.length})</h2>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3 flex-wrap">
                    <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{inq.name || "Anonymous"} — {inq.carName || inq.carId}</p>
                      <p className="text-xs text-muted-foreground mb-2">{inq.email} · {inq.phone}</p>
                      <p className="text-sm text-muted-foreground">{inq.message}</p>
                      {inq.createdAt?.seconds && (
                        <p className="text-xs text-muted-foreground mt-2">{new Date(inq.createdAt.seconds * 1000).toLocaleString("en-NG")}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!inquiries.length && (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                  <p>No inquiries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {tab === "reports" && !loading && (
          <div>
            <h2 className="font-bold mb-4">Reports ({reports.length})</h2>
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Car ID: {rep.carId}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rep.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">Reported by user: {rep.userId}</p>
                    {rep.createdAt?.seconds && (
                      <p className="text-xs text-muted-foreground">{new Date(rep.createdAt.seconds * 1000).toLocaleString("en-NG")}</p>
                    )}
                  </div>
                  <button onClick={() => handleDeleteReport(rep.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Check className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              ))}
              {!reports.length && (
                <div className="text-center py-16 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
                  <p>No active reports.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Cars", value: cars.length, color: "text-primary" },
                { label: "For Sale", value: cars.filter((c) => !c.sold).length, color: "text-green-500" },
                { label: "Sold", value: cars.filter((c) => c.sold).length, color: "text-muted-foreground" },
                { label: "Inquiries", value: inquiries.length, color: "text-blue-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-bold mb-4 text-sm">Cars by Type</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.byType}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(43,96%,56%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-bold mb-4 text-sm">Cars by Condition</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={analyticsData.byCondition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {analyticsData.byCondition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 sm:col-span-2">
                <h3 className="font-bold mb-4 text-sm">Cars by State</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.byState}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(200,95%,55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── BULK TAB ── */}
        {tab === "bulk" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-bold mb-2">Bulk Import Cars from CSV</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with columns: make, model, year, price, mileage, condition, type, fuel, state, transmission, color, description, featured
              </p>
              <div className="flex flex-wrap gap-3">
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleBulkFile(e.target.files[0])}
                />
                <button onClick={() => bulkInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                  <Upload className="w-4 h-4" /> Choose CSV File
                </button>
                <a
                  href="data:text/csv;charset=utf-8,make,model,year,price,mileage,condition,type,fuel,state,transmission,color,description,featured%0AToyota,Corolla,2015,2000000,50000,Foreign Used,Sedan,Petrol,Lagos,Automatic,Silver,Clean Toyota Corolla in excellent condition,false"
                  download="sample-cars.csv"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm border border-dashed border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Download className="w-4 h-4" /> Download Template
                </a>
              </div>
            </div>

            {bulkPreview.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">{bulkPreview.length} cars ready to import</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setBulkPreview([])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button onClick={handleBulkImport} disabled={bulkImporting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
                      {bulkImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Import All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 pr-3">Year</th>
                        <th className="text-left pb-2 pr-3">Make</th>
                        <th className="text-left pb-2 pr-3">Model</th>
                        <th className="text-left pb-2 pr-3">Price</th>
                        <th className="text-left pb-2">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.map((car, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5 pr-3">{car.year}</td>
                          <td className="py-1.5 pr-3">{car.make}</td>
                          <td className="py-1.5 pr-3">{car.model}</td>
                          <td className="py-1.5 pr-3">{formatPrice(car.price || 0)}</td>
                          <td className="py-1.5">{car.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── CAR EDIT MODAL ── */}
      {editingCar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold">{editingCar.id ? "Edit Car" : "Add New Car"}</h2>
              <button onClick={() => setEditingCar(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                {(["make", "model"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium mb-1 capitalize">{field}</label>
                    <input value={editingCar[field] || ""} onChange={(e) => setEditingCar({ ...editingCar, [field]: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1">Year</label>
                  <input type="number" value={editingCar.year || 2020} onChange={(e) => setEditingCar({ ...editingCar, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (₦)</label>
                  <input type="number" value={editingCar.price || 0} onChange={(e) => setEditingCar({ ...editingCar, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mileage (km)</label>
                  <input type="number" value={editingCar.mileage || 0} onChange={(e) => setEditingCar({ ...editingCar, mileage: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {([
                  { key: "condition", opts: CONDITIONS },
                  { key: "type", opts: CAR_TYPES },
                  { key: "fuel", opts: FUEL_TYPES },
                ] as const).map(({ key, opts }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1 capitalize">{key}</label>
                    <div className="relative">
                      <select value={(editingCar as Record<string, unknown>)[key] as string || ""} onChange={(e) => setEditingCar({ ...editingCar, [key]: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                        {opts.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">State</label>
                  <div className="relative">
                    <select value={editingCar.state || "Lagos"} onChange={(e) => setEditingCar({ ...editingCar, state: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Transmission</label>
                  <div className="relative">
                    <select value={editingCar.transmission || "Automatic"} onChange={(e) => setEditingCar({ ...editingCar, transmission: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                      <option>Automatic</option><option>Manual</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Color</label>
                  <input value={editingCar.color || ""} onChange={(e) => setEditingCar({ ...editingCar, color: e.target.value })}
                    placeholder="e.g. Silver" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea value={editingCar.description || ""} onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                  rows={3} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editingCar.images || []).map((url, i) => (
                    <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden border border-border">
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditingCar({ ...editingCar, images: editingCar.images?.filter((_, j) => j !== i) })}
                        className="absolute top-0.5 right-0.5 bg-destructive rounded-full p-0.5"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-16 h-12 border border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Image className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => e.target.files && handleUploadImages(e.target.files)} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingCar.featured || false} onChange={(e) => setEditingCar({ ...editingCar, featured: e.target.checked })} className="accent-primary" />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingCar.sold || false} onChange={(e) => setEditingCar({ ...editingCar, sold: e.target.checked })} className="accent-primary" />
                  <span className="text-sm">Mark as Sold</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
              <button onClick={() => setEditingCar(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveCar} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Car
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BLOG EDIT MODAL ── */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold">{editingBlog.id ? "Edit Post" : "New Blog Post"}</h2>
              <button onClick={() => setEditingBlog(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input value={editingBlog.title || ""} onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  placeholder="Post title..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Author</label>
                <input value={editingBlog.author || ""} onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Content</label>
                <textarea value={editingBlog.content || ""} onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  rows={10} placeholder="Write your blog post content here..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
              <button onClick={() => setEditingBlog(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveBlog} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Post
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border py-3 px-4 text-center text-xs text-muted-foreground">
        Developed by Dev.Scorpion – v1.0
      </footer>
    </div>
  );
}
