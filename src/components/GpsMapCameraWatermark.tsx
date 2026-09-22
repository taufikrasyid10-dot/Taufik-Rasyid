import { MapPin } from 'lucide-react';

interface GpsWatermarkProps {
  location?: string;
  detail?: string;
  coord?: string;
  time?: string;
  compact?: boolean;
}

export default function GpsMapCameraWatermark({
  location = 'Kecamatan Ampana Tete, Sulawesi Tengah, Indonesia',
  detail = '4j2h+23w, Kajulangko, Kec. Ampana Tete, Kabupaten Tojo Una-Una, Sulawesi Tengah 94684, Indonesia',
  coord = 'Lat -0.900128° Long 121.627752°',
  time = '01/08/2026 08:36 AM GMT +08:00',
  compact = false,
}: GpsWatermarkProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/75 p-2 text-white backdrop-blur-[2px] border-t border-white/20 select-none print:bg-black/85">
      <div className="flex items-center gap-2">
        
        {/* Google Mini Map Mockup Box */}
        <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden border border-white/40 bg-slate-800 flex flex-col justify-between p-0.5">
          {/* Faux Satellite / Terrain Map Texture */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-teal-900 to-amber-950 opacity-90" />
          
          {/* Road grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 64 64">
            <line x1="0" y1="20" x2="64" y2="44" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="24" y1="0" x2="40" y2="64" stroke="#fef08a" strokeWidth="1.5" />
            <line x1="0" y1="50" x2="64" y2="10" stroke="#cbd5e1" strokeWidth="1" />
          </svg>

          {/* Red Map Pin Center */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-600 shadow-md ring-2 ring-white">
              <MapPin className="h-3 w-3 text-white fill-white" />
            </div>
          </div>

          {/* Mini Google Logo */}
          <div className="relative z-10 flex items-center justify-start px-0.5 bg-black/40 rounded">
            <span className="text-[8px] font-bold tracking-tight text-white/90">
              <span className="text-blue-400">G</span>
              <span className="text-red-400">o</span>
              <span className="text-amber-300">o</span>
              <span className="text-blue-400">g</span>
              <span className="text-emerald-400">l</span>
              <span className="text-red-400">e</span>
            </span>
          </div>
        </div>

        {/* Text Details Area (Authentic GPS Map Camera Layout) */}
        <div className="flex-1 min-w-0 text-left font-sans leading-tight">
          
          {/* Header Location with Flag */}
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate flex items-center gap-1">
              <span>{location}</span>
              <span className="inline-block" role="img" aria-label="Indonesia">🇮🇩</span>
            </p>
            {!compact && (
              <span className="text-[8px] text-white/60 font-mono tracking-widest hidden sm:inline">
                GPS Map Camera
              </span>
            )}
          </div>

          {/* Street / Village Detail */}
          <p className="text-[9px] sm:text-[10px] text-slate-200 line-clamp-1 mt-0.5 opacity-90">
            {detail}
          </p>

          {/* Latitude Longitude */}
          <p className="text-[9px] sm:text-[10px] font-mono text-emerald-300 mt-0.5 truncate">
            {coord}
          </p>

          {/* Date & Time */}
          <p className="text-[9px] sm:text-[10px] font-mono text-amber-300/95 truncate">
            {time}
          </p>

        </div>

      </div>
    </div>
  );
}
