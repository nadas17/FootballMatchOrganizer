import { Leaderboard as LeaderboardComponent } from "@/components/Leaderboard";
import FluidGlassNav from "@/components/FluidGlassNav";
import { ActivityFeed } from "@/components/ActivityFeed";

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 py-12 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron">
            🏆 Player Leaderboard
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Top players ranked by stars earned in matches
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - Main Section */}
          <div className="lg:col-span-2">
            <LeaderboardComponent limit={50} showFullPage={true} />
          </div>

          {/* Activity Feed - Sidebar */}
          <div className="lg:col-span-1">
            <ActivityFeed limit={15} />
          </div>
        </div>
      </div>

      <FluidGlassNav />
    </div>
  );
};

export default Leaderboard;
