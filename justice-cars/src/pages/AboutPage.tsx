import { Download, Shield, Clock, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-2xl mx-auto mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          JC
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          About <span className="text-primary">Justice Cars</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nigeria's most trusted automotive marketplace — connecting car buyers with verified sellers since 2020.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Shield, title: "Verified Listings", desc: "Every car listing is manually reviewed before going live. No scams, no surprises." },
          { icon: Clock, title: "Fast Transactions", desc: "Connect directly with sellers. No middlemen, no delays. Close deals in hours." },
          { icon: Award, title: "Best Prices", desc: "Competitive market pricing across Lagos, Abuja, and all major Nigerian cities." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Story</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Justice Cars was founded with a simple mission: to make buying and selling cars in Nigeria transparent, safe, and accessible to everyone. We saw too many people getting cheated in private car deals, and we decided to do something about it.
          </p>
          <p>
            Today, we list hundreds of vehicles across Lagos, Abuja, Ibadan, and beyond. From budget-friendly Honda Accords to luxury Land Rovers, every listing on our platform meets our strict quality standards.
          </p>
          <p>
            Our team is passionate about cars and about helping Nigerians make smart automotive decisions. Whether you're buying your first car or upgrading to something special, Justice Cars is here for you.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Get the Justice Cars App
        </h2>
        <p className="text-muted-foreground mb-6">Browse cars on the go. Get notifications for new listings, inquire instantly, and manage your favorites — all from your phone.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://apps.apple.com/app/justice-cars/id1234567890"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Download for iOS
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.justicecars.app"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Download for Android
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Available on the Play Store and App Store</p>
      </div>
    </div>
  );
}
