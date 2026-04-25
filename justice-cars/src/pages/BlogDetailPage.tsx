import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { DEMO_CARS } from "@/types/car";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: { seconds: number };
  author: string;
}

const DEMO_POSTS_DETAIL: Record<string, BlogPost> = {
  "blog-1": {
    id: "blog-1",
    title: "Top 5 Cars to Buy in Nigeria Under ₦3 Million in 2024",
    content: `Looking for a reliable car without breaking the bank? These five options offer the best value for money in the Nigerian market today.

**1. Toyota Corolla (2012-2015)**
The Corolla remains the gold standard for reliability in Nigeria. Parts are widely available, fuel efficiency is excellent, and mechanics know this car inside out. Prices range from ₦1.8M-₦2.5M for clean units.

**2. Honda Accord (2010-2014)**
Slightly more premium feel with the famous V6 engine. Great on highways, strong AC, and holds its value well. Budget ₦2M-₦2.8M for a good one.

**3. Nissan Altima (2011-2015)**
Often overlooked but excellent value. Comfortable interior, good fuel economy, and available parts. Find clean units from ₦1.5M-₦2.2M.

**4. Toyota Camry (2010-2014)**
The "Big Boy" of the budget range. Spacious, comfortable, and reliable. Good for executive use without the executive price tag. Budget ₦2.2M-₦2.8M.

**5. Honda Civic (2012-2016)**
Sporty, fuel-efficient, and fun to drive. Smaller than the Accord but still practical for daily use. Range: ₦1.5M-₦2.5M.

**Buying Tips:**
Always have a trusted mechanic inspect before purchase. Check for rust on the underbody, verify the engine number against documents, and test drive in traffic conditions similar to your daily route.`,
    date: { seconds: Date.now() / 1000 - 86400 * 3 },
    author: "Justice Cars Team",
  },
};

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const id = params.id;
      if (!id) { setLoading(false); return; }
      if (DEMO_POSTS_DETAIL[id]) { setPost(DEMO_POSTS_DETAIL[id]); setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "blog", id));
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() } as BlogPost);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>;
  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-muted-foreground mb-4">Post not found</p>
      <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>
      <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
        <div className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</div>
        {post.date?.seconds && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.date.seconds * 1000).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}
      </div>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        {post.content.split("\n").map((line, i) => {
          if (line.startsWith("**") && line.endsWith("**")) {
            return <p key={i} className="font-bold text-foreground mt-6 mb-2">{line.slice(2, -2)}</p>;
          }
          if (line.trim() === "") return <br key={i} />;
          return <p key={i}>{line}</p>;
        })}
      </div>
    </div>
  );
}
