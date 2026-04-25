import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  displayName?: string;
  phone?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (carId: string) => Promise<void>;
  isFavorite: (carId: string) => boolean;
  updateProfile: (data: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFavorites(data.favorites || []);
            setUserProfile({
              displayName: data.displayName || "",
              phone: data.phone || "",
              photoURL: data.photoURL || "",
            });
          } else {
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              favorites: [],
              displayName: "",
              phone: "",
              photoURL: "",
              createdAt: serverTimestamp(),
            });
            setFavorites([]);
            setUserProfile({});
          }
        } catch {
          setFavorites([]);
          setUserProfile({});
        }
      } else {
        setFavorites([]);
        setUserProfile({});
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      favorites: [],
      displayName: "",
      phone: "",
      photoURL: "",
      createdAt: serverTimestamp(),
    });
  }

  async function logout() {
    await signOut(auth);
    setFavorites([]);
    setUserProfile({});
  }

  async function toggleFavorite(carId: string) {
    if (!currentUser) return;
    const newFavs = favorites.includes(carId)
      ? favorites.filter((id) => id !== carId)
      : [...favorites, carId];
    setFavorites(newFavs);
    await setDoc(doc(db, "users", currentUser.uid), { favorites: newFavs }, { merge: true });
  }

  function isFavorite(carId: string) {
    return favorites.includes(carId);
  }

  async function updateProfile(data: UserProfile) {
    if (!currentUser) return;
    const next = { ...userProfile, ...data };
    setUserProfile(next);
    await setDoc(doc(db, "users", currentUser.uid), next, { merge: true });
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, signup, logout, favorites, toggleFavorite, isFavorite, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
