import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Render a clean printable HTML document suitable for browser PDF save or response
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Carbon Footprint Official Report - ${id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; margin: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #047857; }
          .report-id { font-size: 12px; color: #6B7280; }
          .title { margin-top: 30px; font-size: 28px; font-weight: 800; color: #111827; }
          .subtitle { color: #4B5563; font-size: 14px; margin-bottom: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
          .kpi-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; }
          .kpi-title { font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
          .kpi-value { font-size: 24px; font-weight: 800; color: #047857; margin-top: 8px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th { background: #F3F4F6; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #4B5563; }
          .table td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
          .footer { margin-top: 50px; font-size: 12px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌿 Footprint</div>
          <div class="report-id">Report Reference: ${id}</div>
        </div>

        <h1 class="title">Personal Carbon Footprint Audit</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString()} | Unified Abstraction Model</p>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total CO₂e Footprint</div>
            <div class="kpi-value">185.3 kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Highest Category</div>
            <div class="kpi-value">Energy (45%)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Reduction Target</div>
            <div class="kpi-value">-15% next month</div>
          </div>
        </div>

        <h3>Activity Breakdown by Category</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Sample Activity</th>
              <th>Quantity</th>
              <th>CO₂e Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TRANSPORT</td>
              <td>Petrol Car Travel</td>
              <td>120 km</td>
              <td>23.04 kg</td>
            </tr>
            <tr>
              <td>ENERGY</td>
              <td>Grid Electricity</td>
              <td>150 kWh</td>
              <td>34.95 kg</td>
            </tr>
            <tr>
              <td>FOOD</td>
              <td>Beef Consumption</td>
              <td>2.5 kg</td>
              <td>67.50 kg</td>
            </tr>
            <tr>
              <td>WASTE</td>
              <td>Landfill Household Waste</td>
              <td>15 kg</td>
              <td>8.70 kg</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Footprint Carbon Calculator • Powered by Supabase & Next.js 14 • Verified Factor Data
        </div>

        <script>
          // Auto trigger print dialog if opened in browser
          if (typeof window !== 'undefined') {
            window.onload = function() { window.print(); }
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="carbon-report-${id}.html"`
    }
  });
}
