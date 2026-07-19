/**
 * Export array of data objects to CSV format.
 */
export const exportToCSV = (data, fileName = 'crm_leads') => {
  if (!data || !data.length) return;
  
  // Get headers from first object keys, excluding complex fields
  const sample = data[0];
  const keys = Object.keys(sample).filter(
    key => typeof sample[key] !== 'object' && key !== '__v'
  );
  
  const headers = keys.join(',') + '\n';
  const rows = data.map(row => 
    keys.map(key => {
      let val = row[key];
      let str = (val === null || val === undefined) ? '' : String(val);
      // Clean string
      str = str.replace(/"/g, '""');
      if (str.includes(',') || str.includes('\n')) {
        str = `"${str}"`;
      }
      return str;
    }).join(',')
  ).join('\n');
  
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate a printable page representing leads and analytics metrics, triggering window.print() to save as PDF.
 */
export const exportToPDF = (leads, metrics = {}, title = 'CRM Summary Report') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; }
          .header h1 { font-size: 26px; font-weight: 800; color: #1e293b; margin: 0; }
          .header p { font-size: 10px; color: #64748b; margin: 5px 0 0 0; font-family: monospace; }
          .kpis { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; margin-bottom: 45px; }
          .kpi-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; text-align: center; }
          .kpi-card span { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
          .kpi-card div { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 6px; }
          h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { background-color: #f1f5f9; color: #475569; font-weight: bold; font-size: 10px; text-transform: uppercase; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
          .badge-High { background-color: #fee2e2; color: #ef4444; }
          .badge-Medium { background-color: #fef3c7; color: #f59e0b; }
          .badge-Low { background-color: #dbeafe; color: #3b82f6; }
          .score { font-weight: bold; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleString()} · CRM SaaS Analytics Engine</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: #2563eb; font-size: 18px;">AeroCRM</div>
            <span style="font-size: 9px; color: #64748b;">Enterprise Workspace</span>
          </div>
        </div>
        
        <div class="kpis">
          <div class="kpi-card">
            <span>Weighted Pipeline</span>
            <div>$${(metrics.totalPipeline || 0).toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <span>Leads under management</span>
            <div>${leads.length}</div>
          </div>
          <div class="kpi-card">
            <span>Won Deals</span>
            <div>${leads.filter(l => l.status === 'Won').length}</div>
          </div>
          <div class="kpi-card">
            <span>Acquisition Conversion</span>
            <div>${metrics.conversionRate || 0}%</div>
          </div>
        </div>
        
        <h2>Leads Performance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Company</th>
              <th>Status</th>
              <th>AI Score</th>
              <th>Priority</th>
              <th>Acquisition Source</th>
              <th>Deal Value</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td><strong>${lead.name}</strong></td>
                <td>${lead.company}</td>
                <td>${lead.status || 'New'}</td>
                <td class="score">${lead.leadScore || 30}</td>
                <td><span class="badge badge-${lead.priority || 'Medium'}">${lead.priority || 'Medium'}</span></td>
                <td>${lead.source || 'Website'}</td>
                <td>$${(lead.value || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
