"use client";
import { useState } from 'react';
import { Play, RotateCcw, BarChart3 } from 'lucide-react';
import { rollForGift } from '@/actions/surprise';

export default function GiftSimulator() {
  const [results, setResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async (count = 1) => {
    setIsSimulating(true);
    const newResults = [];
    
    for (let i = 0; i < count; i++) {
      // Simulating a random order value
      const win = await rollForGift(2500);
      newResults.push(win ? win.code : "NO WIN");
    }

    setResults(prev => [...newResults, ...prev]);
    setIsSimulating(false);
  };

  const stats = results.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-12 p-8 bg-[#3E442B] rounded-[3rem] text-white shadow-2xl">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#FBB6E6]">
            Probability <span className="text-[#EA638C]">Simulator</span>
          </h3>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Test luck settings against ৳2,500 orders
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => runSimulation(1)}
            disabled={isSimulating}
            className="px-6 py-3 bg-white/10 hover:bg-[#EA638C] rounded-2xl text-[10px] font-black uppercase transition-all"
          >
            Roll Once
          </button>
          <button 
            onClick={() => runSimulation(10)}
            disabled={isSimulating}
            className="px-6 py-3 bg-[#EA638C] hover:scale-105 rounded-2xl text-[10px] font-black uppercase transition-all"
          >
            Run x10
          </button>
          <button 
            onClick={() => setResults([])}
            className="p-3 transition-all bg-white/5 hover:bg-white/10 rounded-2xl"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          {Object.entries(stats).map(([code, count]) => (
            <div key={code} className="flex items-center justify-between p-4 border bg-white/5 rounded-2xl border-white/10">
              <span className={`text-[10px] font-black uppercase ${code === 'NO WIN' ? 'text-white/40' : 'text-[#EA638C]'}`}>
                {code}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black">{count} hits</span>
                <span className="text-[10px] font-bold text-white/20">
                  {results.length > 0 ? Math.round((count / results.length) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/20 rounded-[2rem] p-6 max-h-[200px] overflow-y-auto">
          <p className="text-[8px] font-black text-white/20 uppercase mb-4 tracking-widest">Live Log</p>
          <div className="space-y-2">
            {results.map((res, i) => (
              <div key={i} className="flex items-center gap-3 text-[10px] font-bold">
                <span className={res === 'NO WIN' ? 'text-white/30' : 'text-[#EA638C]'}>
                  {res === 'NO WIN' ? '○ Miss' : `★ Won ${res}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}