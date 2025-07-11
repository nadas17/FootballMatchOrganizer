import React from 'react';

const MatchesPage = () => {
  return (
    <div className="min-h-screen profile-stadium-bg p-2 sm:p-4 pb-24 relative">
      <div className="stadium-lights"></div>
      <div className="max-w-6xl mx-auto py-3 sm:py-8 relative z-10">
        {/* Header */}
        <div className="glass-card p-3 sm:p-6 mb-4 sm:mb-8 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-glow">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-orbitron font-bold gradient-text">
                Matches
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm">
                Find and join football matches in your area
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Available Matches */}
          <div className="glass-card p-4 sm:p-8 rounded-xl">
            <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-6">
              Available Matches
            </h2>
            
            {/* Match Cards */}
            <div className="space-y-4">
              {[1, 2, 3].map((match) => (
                <div key={match} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold">Football Match #{match}</h3>
                      <p className="text-blue-200 text-sm">Central Park Field</p>
                    </div>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                      Open
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-blue-200">
                      <p>Players: 8/22</p>
                      <p>Time: 18:00</p>
                    </div>
                    <button className="glass-button-primary px-4 py-2 rounded-lg font-semibold transition-smooth text-sm">
                      Join Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Match */}
          <div className="glass-card p-4 sm:p-8 rounded-xl">
            <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-6">
              Create New Match
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Match Title
                </label>
                <input
                  type="text"
                  className="glass-input w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300"
                  placeholder="Enter match title"
                />
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="glass-input w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300"
                  placeholder="Enter location"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="glass-input w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    className="glass-input w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Max Players
                </label>
                <select className="glass-input w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white">
                  <option value="10">10 players</option>
                  <option value="14">14 players</option>
                  <option value="18">18 players</option>
                  <option value="22">22 players</option>
                </select>
              </div>
              
              <button className="w-full glass-button-primary py-3 rounded-lg font-semibold transition-smooth">
                Create Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesPage;