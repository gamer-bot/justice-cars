import { useEffect, useState } from "react";
import { Link } from "wouter";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: { seconds: number };
  author: string;
}

const DEMO_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Top 5 Cars to Buy in Nigeria Under ₦3 Million in 2024",
    content: "Looking for a reliable car without breaking the bank? These five options offer the best value for money in the Nigerian market today...",
    date: { seconds: Date.now() / 1000 - 86400 * 3 },
    author: "Justice Cars Team",
  },
  {
    id: "blog-2",
    title: "How to Spot a Flooded Car: A Complete Guide",
    content: "Flood-damaged vehicles are a growing problem in Nigeria, especially after rainy season. Here's how to protect yourself from buying one...",
    date: { seconds: Date.now() / 1000 - 86400 * 7 },
    author: "Justice Cars Team",
  },
  {
    id: "blog-3",
    title: "Toyota vs Honda: Which Brand Holds Up Better in Nigeria?",
    content: "Two of the most popular car brands in Nigeria go head-to-head. We look at reliability, spare parts availability, fuel economy, and resale value...",
    date: { seconds: Date.now() / 1000 - 86400 * 14 },
    author: "Justice Cars Team",
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "blog"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        const fetched: BlogPost[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
        setPosts(fetched.length ? fetched : DEMO_POSTS);
      } catch {
        setPosts(DEMO_POSTS);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          News & <span className="text-primary">Blog</span>
        </h1>
        <p className="text-muted-foreground">Tips, guides, and news from the Justice Cars team</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <h2 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </div>
                  {post.date?.seconds && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date.seconds * 1000).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
