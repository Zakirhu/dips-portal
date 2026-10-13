import React, { useState } from 'react';
import { AlertTriangle, WifiOff, CreditCard, Server, RefreshCw, Home, ArrowLeft, ShieldAlert } from 'lucide-react';

interface ErrorViewProps {
  initialErrorCode?: '402' | '404' | '500' | 'offline';
  onNavigateHome: () => void;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  initialErrorCode = '404',
  onNavigateHome,
  onRetry
}) => {
  const [activeCode, setActiveCode] = useState<'402' | '404' | '500' | 'offline'>(initialErrorCode);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (onRetry) onRetry();
    }, 1200);
  };

  const errorDetails = {
    '402': {
      code: '402',
      title: 'Payment Required / Resource Quota Exceeded',
      description: 'The server encountered a billing or resource limit constraint. This commonly occurs when Supabase database quotas, cloud hosting usage, or AI API request limits have reached their tier limit. Please check your Render or Supabase billing dashboard to renew or upgrade your plan.',
      icon: CreditCard,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      actionText: 'Check Supabase & Hosting Billing'
    },
    '404': {
      code: '404',
      title: 'Site Not Reachable / Page Not Found',
      description: 'The requested page or resource could not be found on this server. The link may be outdated, the URL might have been mistyped, or the server routing table could not resolve the destination.',
      icon: AlertTriangle,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      actionText: 'Return to Homepage'
    },
    '500': {
      code: '500',
      title: 'Internal Server Error / Database Exception',
      description: 'The server encountered an internal error or misconfiguration and was unable to complete your request. This may be due to a lost Supabase connection string or missing environment variables on Render.',
      icon: Server,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      actionText: 'Retry Connection'
    },
    'offline': {
      code: 'ERR_CONNECTION',
      title: 'Site Not Reachable / Network Offline',
      description: 'Your internet connection was interrupted or the remote server is temporarily unreachable. Please check your network cable, Wi-Fi router, or firewall settings and try reloading.',
      icon: WifiOff,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
      actionText: 'Reload Connection'
    }
  };

  const current = errorDetails[activeCode];
  const IconComponent = current.icon;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Error Code Switcher Tabs for Testing & Diagnostics */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveCode('402')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeCode === '402' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            402 Payment
          </button>
          <button
            onClick={() => setActiveCode('404')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeCode === '404' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            404 Not Found
          </button>
          <button
            onClick={() => setActiveCode('500')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeCode === '500' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            500 Server Error
          </button>
          <button
            onClick={() => setActiveCode('offline')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeCode === 'offline' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Site Not Reachable
          </button>
        </div>

        {/* Icon Header */}
        <div className="text-center space-y-6">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border shadow-sm ${current.iconBg} transform transition-transform hover:scale-105 duration-200`}>
            <IconComponent className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${current.badgeColor}`}>
                Error {current.code}
              </span>
              <span className="text-xs font-bold text-slate-400">|</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">System Diagnostic</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {current.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              {current.description}
            </p>
          </div>
        </div>

        {/* Technical Troubleshooting Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Troubleshooting & Resolution Steps:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>Verify your environment variables on Render (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code> &amp; <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_ANON_KEY</code>).</li>
            <li>Confirm Supabase database status and project quota limits in the Supabase dashboard.</li>
            <li>Ensure your internet connection is active and firewall is not blocking outbound API requests.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Reconnecting to Server...' : 'Try Again'}</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>

      </div>
    </div>
  );
};
