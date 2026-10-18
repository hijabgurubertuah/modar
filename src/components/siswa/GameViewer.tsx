// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';

interface GameViewerProps {
  htmlCode?: string;
}

export const GameViewer: React.FC<GameViewerProps> = ({ htmlCode = '' }) => {
  return (
    <div className="w-full h-[72vh] min-h-[460px] max-h-[720px] rounded-2xl overflow-hidden border border-white/20 bg-black/30 shadow-inner flex flex-col">
      <iframe
        title="Game"
        srcDoc={htmlCode}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-none"
      />
    </div>
  );
};
