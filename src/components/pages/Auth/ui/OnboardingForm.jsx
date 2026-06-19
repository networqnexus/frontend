// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { CheckCircle2, ArrowRight, Briefcase, MapPin, Link2, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { completeOnboarding } from "@/api/authApi";
// import useAuth from "@/hooks/useAuth";

// const SKILLS_LIST = [
//   "React", "Node.js", "TypeScript", "Python", "AWS", "Docker",
//   "GraphQL", "MongoDB", "PostgreSQL", "Figma", "Product Management",
//   "Data Science", "DevOps", "Machine Learning", "UX Design",
// ];

// const GOALS = [
//   { id: "job",      label: "Find a Job",        emoji: "💼" },
//   { id: "network",  label: "Grow my Network",   emoji: "🤝" },
//   { id: "hire",     label: "Hire Talent",        emoji: "🎯" },
//   { id: "learn",    label: "Learn & Grow",       emoji: "📚" },
// ];

// const OnboardingForm = () => {
//   const navigate = useNavigate();
//   const { token, updateUser } = useAuth();

//   const [headline, setHeadline]   = useState("");
//   const [bio,      setBio]        = useState("");
//   const [website,  setWebsite]    = useState("");
//   const [skills,   setSkills]     = useState([]);
//   const [goals,    setGoals]      = useState([]);
//   const [loading,  setLoading]    = useState(false);
//   const [error,    setError]      = useState("");

//   const toggleSkill = (s) =>
//     setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

//   const toggleGoal = (g) =>
//     setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const data = await completeOnboarding(token);
//       // Update user in localStorage so onboardingCompleted = true
//       updateUser(data.user);
//       navigate("/feed");
//     } catch (err) {
//       setError(err.message || "Could not complete onboarding. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">

//       {/* Headline */}
//       <div className="space-y-1.5">
//         <label className="text-sm font-medium text-foreground">Professional Headline</label>
//         <div className="relative">
//           <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
//           <Input
//             placeholder="e.g. Full Stack Developer · Open to Work"
//             value={headline}
//             onChange={e => setHeadline(e.target.value)}
//             className="pl-9"
//           />
//         </div>
//       </div>

//       {/* Bio */}
//       <div className="space-y-1.5">
//         <label className="text-sm font-medium text-foreground">Short Bio</label>
//         <div className="relative">
//           <FileText size={14} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
//           <textarea
//             placeholder="Tell people a little about yourself..."
//             value={bio}
//             onChange={e => setBio(e.target.value)}
//             rows={3}
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
//           />
//         </div>
//       </div>

//       {/* Website */}
//       <div className="space-y-1.5">
//         <label className="text-sm font-medium text-foreground">Website / Portfolio</label>
//         <div className="relative">
//           <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
//           <Input
//             type="url"
//             placeholder="https://yourportfolio.dev"
//             value={website}
//             onChange={e => setWebsite(e.target.value)}
//             className="pl-9"
//           />
//         </div>
//       </div>

//       {/* Skills */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium text-foreground">
//           Skills <span className="text-muted-foreground font-normal">(pick up to 8)</span>
//         </label>
//         <div className="flex flex-wrap gap-2">
//           {SKILLS_LIST.map(s => (
//             <button
//               key={s}
//               type="button"
//               onClick={() => toggleSkill(s)}
//               disabled={!skills.includes(s) && skills.length >= 8}
//               className={`px-3 py-1.5 text-xs rounded-lg border transition-all
//                 ${skills.includes(s)
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
//                 }`}
//             >
//               {skills.includes(s) && <CheckCircle2 size={10} className="inline mr-1" />}
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Goals */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium text-foreground">What are you here for?</label>
//         <div className="grid grid-cols-2 gap-2">
//           {GOALS.map(g => (
//             <button
//               key={g.id}
//               type="button"
//               onClick={() => toggleGoal(g.id)}
//               className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
//                 ${goals.includes(g.id)
//                   ? "border-primary bg-primary/5 ring-1 ring-primary/20"
//                   : "border-border hover:border-foreground/20 hover:bg-muted/30"
//                 }`}
//             >
//               <span className="text-xl">{g.emoji}</span>
//               <span className="text-xs font-medium text-foreground">{g.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
//           <p className="text-sm text-destructive">{error}</p>
//         </div>
//       )}

//       {/* Submit */}
//       <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
//         {loading ? (
//           <>
//             <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
//             Finishing setup...
//           </>
//         ) : (
//           <>
//             Complete Setup <ArrowRight size={15} />
//           </>
//         )}
//       </Button>

//       <button
//         type="button"
//         onClick={() => navigate("/feed")}
//         className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
//       >
//         Skip for now
//       </button>
//     </form>
//   );
// };

// export default OnboardingForm;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Briefcase, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/api/authApi";
import useAuth from "@/hooks/useAuth";

const SKILLS_LIST = [
  "React", "Node.js", "TypeScript", "Python", "AWS", "Docker",
  "GraphQL", "MongoDB", "PostgreSQL", "Figma", "Product Management",
  "Data Science", "DevOps", "Machine Learning", "UX Design",
];

const GOALS = [
  { id: "job",     label: "Find a Job",      emoji: "💼", role: "candidate" },
  { id: "network", label: "Grow my Network", emoji: "🤝", role: "candidate" },
  { id: "hire",    label: "Hire Talent",      emoji: "🎯", role: "recruiter" },
  { id: "learn",   label: "Learn & Grow",     emoji: "📚", role: "candidate" },
];

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { token, updateUser } = useAuth();

  const [headline, setHeadline] = useState("");
  const [bio,      setBio]      = useState("");
  const [website,  setWebsite]  = useState("");
  const [skills,   setSkills]   = useState([]);
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const toggleSkill = (s) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleGoal = (g) =>
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = goals.includes("hire") ? "recruiter" : "candidate";
      const data = await completeOnboarding(token, { role });
      updateUser({ ...data.user, role });
      navigate("/feed");
    } catch (err) {
      setError(err.message || "Could not complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Headline */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Professional Headline</label>
        <div className="relative">
          <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="e.g. Full Stack Developer · Open to Work"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Short Bio</label>
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
          <textarea
            placeholder="Tell people a little about yourself..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Website / Portfolio</label>
        <div className="relative">
          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="url"
            placeholder="https://yourportfolio.dev"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Skills <span className="text-muted-foreground font-normal">(pick up to 8)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_LIST.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSkill(s)}
              disabled={!skills.includes(s) && skills.length >= 8}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all
                ${skills.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
            >
              {skills.includes(s) && <CheckCircle2 size={10} className="inline mr-1" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">What are you here for?</label>
        <p className="text-xs text-muted-foreground">"Hire Talent" select karne pe aap Recruiter ban jaoge</p>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGoal(g.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                ${goals.includes(g.id)
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-foreground/20 hover:bg-muted/30"
                }`}
            >
              <span className="text-xl">{g.emoji}</span>
              <span className="text-xs font-medium text-foreground">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Finishing setup...
          </>
        ) : (
          <>Complete Setup <ArrowRight size={15} /></>
        )}
      </Button>

      <button
        type="button"
        onClick={() => navigate("/feed")}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip for now
      </button>
    </form>
  );
};

export default OnboardingForm;