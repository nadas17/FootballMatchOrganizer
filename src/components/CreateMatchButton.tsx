
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";

const CreateMatchButton: React.FC = () => {
  const handleCreateMatch = () => {
    // Navigate to create match form - you can implement routing here
    console.log('Navigate to create match form');
  };

  return (
    <Button
      onClick={handleCreateMatch}
      className="group relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-green-800 hover:from-slate-800 hover:via-slate-700 hover:to-green-900 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-green-800/25 transition-all duration-500 transform hover:scale-105 animate-pulse-slow"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-slate-600 to-slate-800 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <Plus className="w-6 h-6 transition-transform duration-500 group-hover:rotate-180" />
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        <span className="text-lg font-orbitron">Yeni Maç Oluştur</span>
        
        <Zap className="w-5 h-5 text-green-300 animate-pulse" />
      </div>
      
      {/* Electric effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
    </Button>
  );
};

export default CreateMatchButton;
