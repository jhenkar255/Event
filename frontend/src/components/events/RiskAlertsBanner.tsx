import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { IRiskAlert } from '@shared/types';

interface RiskAlertsBannerProps {
  alerts?: IRiskAlert[];
}

export const RiskAlertsBanner: React.FC<RiskAlertsBannerProps> = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/50 shadow-md space-y-3">
      <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
          AI Event Risk & Capacity Monitor ({alerts.length})
        </h4>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-2xl border text-xs flex items-start space-x-3 ${
                isCritical
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-200'
                  : 'bg-white dark:bg-utsav-maroon-900 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
              }`}
            >
              {isCritical ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">{alert.message}</p>
                {alert.suggestedAction && (
                  <p className="text-[11px] opacity-90 italic">
                    💡 <strong>Suggested Action:</strong> {alert.suggestedAction}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
