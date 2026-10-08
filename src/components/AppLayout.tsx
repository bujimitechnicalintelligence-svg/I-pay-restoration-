import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-white sm:bg-slate-100 flex flex-col justify-start items-center p-0 sm:py-4 sm:px-2">
      {/* Generously sized card container - large and comfortable */}
      <div className="w-full max-w-lg min-h-screen sm:min-h-[auto] bg-white flex flex-col sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-xl overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
