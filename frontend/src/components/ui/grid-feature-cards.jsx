import React from 'react';

export function FeatureCard({ title, description, icon, feature }) {
  const displayTitle = title || feature?.title;
  const displayDescription = description || feature?.description;
  const displayIcon = icon || feature?.icon;

  const renderIcon = () => {
    if (!displayIcon) return null;
    if (React.isValidElement(displayIcon)) {
      return displayIcon;
    }
    const IconComponent = displayIcon;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="p-8 transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.03] group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-rose-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div>
        {displayIcon && (
          <div className="mb-6 inline-flex p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all duration-300">
            {renderIcon()}
          </div>
        )}

        <h3 className="mb-2 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors duration-300">
          {displayTitle}
        </h3>

        <p className="text-sm text-white/40 group-hover:text-white/60 leading-relaxed transition-colors duration-300">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}