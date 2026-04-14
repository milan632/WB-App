import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Calendar, ExternalLink, X, AlertCircle, Loader2, MapPin, GraduationCap, Users, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/1PK2Wy7CNi2O9rNgvxV3MtOyN62qYZK6S9DHS66gu1V8/export?format=csv&gid=0";

interface Scholarship {
  Name: string;
  State: string;
  Class: string;
  Caste: string;
  Income: string;
  Amount: string;
  LastDate: string;
  Link: string;
  DocsHinglish: string;
  LastChecked: string;
}

export default function App() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    state: 'All',
    class: 'All',
    caste: 'All',
    income: 'All'
  });
  const [selected, setSelected] = useState<Scholarship | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        Papa.parse(CSV_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              setScholarships(results.data as Scholarship[]);
            } else {
              setError("No data found");
            }
            setLoading(false);
          },
          error: (err) => {
            console.error(err);
            setError("Sheet link galat hai ya public nahi hai. Share settings check karo.");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error(err);
        setError("Sheet link galat hai ya public nahi hai. Share settings check karo.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueStates = useMemo(() => {
    const states = new Set(scholarships.map(s => s.State).filter(Boolean));
    return ['All', ...Array.from(states)];
  }, [scholarships]);

  const classOptions = ['All', '9-10', '11-12', 'UG', 'PG', '9-PG', '11-PG', '1-PG'];
  const casteOptions = ['All', 'SC', 'ST', 'OBC', 'Minority', 'EWS', 'General'];
  const incomeOptions = ['All', '<1L', '<1.5L', '<2L', '<2.5L'];

  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      // Search logic
      const searchMatch = !search || 
        s.Name?.toLowerCase().includes(search.toLowerCase()) ||
        s.Class?.toLowerCase().includes(search.toLowerCase()) ||
        s.Caste?.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;

      // Filter logic
      if (filters.state !== 'All' && s.State !== filters.state) return false;
      if (filters.caste !== 'All' && s.Caste !== filters.caste) return false;
      if (filters.income !== 'All' && s.Income !== filters.income) return false;

      // Class filter logic
      if (filters.class !== 'All') {
        const selectedClass = filters.class;
        const scholarshipClass = s.Class || '';
        
        if (!scholarshipClass.includes(selectedClass) && !selectedClass.includes(scholarshipClass)) {
          if (selectedClass === '9-10' && (scholarshipClass.includes('9') || scholarshipClass.includes('10'))) return true;
          if (selectedClass === '11-12' && (scholarshipClass.includes('11') || scholarshipClass.includes('12'))) return true;
          return false;
        }
      }

      return true;
    });
  }, [scholarships, search, filters]);

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return null;
    const deadline = new Date(dateStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-xl font-medium text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600">WB Scholarship Finder</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Class 9 se PG tak ke liye</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Scholarship ya class search karo..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
            <div className="flex-shrink-0 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">State</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.state}
                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              >
                {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-shrink-0 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Class</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              >
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-shrink-0 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Caste</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.caste}
                onChange={(e) => setFilters(prev => ({ ...prev, caste: e.target.value }))}
              >
                {casteOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-shrink-0 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Income</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.income}
                onChange={(e) => setFilters(prev => ({ ...prev, income: e.target.value }))}
              >
                {incomeOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filteredScholarships.length}</span> scholarships
          </p>
          {(search || filters.state !== 'All' || filters.class !== 'All' || filters.caste !== 'All' || filters.income !== 'All') && (
            <button 
              onClick={() => {
                setSearch('');
                setFilters({ state: 'All', class: 'All', caste: 'All', income: 'All' });
              }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredScholarships.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((s, idx) => {
              const daysLeft = getDaysLeft(s.LastDate);
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(s)}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                          {s.State}
                        </span>
                        <span className="bg-purple-50 text-purple-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                          {s.Class}
                        </span>
                      </div>
                      {daysLeft !== null && daysLeft <= 30 && daysLeft >= 0 && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          ⚠️ {daysLeft} din bache
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2">
                      {s.Name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Wallet className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-semibold text-green-600">{s.Amount}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Deadline: <span className={daysLeft !== null && daysLeft <= 30 ? 'text-red-600 font-medium' : ''}>{s.LastDate || 'N/A'}</span></span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(s);
                    }}
                  >
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No scholarships match your search.</p>
            <button 
              onClick={() => {
                setSearch('');
                setFilters({ state: 'All', class: 'All', caste: 'All', income: 'All' });
              }}
              className="mt-4 text-blue-600 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-gray-400 text-sm">
        <p>Last updated: 14 Apr 2026 | Made for WB Students</p>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900 pr-8">{selected.Name}</h2>
                <button 
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem icon={<MapPin className="text-blue-500" />} label="State" value={selected.State} />
                  <DetailItem icon={<GraduationCap className="text-purple-500" />} label="Class" value={selected.Class} />
                  <DetailItem icon={<Users className="text-orange-500" />} label="Caste" value={selected.Caste} />
                  <DetailItem icon={<Wallet className="text-green-500" />} label="Income" value={selected.Income} />
                  <DetailItem icon={<Calendar className="text-red-500" />} label="Last Date" value={selected.LastDate} />
                  <DetailItem icon={<AlertCircle className="text-gray-500" />} label="Last Checked" value={selected.LastChecked} />
                </div>

                <div className="bg-blue-50 rounded-2xl p-5">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> Scholarship Amount
                  </h4>
                  <p className="text-blue-700 text-lg font-semibold">{selected.Amount}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Documents Required (Hinglish)</h4>
                  <div className="bg-gray-50 rounded-2xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selected.DocsHinglish || "No details provided."}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setSelected(null)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a 
                  href={selected.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[2] bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Apply Now <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/30">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
