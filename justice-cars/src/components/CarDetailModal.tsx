import { useState, useEffect } from "react";
import { X, Phone, Mail, MapPin, Gauge, Settings, Fuel, Heart, Flag, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Car } from "@/types/car";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, loanCalc } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

interface CarDetailModalProps {
  car: Car;
  onClose: () => void;
}

export default function CarDetailModal({ car, onClose }: CarDetailModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIdx, setActiveIdx] = useState(0);
  const [inquiry, setInquiry] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showInquiry, setShowInquiry] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const [downPct, setDownPct] = useState(20);
  const [interestPct, setInterestPct] = useState(15);
  const [loanMonths, setLoanMonths] = useState(24);

  const images = car.imageUrls?.length ? car.imageUrls : ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop"];
  const monthly = loanCalc(car.price, downPct, interestPct, loanMonths);

  useEffect(() => {
    if (car.id && !car.id.startsWith("demo-")) {
      try {
        updateDoc(doc(db, "cars", car.id), { viewCount: increment(1) });
      } catch {}
    }
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [car.id]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setActiveIdx(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  async function submitInquiry() {
    if (!currentUser || !inquiry.trim()) return;
    setSubmittingInquiry(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        carId: car.id,
        carTitle: car.title,
        carName: car.title,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        name: userProfile.displayName || currentUser.email || "Anonymous",
        email: currentUser.email,
        phone: userProfile.phone || "",
        message: inquiry,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        read: false,
      });
      setInquirySent(true);
      setInquiry("");
      setTimeout(() => { setShowInquiry(false); setInquirySent(false); }, 2000);
    } catch (err) {
      console.error("Inquiry failed:", err);
      alert("Could not send your inquiry. Please try again.");
    }
    setSubmittingInquiry(false);
  }

  async function submitReport() {
    if (!currentUser || !reportReason.trim()) return;
    setSubmittingReport(true);
    try {
      await addDoc(collection(db, "reports"), {
        carId: car.id,
        carName: car.title,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        reason: reportReason,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        resolved: false,
      });
      setReportSent(true);
      setReportReason("");
      setTimeout(() => { setShowReport(false); setReportSent(false); }, 2000);
    } catch (err) {
      console.error("Report failed:", err);
      alert("Could not submit the report. Please try again.");
    }
    setSubmittingReport(false);
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}#/car/${car.id}`;
  const shareText = `Check out this ${car.title} for ${formatPrice(car.price)} on Justice Cars!`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
            <h2 className="font-bold text-lg line-clamp-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{car.title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {images.map((url, i) => (
                    <div key={i} className="flex-[0_0_100%]">
                      <img
                        src={url}
                        alt={`${car.title} ${i + 1}`}
                        className="w-full aspect-[4/3] object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => emblaApi?.scrollPrev()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => emblaApi?.scrollNext()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={`w-2 h-2 rounded-full transition-all ${activeIdx === i ? "bg-white scale-125" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl font-bold text-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {formatPrice(car.price)}
                  </span>
                  {car.sold && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD</span>}
                  {car.featured && !car.sold && <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">Featured</span>}
                </div>
                <p className="text-sm text-muted-foreground">{car.year} • {car.brand}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: MapPin, label: car.city || "—" },
                  { icon: Gauge, label: `${(car.mileage ?? 0).toLocaleString()} km` },
                  { icon: Settings, label: car.transmission || "—" },
                  { icon: Fuel, label: car.fuelType || "—" },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-2">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1.5">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>
              </div>

              <div className="border-t border-border pt-3 space-y-1.5">
                {car.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${car.contactPhone}`} className="hover:text-primary transition-colors">{car.contactPhone}</a>
                  </div>
                )}
                {car.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${car.contactEmail}`} className="hover:text-primary transition-colors break-all">{car.contactEmail}</a>
                  </div>
                )}
              </div>

              {car.accountDetails && (
                <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                  <span className="font-medium text-foreground">Account: </span>{car.accountDetails}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!car.sold && (
                  <button
                    onClick={() => { if (!currentUser) window.location.href = "/login"; else setShowInquiry(true); }}
                    className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Inquire Now
                  </button>
                )}
                {currentUser && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                    title="Report listing"
                  >
                    <Flag className="w-4.5 h-4.5 text-muted-foreground" />
                  </button>
                )}
                <div className="flex gap-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-green-500"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-blue-600"
                    title="Share on Facebook"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                    title="Share on X"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border">
            <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Loan Calculator</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Down Payment (%)</label>
                <input
                  type="number" min={0} max={100} value={downPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Interest Rate (% p.a.)</label>
                <input
                  type="number" min={0} max={100} step={0.1} value={interestPct}
                  onChange={(e) => setInterestPct(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Loan Term (months)</label>
                <input
                  type="number" min={1} max={84} value={loanMonths}
                  onChange={(e) => setLoanMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="bg-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Monthly Payment</span>
              <span className="text-xl font-bold text-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {formatPrice(monthly)}/mo
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Down payment: {formatPrice(car.price * downPct / 100)} &bull; Loan amount: {formatPrice(car.price * (1 - downPct / 100))}. This is an estimate only.
            </p>
          </div>

          {showInquiry && (
            <div className="p-6 border-t border-border">
              <h3 className="font-bold text-base mb-3">Send Inquiry</h3>
              {inquirySent ? (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400">
                  Inquiry sent successfully! The seller will contact you soon.
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder="Write your message here..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitInquiry}
                      disabled={submittingInquiry || !inquiry.trim()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {submittingInquiry ? "Sending..." : "Send Message"}
                    </button>
                    <button onClick={() => setShowInquiry(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showReport && (
            <div className="p-6 border-t border-border">
              <h3 className="font-bold text-base mb-3">Report Listing</h3>
              {reportSent ? (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400">
                  Report submitted. Our team will review this listing.
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Reason for report..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitReport}
                      disabled={submittingReport || !reportReason.trim()}
                      className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {submittingReport ? "Submitting..." : "Submit Report"}
                    </button>
                    <button onClick={() => setShowReport(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
