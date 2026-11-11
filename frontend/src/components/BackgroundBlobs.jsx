import React from 'react';

/**
 * BackgroundBlobs
 * Renders soft, organic radiant gradient blobs behind the application layout
 * so that glassmorphic buttons and cards have rich color fields to blur and refract.
 */
const BackgroundBlobs = () => {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none"
      aria-hidden="true"
    >
      {/* Top Left: Radiant Indigo / Sky Blob */}
      <div
        className="absolute -top-24 -left-20 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-indigo-500/20 via-sky-400/20 to-transparent blur-3xl animate-blob-1"
        style={{ willChange: 'transform' }}
      />

      {/* Top Right: Glowing Violet / Fuchsia Blob */}
      <div
        className="absolute top-10 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-purple-600/18 via-indigo-500/15 to-transparent blur-3xl animate-blob-2"
        style={{ willChange: 'transform' }}
      />

      {/* Center / Mid-Page: Emerald / Cyan Medical Glow Blob */}
      <div
        className="absolute top-[42%] left-[30%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-cyan-400/12 via-emerald-400/10 to-transparent blur-3xl animate-blob-3"
        style={{ willChange: 'transform' }}
      />

      {/* Bottom Left: Soft Rose / Coral Accent Blob */}
      <div
        className="absolute -bottom-20 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-500/12 via-purple-500/10 to-transparent blur-3xl animate-blob-1"
        style={{ willChange: 'transform' }}
      />

      {/* Bottom Right: Deep Indigo / Violet Base */}
      <div
        className="absolute -bottom-28 -right-16 w-[540px] h-[540px] rounded-full bg-gradient-to-tl from-indigo-600/20 via-sky-500/15 to-transparent blur-3xl animate-blob-2"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

export default BackgroundBlobs;

