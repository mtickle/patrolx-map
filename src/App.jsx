import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Activity, Rocket, Info, Home as HomeIcon } from 'lucide-react';
import { ErrorBoundary } from '@components/ErrorBoundary';

function Home() {
  const [count, setCount] = useState(0);
  const appName = import.meta.env.VITE_APP_NAME || "Vite + React";

  return (
    <div className="relative z-10 text-center">
      <div className="inline-flex items-center justify-center p-2 bg-slate-800 rounded-lg mb-6 border border-slate-700">
        <Activity className="w-4 h-4 text-green-500 animate-pulse mr-2" />
        <span className="text-xs font-mono text-slate-400">SYSTEM ONLINE</span>
      </div>

      <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
        {appName}
      </h1>
      
      <p className="text-slate-400 mb-8 text-lg">
        Zero config. Maximum speed. <br/>
        <span className="text-sm opacity-50">Tailwind v4 + Vite + GitHub Actions + Router</span>
      </p>

      <button 
        onClick={() => setCount(c => c + 1)}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white text-slate-950 font-bold rounded-lg transition-all hover:bg-cyan-50 hover:scale-[1.02] active:scale-[0.98] mb-4"
      >
        <Rocket className="w-5 h-5" />
        Deployments Count: {count}
      </button>

      <Link to="/about" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
        <Info className="w-4 h-4" />
        View About Page
      </Link>
    </div>
  );
}

function About() {
  return (
    <div className="relative z-10 text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">About This App</h2>
      <p className="text-slate-400 mb-8">This route was rendered perfectly using HashRouter, which guarantees it will not break when deployed to GitHub Pages.</p>
      <Link to="/" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
        <HomeIcon className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500 blur-3xl opacity-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-violet-500 blur-3xl opacity-10 pointer-events-none"></div>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </HashRouter>
        </div>
      </div>
    </ErrorBoundary>
  );
}
