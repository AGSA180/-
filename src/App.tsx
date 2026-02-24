import React, { useState, useRef, useEffect } from 'react';
import { Search, Target, BarChart3, Loader2, Sparkles, ClipboardCopy, Check, Printer, Info, HelpCircle, Download } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateKPIs, generateImprovementPlan, generatePerformanceReport } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'report'>('generate');
  const [practice, setPractice] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [kpiResults, setKpiResults] = useState('');
  const [improvementPlan, setImprovementPlan] = useState<string | null>(null);
  const [reportData, setReportData] = useState('');
  const [performanceReport, setPerformanceReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  useEffect(() => {
    if (improvementPlan && planRef.current) {
      planRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [improvementPlan]);

  useEffect(() => {
    if (performanceReport && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [performanceReport]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practice.trim()) return;

    setLoading(true);
    try {
      const output = await generateKPIs(practice);
      setResult(output || "عذراً، لم يتمكن النظام من توليد النتائج. حاول مرة أخرى.");
    } catch (error) {
      console.error(error);
      setResult("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التحقق من المفتاح البرمجي.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiResults.trim()) return;

    setLoadingPlan(true);
    try {
      const output = await generateImprovementPlan(kpiResults);
      setImprovementPlan(output || "عذراً، لم يتمكن النظام من بناء الخطة. حاول مرة أخرى.");
    } catch (error) {
      console.error(error);
      setImprovementPlan("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.trim()) return;

    setLoadingReport(true);
    try {
      const output = await generatePerformanceReport(reportData);
      setPerformanceReport(output || "فشل في توليد التقرير.");
    } catch (error) {
      console.error(error);
      setPerformanceReport("حدث خطأ أثناء توليد التقرير.");
    } finally {
      setLoadingReport(false);
    }
  };

  const copyToClipboard = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 relative" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50"
          >
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
              <span className="font-medium">تم نسخ المحتوى بنجاح!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"
            >
              <Target size={24} />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">أداء ذكي</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Smart Performance</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('generate')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                activeTab === 'generate' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              توليد مؤشرات
            </button>
            <button 
              onClick={() => setActiveTab('improve')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                activeTab === 'improve' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              خطة تحسين
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                activeTab === 'report' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              تقرير أداء
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {activeTab === 'generate' && (
          <>
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 no-print"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-6 leading-snug">
                مؤشرات أداء ذكية للتحسين
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                أدخل الممارسة أو المسمى الوظيفي، وسيقوم النظام بتحليلها ووضع مجالات ومؤشرات أداء احترافية.
              </p>
            </motion.div>

            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 no-print"
            >
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative">
                  <label htmlFor="practice" className="block text-sm font-semibold text-slate-700 mb-2 mr-1">
                    الممارسة أو المسمى الوظيفي
                  </label>
                  <div className="relative group">
                    <input
                      id="practice"
                      type="text"
                      value={practice}
                      onChange={(e) => setPractice(e.target.value)}
                      placeholder="مثال: خدمة العملاء، مدير مبيعات، تطوير البرمجيات..."
                      className="w-full h-14 pr-12 pl-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none text-lg shadow-inner"
                      required
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || !practice.trim()}
                  className={cn(
                    "w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100",
                    loading && "animate-pulse"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      جاري التحليل والتوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      توليد المؤشرات
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  ref={resultsRef}
                  id="kpi-results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-20 mb-12"
                >
                  <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <BarChart3 size={18} className="text-indigo-600" />
                      النتائج المقترحة
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportPDF('kpi-results', `KPIs-${practice || 'Results'}`)}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                        title="تحميل PDF"
                      >
                        <Download size={16} />
                        PDF
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        <Printer size={16} />
                        طباعة
                      </button>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <ClipboardCopy size={16} />}
                        {copied ? 'تم النسخ' : 'نسخ'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="markdown-body text-slate-800">
                      <Markdown>{result}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeTab === 'improve' && (
          <>
            {/* Improvement Plan Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 no-print"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-6 leading-snug">
                حول نتائجك إلى خطة تحسين ملموسة
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                أدخل نتائج مؤشراتك الحالية (المستهدف مقابل الفعلي)، وسيقوم النظام بتحليل الفجوات واقتراح مبادرات تحسين احترافية.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 no-print"
            >
              <form onSubmit={handleImprove} className="space-y-4">
                <div>
                  <label htmlFor="results" className="block text-sm font-semibold text-slate-700 mb-2 mr-1">
                    نتائج المؤشرات (المستهدف والفعلي)
                  </label>
                  <textarea
                    id="results"
                    rows={6}
                    value={kpiResults}
                    onChange={(e) => setKpiResults(e.target.value)}
                    placeholder="مثال:&#10;مؤشر رضا العملاء: المستهدف 90%، الفعلي 75%&#10;وقت الاستجابة: المستهدف 24 ساعة، الفعلي 30 ساعة..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-lg resize-none"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loadingPlan || !kpiResults.trim()}
                  className={cn(
                    "w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100",
                    loadingPlan && "animate-pulse"
                  )}
                >
                  {loadingPlan ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      جاري بناء خطة التحسين...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      بناء خطة التحسين
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <AnimatePresence>
              {improvementPlan && (
                <motion.div 
                  ref={planRef}
                  id="improvement-plan"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-20 mb-12"
                >
                  <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <BarChart3 size={18} className="text-indigo-600" />
                      خطة التحسين المقترحة
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportPDF('improvement-plan', 'Improvement-Plan')}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                        title="تحميل PDF"
                      >
                        <Download size={16} />
                        PDF
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        <Printer size={16} />
                        طباعة
                      </button>
                      <button
                        onClick={() => copyToClipboard(improvementPlan)}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <ClipboardCopy size={16} />}
                        {copied ? 'تم النسخ' : 'نسخ'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="markdown-body text-slate-800">
                      <Markdown>{improvementPlan}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeTab === 'report' && (
          <>
            {/* Performance Report Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 no-print"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-6 leading-snug">
                إعداد تقرير أداء احترافي
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                أدخل بيانات المؤشرات والنتائج المحققة، وسيقوم النظام بتنظيمها في تقرير أداء متكامل قابل للطباعة.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 no-print"
            >
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <label htmlFor="reportData" className="block text-sm font-semibold text-slate-700 mb-2 mr-1">
                    بيانات المؤشرات والنتائج
                  </label>
                  <textarea
                    id="reportData"
                    rows={6}
                    value={reportData}
                    onChange={(e) => setReportData(e.target.value)}
                    placeholder="أدخل المؤشرات ونتائجها هنا (مثال: رضا العملاء 80%، المبيعات 500 ألف...)"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none text-lg resize-none shadow-inner"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loadingReport || !reportData.trim()}
                  className={cn(
                    "w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100",
                    loadingReport && "animate-pulse"
                  )}
                >
                  {loadingReport ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      جاري إعداد التقرير...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={20} />
                      توليد تقرير الأداء
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <AnimatePresence>
              {performanceReport && (
                <motion.div 
                  ref={reportRef}
                  id="performance-report"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-20 mb-12"
                >
                  <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <BarChart3 size={18} className="text-emerald-600" />
                      تقرير الأداء النهائي
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportPDF('performance-report', 'Performance-Report')}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                        title="تحميل PDF"
                      >
                        <Download size={16} />
                        PDF
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        <Printer size={16} />
                        طباعة
                      </button>
                      <button
                        onClick={() => copyToClipboard(performanceReport)}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 flex items-center gap-1 text-sm"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <ClipboardCopy size={16} />}
                        {copied ? 'تم النسخ' : 'نسخ'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="markdown-body text-slate-800">
                      <Markdown>{performanceReport}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Features Grid */}
        {!result && !loading && !improvementPlan && !loadingPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 no-print"
          >
            {[
              {
                title: "معايير SMART",
                desc: "مؤشرات محددة، قابلة للقياس، واقعية، ومرتبطة بزمن.",
                icon: <Target className="text-indigo-600" />
              },
              {
                title: "مجالات الأداء (KPA)",
                desc: "تحديد المجالات الحيوية التي تساهم في نجاح الممارسة.",
                icon: <BarChart3 className="text-indigo-600" />
              },
              {
                title: "دقة الذكاء الاصطناعي",
                desc: "تحليل عميق للممارسات بناءً على أفضل المعايير العالمية.",
                icon: <Sparkles className="text-indigo-600" />
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* How it works section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-indigo-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative no-print"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <HelpCircle size={22} className="text-indigo-300" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">كيف تعمل الأداة؟</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">تحليل الممارسة</h3>
                    <p className="text-indigo-100/80 text-sm">يقوم الذكاء الاصطناعي بفهم طبيعة الدور الوظيفي أو الممارسة المدخلة وسياقها الاستراتيجي.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">تحديد مجالات الأداء (KPA)</h3>
                    <p className="text-indigo-100/80 text-sm">يتم استخراج المجالات الرئيسية التي تؤثر بشكل مباشر على النجاح في هذه الممارسة.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">صياغة المؤشرات (KPI)</h3>
                    <p className="text-indigo-100/80 text-sm">بناء مؤشرات ذكية (SMART) تشمل التعريف، المعادلة الرياضية، ودورية القياس المناسبة.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">خطة التحسين</h3>
                    <p className="text-indigo-100/80 text-sm">تحليل الفجوات بين المستهدف والفعلي واقتراح مبادرات عملية لسد هذه الفجوات.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Info size={16} className="text-indigo-300" />
                  لماذا تستخدم "أداء ذكي"؟
                </h3>
                <ul className="space-y-3 text-sm text-indigo-50">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-400 mt-0.5" />
                    توفير ساعات من البحث والاجتماعات في صياغة المؤشرات.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-400 mt-0.5" />
                    الحصول على صياغة علمية دقيقة تتبع أفضل الممارسات.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-400 mt-0.5" />
                    دعم اتخاذ القرار بناءً على بيانات قابلة للقياس الفعلي.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </motion.section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-200 mt-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} أداء ذكي - جميع الحقوق محفوظة</p>
        <p className="mt-1 font-medium text-slate-700">إعداد وفكرة عبدالله جمعان الشهري</p>
      </footer>
    </div>
  );
}
