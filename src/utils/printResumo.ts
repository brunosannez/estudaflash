/**
 * Utility to print/save a resumo as PDF using browser's native print dialog.
 */
export function printResumo(title: string, content: string, date: string) {
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Convert basic markdown-like formatting to HTML
  const formatContentToHtml = (text: string): string => {
    return text
      .split('\n')
      .map((line) => {
        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
        if (line.startsWith('• ') || line.startsWith('- '))
          return `<li>${line.substring(2)}</li>`;
        if (line.includes('**')) {
          const formatted = line.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
          );
          return `<p>${formatted}</p>`;
        }
        if (line.trim() === '') return '<br/>';
        return `<p>${line}</p>`;
      })
      .join('\n');
  };

  const htmlContent = formatContentToHtml(content);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup bloqueado! Permita popups para imprimir/salvar PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${title} - Estuda Flash</title>
      <style>
        @page {
          margin: 2cm;
          size: A4;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #1a1a1a;
          line-height: 1.7;
          font-size: 12pt;
          padding: 0;
        }
        .header {
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 {
          font-size: 22pt;
          color: #1e1b4b;
          margin-bottom: 4px;
          font-weight: 700;
        }
        .header .meta {
          font-size: 10pt;
          color: #6b7280;
        }
        h1 { font-size: 18pt; color: #1e1b4b; margin: 20px 0 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
        h2 { font-size: 15pt; color: #059669; margin: 16px 0 8px; }
        h3 { font-size: 13pt; color: #d97706; margin: 12px 0 6px; }
        p { margin: 6px 0; text-align: justify; }
        li { margin: 4px 0 4px 20px; list-style-type: disc; }
        strong { color: #1e1b4b; }
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 9pt;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding: 8px 0;
        }
        @media print {
          .footer { position: fixed; bottom: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📚 ${title}</h1>
        <div class="meta">Criado em ${formattedDate} • Gerado por Estuda Flash</div>
      </div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        Gerado por Estuda Flash — estudaflash.vercel.app
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to render before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback for browsers that don't fire onload reliably
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}
