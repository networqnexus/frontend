import { memo, useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RightSidebar from "./RightSidebar";

const MainLayout = memo(({ children, hideRightSidebar = false }) => {
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1 mx-auto w-full px-3 sm:px-8 lg:px-3 xl:px-8 lg:gap-4 xl:gap-9 pt-2 sm:pt-8 pb-2 sm:pb-8">

        {/* Left sidebar — desktop */}
        <aside className="hidden lg:block lg:w-44 xl:w-60 shrink-0 scrollbar-hide">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
            <Sidebar />
          </div>
        </aside>

        <main className="flex-1 min-w-0 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
          {children}
        </main>

        {/* Right sidebar — desktop */}
        {!hideRightSidebar && (
          <aside className="hidden lg:block lg:w-52 xl:w-72 shrink-0">
            <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hid">
              <RightSidebar />
            </div>
          </aside>
        )}
      </div>

      {/* ── Tablet drawer triggers (hidden on lg+) ── */}
      <button
        className="lg:hidden fixed left-0 top-16 z-30 bg-card border border-border border-l-0 rounded-r-lg px-1 py-3 shadow-md text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setLeftOpen(true)}
      >
        <ChevronRight size={15} />
      </button>

      <button
        className="lg:hidden fixed right-0 top-16 z-30 bg-card border border-border border-r-0 rounded-l-lg px-1 py-3 shadow-md text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setRightOpen(true)}
      >
        <ChevronLeft size={15} />
      </button>

      {/* ── Left drawer ── */}
      {leftOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" onClick={() => setLeftOpen(false)} />
          <div
            className="lg:hidden fixed top-0 left-0 h-full w-80 sm:w-96 bg-background border-r border-border z-50 flex flex-col"
            style={{ animation: "slideInLeft 0.22s ease-out" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button onClick={() => setLeftOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <Sidebar onNavigate={() => setLeftOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* ── Right drawer ── */}
      {rightOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" onClick={() => setRightOpen(false)} />
          <div
            className="lg:hidden fixed top-0 right-0 h-full w-80 sm:w-96 bg-background border-l border-border z-50 flex flex-col"
            style={{ animation: "slideInRight 0.22s ease-out" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-semibold text-foreground">Discover</span>
              <button onClick={() => setRightOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <RightSidebar />
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
});

MainLayout.displayName = "MainLayout";
export default MainLayout;
