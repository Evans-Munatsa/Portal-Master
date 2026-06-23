'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Use SSR-disabled dynamic load to prevent hydration mismatches from player instances
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-400 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-[#7145FF] animate-spin" />
        <span className="text-xs font-semibold tracking-wider font-mono">LOADING STREAM PLAYER...</span>
      </div>
    </div>
  )
});

interface LaunchpathMuxPlayerProps {
  videoUrl?: string;
  poster?: string;
  className?: string;
}

export default function LaunchpathMuxPlayer({ 
  videoUrl, 
  poster, 
  className = '' 
}: LaunchpathMuxPlayerProps): React.ReactElement {
  const defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4';
  const url = videoUrl || defaultVideo;

  const isMuxPlayback = url.startsWith('mux://');
  const playbackId = isMuxPlayback ? url.replace('mux://', '') : '';
  const isMock = playbackId.startsWith('mock_playback_');

  return (
    <div className={`relative w-full h-full bg-slate-950 overflow-hidden ${className}`}>
      {isMuxPlayback && !isMock ? (
        <MuxPlayer
          playbackId={playbackId}
          metadata={{ video_title: 'Launchpath Professional Presentation' }}
          className="w-full h-full object-cover"
          poster={poster}
          streamType="on-demand"
          primaryColor="#7145FF"
          secondaryColor="#1e1b4b"
        />
      ) : (
        <MuxPlayer
          src={isMock ? defaultVideo : url}
          metadata={{ video_title: 'Launchpath Professional Presentation' }}
          className="w-full h-full object-cover"
          poster={poster}
          primaryColor="#7145FF"
          secondaryColor="#1e1b4b"
        />
      )}
    </div>
  );
}
