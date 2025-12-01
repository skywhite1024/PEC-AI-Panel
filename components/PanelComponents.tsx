import React from 'react';

// --- Icons & Logos ---

export const PecLogoIcon = () => (
  <svg width="80" height="24" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="22" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#5B5FC7">PEC</text>
    <circle cx="58" cy="14" r="3" stroke="#5B5FC7" strokeWidth="1.5"/>
    <circle cx="65" cy="8" r="3" stroke="#5B5FC7" strokeWidth="1.5"/>
    <line x1="60" y1="12" x2="63" y2="10" stroke="#5B5FC7" strokeWidth="1.5"/>
    <text x="72" y="22" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#5B5FC7">AI</text>
  </svg>
);

// --- Inputs ---

interface ProInputProps {
  label?: string;
  value: string | number;
  unit?: string;
  className?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  width?: string;
  error?: string;
  variant?: 'default' | 'blue'; // New variant prop
}

export const ProInput: React.FC<ProInputProps> = ({ 
  label, 
  value, 
  unit, 
  className = "", 
  width = "w-20", 
  onChange,
  onBlur,
  error,
  variant = 'default'
}) => {
  // Styles based on variant
  // Blue variant: bg-[#F0F5FF], border-[#D6E4FF] (Light blue background and border)
  // Default variant: bg-[#F3F6F8] (Grayish background, no border by default)
  const bgClass = variant === 'blue' 
    ? 'bg-[#F0F5FF] border border-[#D6E4FF]' 
    : 'bg-[#F3F6F8] border border-transparent';

  return (
    <div className={`flex items-center ${className}`}>
      {label && <span className="text-gray-500 text-sm mr-2 whitespace-nowrap">{label}</span>}
      <div 
        className={`${bgClass} rounded-md flex items-center px-2 h-7 ${width} transition-colors ${
          error 
            ? 'border-red-400 bg-red-50 ring-1 ring-red-200' 
            : 'hover:border-blue-200 focus-within:border-[#5B5FC7]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B5FC7]/10'
        }`}
        title={error}
      >
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          readOnly={!onChange}
          className={`bg-transparent border-none outline-none w-full text-center text-xs font-medium p-0 placeholder-gray-400 ${
            error ? 'text-red-700' : 'text-gray-700'
          }`}
        />
      </div>
      {unit && <span className="text-gray-500 text-xs ml-2 w-4">{unit}</span>}
    </div>
  );
};

interface ProRangeInputProps {
  label: string;
  min: string | number;
  max: string | number;
  points: string | number;
  unit: string;
  onMinChange?: (val: string) => void;
  onMaxChange?: (val: string) => void;
  onPointsChange?: (val: string) => void;
  onBlur?: () => void;
  errors?: { min?: string; max?: string; points?: string };
}

export const ProRangeInput: React.FC<ProRangeInputProps> = ({ 
  label, min, max, points, unit,
  onMinChange, onMaxChange, onPointsChange, onBlur,
  errors
}) => {
  return (
    <div className="flex flex-col py-0.5 space-y-2">
      <span className="text-gray-600 text-sm">{label}</span>
      <div className="flex items-center text-xs">
        {/* Min */}
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">Min</span>
          <ProInput 
            value={min} 
            width="w-12" 
            onChange={onMinChange}
            onBlur={onBlur}
            error={errors?.min}
          />
          <span className="text-gray-500 ml-1.5 w-3">{unit}</span>
        </div>
        
        {/* Max */}
        <div className="flex items-center ml-2">
          <span className="text-gray-500 mr-2">Max</span>
          <ProInput 
            value={max} 
            width="w-12" 
            onChange={onMaxChange}
            onBlur={onBlur}
            error={errors?.max}
          />
          <span className="text-gray-500 ml-1.5 w-3">{unit}</span>
        </div>

        {/* Points */}
        <div className="flex items-center ml-2">
          <span className="text-gray-500 mr-2">扫描点数</span>
          <ProInput 
            value={points} 
            width="w-10" 
            onChange={onPointsChange}
            onBlur={onBlur}
            error={errors?.points}
          />
          <span className="text-gray-500 ml-1.5 w-3">V</span>
        </div>
      </div>
    </div>
  );
};

// --- Charts ---

export const CustomPieChart: React.FC = () => {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {/* 
        SVG Rotation logic:
        -rotate-90 puts 0 degrees at 12 o'clock.
        Circumference ~314.
        Each 120deg slice ~104.7 length.
        
        Sectors:
        1. Volume (Grey): 0deg to 120deg (Top Right)
        2. Cost (Light Purple): 120deg to 240deg (Bottom)
        3. Efficiency (Blue): 240deg to 360deg (Top Left)
      */}
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        
        {/* 1. Grey (Volume) - 0 to 120 deg */}
        <circle cx="50" cy="50" r="50" fill="#BFBFBF" stroke="white" strokeWidth="1" 
                strokeDasharray="104.7 314" strokeDashoffset="0" />
        
        {/* 2. Light Purple (Cost) - 120 to 240 deg */}
        <circle cx="50" cy="50" r="50" fill="#B3C6FF" stroke="white" strokeWidth="1" 
                strokeDasharray="104.7 314" strokeDashoffset="-104.7" />
        
        {/* 3. Blue (Efficiency) - 240 to 360 deg */}
        <circle cx="50" cy="50" r="50" fill="#2F54EB" stroke="white" strokeWidth="1" 
                 strokeDasharray="104.7 314" strokeDashoffset="-209.4" />
      </svg>
      
      {/* Labels positioned absolutely over the slices */}
      <div className="absolute inset-0 pointer-events-none text-[10px] font-medium tracking-wide">
        {/* Volume (Grey) - Top Right */}
        <span className="absolute top-[32%] right-[18%] text-white">体积</span>
        
        {/* Cost (Purple) - Bottom */}
        <span className="absolute bottom-[18%] left-[50%] -translate-x-1/2 text-white">成本</span>
        
        {/* Efficiency (Blue) - Top Left */}
        <span className="absolute top-[32%] left-[18%] text-white">效率</span>
      </div>
    </div>
  );
};
