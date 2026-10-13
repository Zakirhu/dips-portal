import { StudyMaterial } from '../types';

/**
 * Formats chapter markdown content into clean, print-ready HTML
 */
export const formatMarkdownToHtml = (content: string): string => {
  return content
    .replace(/^### (.*$)/gim, '<h3 style="color:#0f172a; margin-top:20px; margin-bottom:8px; font-size:16px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#1e3a8a; margin-top:24px; margin-bottom:10px; font-size:18px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; margin-top:28px; margin-bottom:12px; font-size:22px; border-bottom:2px solid #3b82f6; padding-bottom:6px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code style="background:#f1f5f9; padding:2px 5px; border-radius:4px; font-family:monospace; font-size:12px; color:#0f172a;">$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #f59e0b; background:#fffbeb; padding:10px 14px; margin:14px 0; border-radius:0 8px 8px 0; color:#92400e; font-size:13px;">$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li style="margin-bottom:5px;">$1</li>')
    .replace(/\n\n/gim, '<p style="margin-bottom:12px; line-height:1.6;"></p>');
};

/**
 * Builds the complete A4 printable HTML document for a chapter study material.
 */
export const buildChapterPDFDocument = (material: StudyMaterial): string => {
  const formattedContent = formatMarkdownToHtml(material.content);

  const keyQuestionsHtml = material.keyQuestions && material.keyQuestions.length > 0
    ? `
      <div style="margin-top:30px; page-break-inside:avoid; border:1px solid #cbd5e1; border-radius:8px; padding:16px; background:#f8fafc;">
        <h3 style="color:#1e293b; margin-top:0; font-size:16px; border-bottom:1.5px solid #cbd5e1; padding-bottom:6px;">
          📝 Important CBSE Board Questions & Answers
        </h3>
        ${material.keyQuestions.map((kq, idx) => `
          <div style="margin-bottom:14px; padding-bottom:10px; border-bottom:1px dashed #e2e8f0;">
            <p style="margin:0 0 4px 0; font-weight:bold; color:#0f172a; font-size:13px;">
              Q${idx + 1}. ${kq.question} <span style="color:#2563eb; font-size:11px;">(${kq.marks} Mark${kq.marks > 1 ? 's' : ''})</span>
            </p>
            <p style="margin:0; color:#334155; font-size:12.5px; line-height:1.5;">
              <strong>Answer:</strong> ${kq.answer}
            </p>
          </div>
        `).join('')}
      </div>
    `
    : '';

  const codeSnippetHtml = material.codeSnippet
    ? `
      <div style="margin:20px 0; page-break-inside:avoid; background:#0f172a; color:#f8fafc; border-radius:8px; padding:14px; font-family:monospace; font-size:12px;">
        <div style="color:#94a3b8; font-size:11px; margin-bottom:8px; text-transform:uppercase;">
          💻 Practical Code Example (${material.codeSnippet.language})
        </div>
        <pre style="margin:0; overflow-x:auto;">${material.codeSnippet.code}</pre>
        ${material.codeSnippet.output ? `
          <div style="margin-top:10px; padding-top:8px; border-top:1px solid #334155; color:#34d399;">
            Output:<br/>${material.codeSnippet.output}
          </div>
        ` : ''}
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${material.downloadableFileName || material.title}</title>
    <style>
      @page {
        size: A4;
        margin: 18mm 16mm 18mm 16mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
        padding: 24px;
        background: #ffffff;
      }
      .header-table {
        width: 100%;
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }
      .logo-text {
        font-size: 20px;
        font-weight: 800;
        color: #0c3470;
        margin: 0;
      }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        background: #e0f2fe;
        color: #0369a1;
        font-weight: 700;
        border-radius: 4px;
        font-size: 11px;
        text-transform: uppercase;
      }
      .meta-bar {
        display: flex;
        justify-content: space-between;
        background: #f1f5f9;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 18px;
        font-size: 11.5px;
        color: #475569;
      }
      .footer-section {
        margin-top: 35px;
        padding-top: 15px;
        border-top: 1.5px solid #cbd5e1;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        page-break-inside: avoid;
      }
      .content-body h1, .content-body h2, .content-body h3 {
        page-break-after: avoid;
      }
      .content-body p, .content-body li {
        color: #334155;
      }
      @media print {
        .no-print { display: none !important; }
        body { padding: 0; background: white; }
      }
    </style>
  </head>
  <body>
    <!-- Official Header -->
    <table class="header-table">
      <tr>
        <td style="vertical-align:middle;">
          <h1 class="logo-text">ZAKIR LEARNING HUB</h1>
          <p style="margin:2px 0 0 0; font-size:11.5px; color:#475569;">
            Computer Science & Information Technology Curriculum
          </p>
        </td>
        <td style="text-align:right; vertical-align:middle;">
          <span class="badge">Class ${material.classLevel}</span>
          <p style="margin:4px 0 0 0; font-size:11px; color:#64748b; font-weight:600;">
            Curated by Mr. Zakir Hussain
          </p>
        </td>
      </tr>
    </table>

    <!-- Metadata Bar -->
    <div class="meta-bar">
      <div>
        <strong>Subject:</strong> ${material.subjectId.toUpperCase()} • 
        <strong>Chapter:</strong> ${material.chapterTitle}
      </div>
      <div>
        <strong>Date:</strong> ${material.uploadedDate} • 
        <strong>Type:</strong> ${material.type.replace('_', ' ').toUpperCase()}
      </div>
    </div>

    <!-- Chapter Title -->
    <h2 style="font-size:22px; color:#0f172a; margin:0 0 10px 0;">
      ${material.title}
    </h2>
    <p style="color:#64748b; font-size:12.5px; margin:0 0 20px 0; font-style:italic;">
      ${material.description}
    </p>

    <!-- Main Body -->
    <div class="content-body">
      ${formattedContent}
    </div>

    <!-- Code Snippet (if available) -->
    ${codeSnippetHtml}

    <!-- Key Questions & Solutions -->
    ${keyQuestionsHtml}

    <!-- Official Certification Footer -->
    <div class="footer-section">
      <div>
        <p style="margin:0; font-size:11px; color:#64748b;">
          Curriculum Track: <strong>Computer Science & Information Technology</strong>
        </p>
        <p style="margin:2px 0 0 0; font-size:10px; color:#94a3b8;">
          Document ID: ${material.id} • Zakir Learning Hub Portal
        </p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0; font-family:serif; font-style:italic; font-weight:800; font-size:16px; color:#0c3470;">
          Mr. Zakir Hussain
        </p>
        <p style="margin:2px 0 0 0; font-size:11px; font-weight:bold; color:#1e293b;">
          Mr. Zakir Hussain
        </p>
        <p style="margin:0; font-size:10px; color:#64748b;">
          PGT Computer Science & IT Specialist
        </p>
      </div>
    </div>
  </body>
</html>`;
};

/**
 * Downloads or prints the study material as a PDF document.
 * If material has an attached PDF file (pdfDataUrl), downloads the binary directly.
 * Otherwise creates a print-ready document and triggers system print/save as PDF.
 */
export const downloadChapterPDF = (material: StudyMaterial): void => {
  // Case 1: Real PDF data attached
  if (material.pdfDataUrl) {
    const a = document.createElement('a');
    a.href = material.pdfDataUrl;
    a.download = material.downloadableFileName || `${material.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Case 2: Rendered PDF document using hidden iframe to avoid popup block
  const html = buildChapterPDFDocument(material);
  
  // Try hidden iframe print
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 400);
      return;
    }
  } catch (err) {
    console.warn('Iframe print failed, falling back to blob download', err);
  }

  // Case 3: HTML Blob download as fallback
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${material.downloadableFileName?.replace('.pdf', '') || material.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyMaterial.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
