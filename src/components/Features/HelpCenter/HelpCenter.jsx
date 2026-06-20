import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search, BookOpen, HelpCircle, Zap, Mail,
  ChevronDown, ChevronUp, Users, Briefcase, MessageSquare,
  Layers, BarChart2, UserCheck, ClipboardList, Building2,
  Radio, Home, CheckCircle, ArrowRight, Globe, Loader2
} from "lucide-react";
import { submitContact } from "@/api/contactApi";

const faqs = [
  {
    q: "How do I connect with someone on Networq Nexus?",
    a: "Go to the Network page or visit a user's profile and click the 'Connect' button. Once they accept, they'll appear in your connections list.",
  },
  {
    q: "How do I post something on the Feed?",
    a: "On the Feed page, click the 'Create Post' box at the top. You can write text, add images or documents, and publish to your network.",
  },
  {
    q: "What are Pro features (ATS, CRM, HRMS)?",
    a: "ATS (Applicant Tracking System), CRM (Customer Relationship Manager), and HRMS (Human Resource Management System) are enterprise-grade tools available on the Pro plan. They help teams manage hiring, clients, and employees.",
  },
  {
    q: "How do I change my profile photo?",
    a: "Go to Settings → Profile tab. Click the camera icon on your avatar, choose an image file, then click 'Save Changes'.",
  },
  {
    q: "Can I search for jobs on Networq Nexus?",
    a: "Yes! Click 'Jobs' in the sidebar or top navigation. You can filter jobs by title, location, type, and more.",
  },
  {
    q: "How do I start a message conversation?",
    a: "Open the Messages section from the sidebar. Click 'New Message', search for a connection, and start chatting in real time.",
  },
  {
    q: "What is the Streaming feature?",
    a: "Streaming lets you host or join live video sessions with your network — great for webinars, team calls, or live Q&As.",
  },
  {
    q: "How do I update my Open to Work status?",
    a: "Go to Settings → Profile tab. Toggle 'Open to Work' on or off. When enabled, recruiters can see you're available for opportunities.",
  },
  {
    q: "How do I change the app theme?",
    a: "Go to Settings → Appearance tab. Choose Light, Dark, or System. Your preference is saved automatically.",
  },
  {
    q: "How do I reset my password?",
    a: "On the login page click 'Forgot password?', enter your email, and follow the reset link sent to your inbox.",
  },
];

const features = [
  { icon: Home,          label: "Feed",      path: "/feed",      desc: "See posts and updates from your network. Like, comment, and share content to stay engaged." },
  { icon: Users,         label: "Network",   path: "/network",   desc: "Find and connect with professionals. Manage pending requests and explore suggested connections." },
  { icon: Briefcase,     label: "Jobs",      path: "/jobs",      desc: "Browse job listings, filter by role or location, and apply directly through the platform." },
  { icon: MessageSquare, label: "Messages",  path: "/messages",  desc: "Real-time private messaging with your connections. Supports text and file attachments." },
  { icon: Layers,        label: "Projects",  path: "/projects",  desc: "Showcase your portfolio projects. Add collaborators, links, and descriptions." },
  { icon: BarChart2,     label: "Analytics", path: "/analytics", desc: "Track your profile views, post reach, and connection growth over time." },
  { icon: Radio,         label: "Streaming", path: "/streaming", desc: "Host or join live video sessions. Ideal for talks, team meetings, and community events." },
  { icon: UserCheck,     label: "ATS",       path: "/ats",       desc: "Pro — Applicant Tracking System to manage job pipelines, candidates, and hiring workflows.", badge: "Pro" },
  { icon: ClipboardList, label: "CRM",       path: "/crm",       desc: "Pro — Customer Relationship Manager to track leads, clients, and sales activity.", badge: "Pro" },
  { icon: Building2,     label: "HRMS",      path: "/hrms",      desc: "Pro — Human Resource Management System for employee records, leaves, and payroll.", badge: "Pro" },
];

const gettingStarted = [
  { step: 1, title: "Create your account",    desc: "Sign up with your email, verify it, and set a strong password." },
  { step: 2, title: "Complete onboarding",    desc: "Add your name, headline, bio, skills, and location to set up your profile." },
  { step: 3, title: "Upload a profile photo", desc: "Go to Settings → Profile and add a photo so connections can recognise you." },
  { step: 4, title: "Connect with people",    desc: "Visit the Network page and send connection requests to colleagues and professionals." },
  { step: 5, title: "Explore the Feed",       desc: "Like and comment on posts, and create your own to share insights with your network." },
  { step: 6, title: "Search for jobs",        desc: "Open the Jobs section to find roles that match your skills and aspirations." },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/40 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-muted-foreground shrink-0"/>
          : <ChevronDown size={16} className="text-muted-foreground shrink-0"/>}
      </button>
      {open && (
        <div className="px-4 py-3 bg-muted/20 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-2 mb-1">
    {children}
  </p>
);

const HelpCenter = () => {
  const navigate = useNavigate();
  const [tab, setTab]     = useState("start");
  const [query, setQuery] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState("");

  const q = query.trim().toLowerCase();

  // Filtered search results across all three data sources
  const matchedFaqs     = faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  const matchedFeatures = features.filter(f => f.label.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
  const matchedSteps    = gettingStarted.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
  const hasAnyResult    = matchedFaqs.length > 0 || matchedFeatures.length > 0 || matchedSteps.length > 0;

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitContact(contact);
      setSent(true);
      setContact({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Help Center</h1>
          <p className="text-sm text-muted-foreground">Find answers, guides, and support for Networq Nexus</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input
            placeholder="Search help articles…"
            className="pl-9"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* ── SEARCH RESULTS VIEW ── */}
        {q ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground px-1 mb-1">
              Results for "<span className="text-foreground">{query}</span>"
            </p>

            {matchedSteps.length > 0 && (
              <>
                <SectionLabel>Getting Started</SectionLabel>
                {matchedSteps.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3 items-start rounded-xl border border-border bg-card px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {matchedFaqs.length > 0 && (
              <>
                <SectionLabel>FAQ</SectionLabel>
                {matchedFaqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a}/>)}
              </>
            )}

            {matchedFeatures.length > 0 && (
              <>
                <SectionLabel>Features</SectionLabel>
                {matchedFeatures.map(({ icon: Icon, label, path, desc, badge }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="rounded-xl border border-border bg-card p-4 flex gap-3 items-start hover:bg-muted/20 transition-colors text-left w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none">{badge}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground shrink-0 mt-1"/>
                  </button>
                ))}
              </>
            )}

            {!hasAnyResult && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No results found. Try different keywords or{" "}
                <button
                  onClick={() => { setQuery(""); setTab("contact"); }}
                  className="text-primary hover:underline"
                >
                  contact support
                </button>.
              </div>
            )}
          </div>
        ) : (
          /* ── NORMAL TABS VIEW ── */
          <>
            {/* Quick-topic chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Getting Started", value: "start"    },
                { label: "FAQ",             value: "faq"      },
                { label: "Feature Guides",  value: "features" },
                { label: "Contact Support", value: "contact"  },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium
                    ${tab === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-auto flex-wrap gap-1 p-1 justify-start w-full">
                <TabsTrigger value="start"    className="text-xs gap-1"><BookOpen size={12}/>Getting Started</TabsTrigger>
                <TabsTrigger value="faq"      className="text-xs gap-1"><HelpCircle size={12}/>FAQ</TabsTrigger>
                <TabsTrigger value="features" className="text-xs gap-1"><Zap size={12}/>Features</TabsTrigger>
                <TabsTrigger value="contact"  className="text-xs gap-1"><Mail size={12}/>Contact</TabsTrigger>
              </TabsList>

              {/* Getting Started */}
              <TabsContent value="start" className="mt-4">
                <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-foreground">Get up and running in 6 steps</h2>
                  <Separator/>
                  <div className="flex flex-col gap-3">
                    {gettingStarted.map(({ step, title, desc }) => (
                      <div key={step} className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {step}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator/>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle size={16} className="text-primary shrink-0"/>
                    <p className="text-xs text-muted-foreground">
                      Tip: A complete profile gets <span className="text-foreground font-medium">5× more</span> profile views from recruiters.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* FAQ */}
              <TabsContent value="faq" className="mt-4">
                <div className="flex flex-col gap-2">
                  {faqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a}/>)}
                </div>
              </TabsContent>

              {/* Features */}
              <TabsContent value="features" className="mt-4">
                <div className="flex flex-col gap-3">
                  {features.map(({ icon: Icon, label, path, desc, badge }) => (
                    <button
                      key={label}
                      onClick={() => navigate(path)}
                      className="rounded-xl border border-border bg-card p-4 flex gap-3 items-start hover:bg-muted/20 transition-colors text-left w-full"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none">{badge}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground shrink-0 mt-1"/>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Contact */}
              <TabsContent value="contact" className="mt-4">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Mail,  label: "Email Support", value: "support@networqnexus.com", desc: "Response within 24 hrs" },
                      { icon: Globe, label: "Community",     value: "community.networqnexus.com", desc: "Ask the community" },
                    ].map(({ icon: Icon, label, value, desc }) => (
                      <div key={label} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className="text-primary"/>
                          <span className="text-xs font-semibold text-foreground">{label}</span>
                        </div>
                        <p className="text-xs text-primary truncate">{value}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Send us a message</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Describe your issue and we'll get back to you shortly.</p>
                    </div>
                    <Separator/>
                    {sent ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                          <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400"/>
                        </div>
                        <p className="text-sm font-medium text-foreground">Message sent!</p>
                        <p className="text-xs text-muted-foreground text-center">Our support team will reply to your email within 24 hours.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSend} className="flex flex-col gap-3">
                        <div>
                          <label className="text-xs font-medium text-foreground">Your Name</label>
                          <Input
                            className="mt-1" placeholder="John Doe" required
                            value={contact.name}
                            onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground">Email Address</label>
                          <Input
                            className="mt-1" type="email" placeholder="you@example.com" required
                            value={contact.email}
                            onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground">Message</label>
                          <textarea
                            required
                            placeholder="Describe your issue or question…"
                            className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none min-h-[100px] placeholder:text-muted-foreground focus:ring-1 focus:ring-ring transition-shadow"
                            value={contact.message}
                            onChange={e => setContact(c => ({ ...c, message: e.target.value }))}
                          />
                        </div>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <button
                          type="submit"
                          disabled={sending}
                          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {sending ? <><Loader2 size={14} className="animate-spin"/>Sending…</> : "Send Message"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default HelpCenter;
