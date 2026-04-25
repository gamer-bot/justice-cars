export interface Car {
  id: string;
  title: string;
  year: number;
  price: number;
  accountDetails: string;
  brand: string;
  city: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  mileage: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Electric";
  sold: boolean;
  featured: boolean;
  imageUrls: string[];
  createdAt: unknown;
  viewCount?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: unknown;
  author: string;
}

export const DEMO_CARS: Car[] = [
  {
    id: "demo-1",
    title: "2020 Toyota Camry LE",
    year: 2020,
    price: 3200000,
    accountDetails: "GTBank 0123456789 — Justice Cars Ltd",
    brand: "Toyota",
    city: "Lagos",
    description: "Excellent condition Toyota Camry LE. Clean interior, full AC, power windows. No accident history. Registered with valid documents. Available for inspection anytime.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 45000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: false,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502489651187-f36db2c5a6ba?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 124,
  },
  {
    id: "demo-2",
    title: "2019 Lexus RX 350",
    year: 2019,
    price: 8500000,
    accountDetails: "Access Bank 1234567890 — Justice Cars Ltd",
    brand: "Lexus",
    city: "Abuja",
    description: "Clean Lexus RX350 in great condition. Leather seats, sunroof, navigation system, backup camera. Neatly used by one owner. All papers intact.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 62000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: false,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1630583469791-9d89d059a19a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546961342-ea5f62d6a6d1?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 89,
  },
  {
    id: "demo-3",
    title: "2018 Honda Accord Sport",
    year: 2018,
    price: 2800000,
    accountDetails: "First Bank 9876543210 — Justice Cars Ltd",
    brand: "Honda",
    city: "Ikeja",
    description: "Sporty Honda Accord with V6 engine. Excellent fuel economy, comfortable ride, well maintained. AC very cold, all electronics working. Come inspect.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 78000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: false,
    featured: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 67,
  },
  {
    id: "demo-4",
    title: "2021 Mercedes-Benz C300",
    year: 2021,
    price: 12000000,
    accountDetails: "GTBank 0987654321 — Justice Cars Ltd",
    brand: "Mercedes-Benz",
    city: "Lagos",
    description: "Pristine Mercedes-Benz C300. Barely used, bought brand new. Full leather interior, MBUX infotainment, panoramic sunroof, 19-inch AMG wheels. Warranty still active.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 18000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: false,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 203,
  },
  {
    id: "demo-5",
    title: "2017 Ford Explorer XLT",
    year: 2017,
    price: 4500000,
    accountDetails: "Zenith Bank 5555666677 — Justice Cars Ltd",
    brand: "Ford",
    city: "Ibadan",
    description: "Family-sized Ford Explorer with 7 seats. Well maintained, very spacious, Ford SYNC system, tow package included. Great for family road trips.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 95000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: true,
    featured: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 45,
  },
  {
    id: "demo-6",
    title: "2022 Land Rover Discovery Sport",
    year: 2022,
    price: 18500000,
    accountDetails: "UBA 1122334455 — Justice Cars Ltd",
    brand: "Land Rover",
    city: "Abuja",
    description: "Near-new Land Rover Discovery Sport SE. P300e plug-in hybrid, all-terrain capability, 7 seats. Terrain Response 2, Wade program for water crossings. Full service history.",
    contactPhone: "+234 801 234 5678",
    contactEmail: "sales@justicecars.com",
    mileage: 12000,
    transmission: "Automatic",
    fuelType: "Petrol",
    sold: false,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop",
    ],
    createdAt: new Date(),
    viewCount: 178,
  },
];

export const BRANDS = ["Toyota", "Lexus", "Honda", "Mercedes-Benz", "Nissan", "Ford", "Land Rover", "Acura"];
export const CITIES = ["Lagos", "Abuja", "Ikeja", "Amuwo-Odofin", "Ibadan", "Other"];
