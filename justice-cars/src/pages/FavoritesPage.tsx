import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Car, DEMO_CARS } from "@/types/car";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CarCard from "@/components/CarCard";
import CarDetailModal from "@/components/CarDetailModal";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { currentUser, favorites } = useAuth();
  const [, setLocation] = useLocation();
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLocation("/login"); return; }
  }, [currentUser, setLocation]);

  useEffect(() => {
    async function loadFavCars() {
      if (!favorites.length) { setCars([]); setLoading(false); return; }
      try {
        const snap = await getDocs(collection(db, "cars"));
        const all: Car[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Car));
        const combined = [...DEMO_CARS, ...all];
        setCars(combined.filter((c) => favorites.includes(c.id)));
      } catch {
        setCars(DEMO_CARS.filter((c) => favorites.includes(c.id)));
      }
      setLoading(false);
    }
    loadFavCars();
  }, [favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>My Favorites</h1>
          <p className="text-muted-foreground text-sm">{cars.length} saved car{cars.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">No favorites yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Tap the heart icon on any car to save it here</p>
          <a href="/" className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Browse Cars
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />
          ))}
        </div>
      )}

      {selectedCar && <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />}
    </div>
  );
}
