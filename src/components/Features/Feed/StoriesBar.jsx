import { useState } from "react";
import { Plus } from "lucide-react";
import { STORIES, CURRENT_USER } from "./feedData";

const StoriesBar = () => {
  const [stories, setStories] = useState(STORIES);

  const markSeen = (id) => {
    setStories(s => s.map(st => st.id === id ? { ...st, seen: true } : st));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {/* Add story */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/30 hover:bg-muted transition-colors">
            <Plus size={20} className="text-muted-foreground" />
          </button>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">Add story</span>
        </div>

        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
            onClick={() => markSeen(story.id)}
          >
            <div className={`w-14 h-14 rounded-full p-[2px] ${story.seen ? "bg-muted" : "bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400"}`}>
              <div className="w-full h-full rounded-full bg-card p-[2px]">
                <div className={`w-full h-full rounded-full ${story.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {story.initials}
                </div>
              </div>
            </div>
            <span className={`text-[10px] whitespace-nowrap ${story.seen ? "text-muted-foreground" : "text-foreground font-medium"}`}>
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
