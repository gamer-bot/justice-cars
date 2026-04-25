import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I buy a car from Justice Cars?",
    a: "Browse our listings, click on a car you like to view details, then click 'Inquire Now' to send a message to the seller. You'll need to create a free account to send inquiries. Once you connect with the seller, you can arrange an inspection and complete the purchase directly."
  },
  {
    q: "Are the cars on Justice Cars verified?",
    a: "Every listing goes through a manual review process. Sellers must provide accurate details and valid contact information. We recommend always inspecting the vehicle in person before making payment."
  },
  {
    q: "How does payment work?",
    a: "Justice Cars facilitates the connection between buyer and seller. Payment is made directly between the parties. Always insist on a written agreement and receipt. Never pay before inspecting the vehicle in person."
  },
  {
    q: "Can I sell my car on Justice Cars?",
    a: "Yes! Contact our team to list your vehicle. We charge a small listing fee and will promote your car to thousands of serious buyers. Reach us at speak2justicechibueze@gmail.com."
  },
  {
    q: "What documents should I check before buying?",
    a: "Always verify: Vehicle License (proof of ownership), Engine and chassis numbers match the documents, Certificate of Roadworthiness, Insurance certificate, and valid vehicle registration."
  },
  {
    q: "How do I use the Loan Calculator?",
    a: "Open any car listing and scroll to the Loan Calculator section. Enter your down payment percentage, interest rate, and loan term to see your estimated monthly repayment. This is an estimate — contact your bank for official quotes."
  },
  {
    q: "What should I check during a car inspection?",
    a: "Check: engine condition (no oil leaks, no smoke), transmission shifts smoothly, AC works properly, all lights and electronics function, body for rust or accident damage, tire condition and age, check engine light on dashboard, and take it for a test drive."
  },
  {
    q: "How do I report a suspicious listing?",
    a: "Open the car listing and click the 'Report' button (available to logged-in users). Provide a brief reason and our team will review and take action within 24 hours."
  },
];

export default function InfoPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Buyer's Guide & <span className="text-primary">FAQ</span>
        </h1>
        <p className="text-muted-foreground">Everything you need to know about buying a car safely in Nigeria</p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
        <h2 className="font-bold text-lg mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Buying Checklist</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Verify seller's identity before meeting",
            "Always inspect in person, daylight hours",
            "Run engine check (no smoke, no leaks)",
            "Verify all documents match the car",
            "Never pay before inspection",
            "Take a test drive on different road types",
            "Check accident/repair history",
            "Get a trusted mechanic to inspect",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-bold text-xl mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Frequently Asked Questions</h2>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm pr-4">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            {openIdx === i && (
              <div className="px-5 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-card border border-border rounded-2xl p-6 text-center">
        <h3 className="font-bold mb-2">Still have questions?</h3>
        <p className="text-sm text-muted-foreground mb-4">Our team is ready to help you find the perfect car</p>
        <a
          href="mailto:speak2justicechibueze@gmail.com"
          className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
