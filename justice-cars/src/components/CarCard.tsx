import { Heart, MapPin, Gauge, Fuel, Settings, MessageCircle } from "lucide-react";
import { Car } from "@/types/car";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { motion } from "framer-motion";

interface CarCardProps {
  car: Car;
  onClick: () => void;
}

export default function CarCard({ car, onClick }: CarCardProps) {
  const { currentUser, isFavorite, toggleFavorite } = useAuth();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    toggleFavorite(car.id);
  };

  const imgUrl = car.imageUrls?.[0] || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop";
  const fav = isFavorite(car.id);
  const waLink = buildWhatsAppLink({
    phone: car.contactPhone || "",
    carTitle: car.title,
    carPrice: formatPrice(car.price),
    carUrl: typeof window !== "undefined" ? `${window.location.origin}/?car=${car.id}` : undefined,
  });

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={imgUrl}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {car.sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold text-lg px-4 py-2 rounded-lg -rotate-12 shadow-lg">
              SOLD
            </span>
          </div>
        )}

        {car.featured && !car.sold && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${fav ? "fill-red-500 stroke-red-500" : "stroke-white"}`}
          />
        </button>

        {!car.sold && (
          <button
            onClick={handleWhatsApp}
            className="absolute top-3 right-14 w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-md transition-all hover:scale-110"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4.5 h-4.5 stroke-white" />
          </button>
        )}

        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-xl leading-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {formatPrice(car.price)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {car.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{car.accountDetails}</p>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {car.city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {car.city}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Gauge className="w-3.5 h-3.5" />
            {(car.mileage ?? 0).toLocaleString()} km
          </div>
          {car.transmission && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Settings className="w-3.5 h-3.5" />
              {car.transmission}
            </div>
          )}
          {car.fuelType && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Fuel className="w-3.5 h-3.5" />
              {car.fuelType}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
