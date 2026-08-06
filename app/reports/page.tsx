'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Calendar, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  Printer,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import Navbar from '@/components/Navbar';
import { 
  CarbonReport, 
  EmissionSource, 
  EmissionCategory, 
  generateSuggestion 
} from '@/lib/emissions';
import { dataService } from '@/lib/supabase/client';

export default function ReportsPage() {
  const [reports, setReports] = useState<CarbonReport[]>([]);
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const r = await dataService.getCarbonReports();
      const s = await dataService.getEmissionSources();
      setReports(r);
      setSources(s);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const user = await dataService.getCurrentUser();
      const userId = user ? user.id : 'demo-user-123';
      const totalKg = sources.reduce((a, b) => a + b.co2e_kg, 0);

      const newReport = await dataService.createCarbonReport({
        period_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        total_emissions_kg: totalKg
      });

      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDFReport = (report: CarbonReport) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(46, 125, 50); // Forest Green
    doc.text("Footprint Carbon Audit Report", 20, 25);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Reference ID: ${report.id}`, 20, 33);
    doc.text(`Period: ${report.period_start} to ${report.period_end}`, 20, 40);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleDateString()}`, 20, 47);

    doc.setLineWidth(0.5);
    doc.setDrawColor(46, 125, 50);
    doc.line(20, 52, 190, 52);

    // Total Metric
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Executive Summary", 20, 65);

    doc.setFontSize(11);
    doc.text(`Total Measured Footprint: ${report.total_emissions_kg.toFixed(2)} kg CO2e`, 20, 75);

    // Breakdown
    let y = 95;
    doc.setFontSize(12);
    doc.text("Logged Activity Breakdown", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Category", 20, y);
    doc.text("Activity", 60, y);
    doc.text("Quantity", 120, y);
    doc.text("Impact (kg CO2e)", 160, y);
    
    y += 4;
    doc.line(20, y, 190, y);
    y += 8;

    sources.forEach((s) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(s.category, 20, y);
      doc.text((s.activity_label || s.activity_type).substring(0, 25), 60, y);
      doc.text(`${s.quantity} ${s.unit}`, 120, y);
      doc.text(`${s.co2e_kg.toFixed(2)}`, 160, y);
      y += 8;
    });

    doc.save(`carbon-report-${report.id.substring(0, 8)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-theme flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Carbon Reports & Audit
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Generate formal environmental reports and export PDFs for your records.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm shadow-md transition-all flex items-center space-x-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate New Report'}</span>
          </button>
        </div>

        {/* Current Active Period Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Monthly Performance Summary
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last 30 days active footprint snapshot
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total Footprint</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">
                {sources.reduce((a, b) => a + b.co2e_kg, 0).toFixed(1)} kg CO₂e
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Activities Count</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">
                {sources.length} entries
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Audit Status</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1.5">
                <CheckCircle2 className="w-5 h-5" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports History */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Generated Reports
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No reports generated yet. Click "Generate New Report" above.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((r) => (
                <div 
                  key={r.id}
                  className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-gray-50/50 dark:bg-zinc-800/40 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Period: {r.period_start} to {r.period_end}
                      </div>
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">
                        {r.total_emissions_kg.toFixed(2)} kg CO₂e
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.generated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-gray-200/60 dark:border-zinc-800">
                    <button
                      onClick={() => downloadPDFReport(r)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <a
                      href={`/api/reports/${r.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:border-gray-300 dark:hover:border-zinc-600 transition-all flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print View</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
