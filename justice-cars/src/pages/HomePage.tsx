import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Car, BRANDS, CITIES, DEMO_CARS } from "@/types/car";
import CarCard from "@/components/CarCard";
import CarDetailModal from "@/components/CarDetailModal";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PRICE_RANGES = [
  { label: "< 2M", min: 0, max: 2000000 },
  { label: "2-3M", min: 2000000, max: 3000000 },
  { label: "3-4M", min: 3000000, max: 4000000 },
  { label: "> 4M", min: 4000000, max: Infinity },
];

const MILEAGE_OPTIONS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 50k km", min: 0, max: 50000 },
  { label: "50-100k km", min: 50000, max: 100000 },
  { label: "> 100k km", min: 100000, max: Infinity },
];

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [hideSold, setHideSold] = useState(true);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [mileageIdx, setMileageIdx] = useState(0);
  const [transmission, setTransmission] = useState("All");
  const [fuelType, setFuelType] = useState("All");

  useEffect(() => {
    async function fetchCars() {
      try {
        const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
          setCars(DEMO_CARS);
        } else {
          const fetched: Car[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Car));
          setCars(fetched.length ? fetched : DEMO_CARS);
        }
      } catch {
        setCars(DEMO_CARS);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (hideSold && car.sold) return false;
      if (featuredOnly && !car.featured) return false;
      if (selectedCity !== "All" && car.city !== selectedCity) return false;
      if (selectedBrands.length && !selectedBrands.includes(car.brand)) return false;
      if (selectedPriceRange !== null) {
        const r = PRICE_RANGES[selectedPriceRange];
        if (car.price < r.min || car.price > r.max) return false;
      }
      const mOpt = MILEAGE_OPTIONS[mileageIdx];
      if (car.mileage < mOpt.min || car.mileage > mOpt.max) return false;
      if (transmission !== "All" && car.transmission !== transmission) return false;
      if (fuelType !== "All" && car.fuelType !== fuelType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!car.title.toLowerCase().includes(q) && !car.brand.toLowerCase().includes(q) && !String(car.year).includes(q)) return false;
      }
      return true;
    });
  }, [cars, hideSold, featuredOnly, selectedCity, selectedBrands, selectedPriceRange, mileageIdx, transmission, fuelType, search]);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedCity("All");
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setHideSold(true);
    setFeaturedOnly(false);
    setMileageIdx(0);
    setTransmission("All");
    setFuelType("All");
  }

  const hasActiveFilters = selectedCity !== "All" || selectedBrands.length > 0 || selectedPriceRange !== null ||
    !hideSold || featuredOnly || mileageIdx !== 0 || transmission !== "All" || fuelType !== "All" || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Browse <span className="text-primary">Cars</span>
        </h1>
        <p className="text-muted-foreground">Find your perfect car from our verified listings</p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Find car by model, year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary ml-0.5" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <div className="mb-4 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedBrands.includes(brand)
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-5 mb-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="All">All Cities</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedPriceRange === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Mileage</label>
                <div className="flex flex-wrap gap-2">
                  {MILEAGE_OPTIONS.map((m, i) => (
                    <button
                      key={m.label}
                      onClick={() => setMileageIdx(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        mileageIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Transmission</label>
                <div className="flex gap-2">
                  {["All", "Manual", "Automatic"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransmission(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        transmission === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Fuel Type</label>
                <div className="flex gap-2">
                  {["All", "Petrol", "Diesel", "Electric"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFuelType(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        fuelType === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Options</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} className="rounded" />
                  <span className="text-sm">Hide sold cars</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="rounded" />
                  <span className="text-sm">Featured only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filtered.length} car${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-bold text-xl mb-2">No cars found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((car) => (
              <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedCar && (
        <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
}
