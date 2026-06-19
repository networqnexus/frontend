import { memo } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RightSidebar from "./RightSidebar";

const MainLayout = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 gap-6 pt-4 pb-8">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20"><Sidebar /></div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
        <aside className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-20"><RightSidebar /></div>
        </aside>
      </div>
    </div>
  );
});

MainLayout.displayName = "MainLayout";
export default MainLayout;
