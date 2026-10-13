import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { LearningResource } from '../../types';

interface LmsPdfViewerModalProps {
  resource: LearningResource | null;
  onClose: () => void;
}

export const LmsPdfViewerModal: React.FC<LmsPdfViewerModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const totalPages = resource.pageCount || 10;

  const handleDownload = () => {
    if (resource.fileUrl && resource.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Generate downloadable text / html blob if no raw binary
    const contentToSave = resource.content || `# ${resource.title}\n\n${resource.description}\n\nClass: ${resource.classLevel}\nChapter: ${resource.chapterTitle || ''}\nEducator: Zakir Hussain\n\n${resource.content || ''}`;
    const blob = new Blob([contentToSave], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
        isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-5xl h-[92vh]'
      }`}>
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {resource.title}
              </h2>
              <p className="text-xs text-slate-400 truncate flex items-center gap-2">
                <span>Class {resource.classLevel}</span>
                <span>•</span>
                <span>{resource.chapterTitle || 'Chapter Resource'}</span>
                {resource.fileSize && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-mono text-[11px]">{resource.fileSize}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 text-slate-300">
              <button
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs px-2 font-mono">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Reader Area */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-4 sm:p-8 flex justify-center">
          {resource.fileUrl && resource.fileUrl.startsWith('data:application/pdf') ? (
            <iframe
              src={resource.fileUrl}
              title={resource.title}
              className="w-full h-full rounded-lg shadow-md border border-slate-300 bg-white"
            />
          ) : (
            /* High-Fidelity Formatted Textbook / PDF Document View */
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-8 min-h-[800px] text-slate-800 transition-transform"
            >
              {/* Document Header Watermark */}
              <div className="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 tracking-wide uppercase">
                      Learn with Zakir • Academic Hub
                    </span>
                    <span className="text-xs text-slate-500">
                      CBSE Class {resource.classLevel}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {resource.title}
                  </h1>
                </div>
                <div className="text-right text-xs text-slate-500 shrink-0">
                  <p className="font-semibold text-slate-700">Educator: Zakir Hussain</p>
                  <p className="text-[11px] text-slate-400">{resource.chapterTitle || 'Chapter Material'}</p>
                </div>
              </div>

              {/* Resource Description Callout */}
              {resource.description && (
                <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-xl text-sm text-slate-600 leading-relaxed italic">
                  {resource.description}
                </div>
              )}

              {/* Document Body Content */}
              {resource.content ? (
                <div className="prose prose-slate max-w-none text-slate-800 space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {resource.content}
                </div>
              ) : resource.qaItems && resource.qaItems.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Questions and Official CBSE Marking Scheme Solutions</span>
                  </h3>
                  {resource.qaItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-slate-900 text-sm">
                          Q{idx + 1}. {item.question}
                        </p>
                        {item.marks && (
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full shrink-0">
                            {item.marks} {item.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                        <span className="font-bold text-blue-600 mr-1.5">Answer:</span>
                        {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-sm">
                    This file is ready for download. Click the download button in the toolbar to save the complete document.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {resource.fileName || 'Resource File'}</span>
                  </button>
                </div>
              )}

              {/* Document Footer */}
              <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Authorized Material for CBSE Examinations</span>
                </span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Pagination Footer */}
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{resource.fileName || 'Document.pdf'}</span>
            <span className="text-slate-300">•</span>
            <span>Uploaded: {resource.uploadedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium font-mono text-slate-700">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
