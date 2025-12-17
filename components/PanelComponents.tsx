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
      <span className="text-gray-500 text-xs ml-2 w-4">{unit || ' '}</span>
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
      <div className="flex flex-wrap items-center text-xs gap-2">
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
        <div className="flex items-center">
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
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">扫描点数</span>
          <ProInput 
            value={points} 
            width="w-10" 
            onChange={onPointsChange}
            onBlur={onBlur}
            error={errors?.points}
          />
        </div>
      </div>
    </div>
  );
};
// --- Charts ---

interface CustomPieChartProps {
  effWeight: string | number;
  costWeight: string | number;
  volWeight: string | number;
}

export const CustomPieChart: React.FC<CustomPieChartProps> = ({ 
  effWeight, 
  costWeight, 
  volWeight 
}) => {
  const eff = parseFloat(effWeight.toString()) || 0;
  const cost = parseFloat(costWeight.toString()) || 0;
  const vol = parseFloat(volWeight.toString()) || 0;
  
  const total = eff + cost + vol;
  
  const volAngle = total > 0 ? (vol / total) * 360 : 0;
  const costAngle = total > 0 ? (cost / total) * 360 : 0;
  const effAngle = total > 0 ? (eff / total) * 360 : 0;
  
  const volStartAngle = 0;
  const volEndAngle = volAngle;
  const costStartAngle = volEndAngle;
  const costEndAngle = volEndAngle + costAngle;
  const effStartAngle = costEndAngle;
  const effEndAngle = costEndAngle + effAngle;
  
  const cx = 50;
  const cy = 50;
  const r = 45;
  
  const degToRad = (deg: number) => deg * Math.PI / 180;
  
  const getPoint = (angle: number) => {
    const rad = degToRad(angle);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };
  
  const getSectorPath = (startAngle: number, endAngle: number) => {
    const start = getPoint(startAngle);
    const end = getPoint(endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const sweepFlag = 1;
    
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y} Z`;
  };
  
  return (
    <div className="relative w-28 flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-full h-28 -rotate-90">
        <path d={getSectorPath(volStartAngle, volEndAngle)} fill="#BFBFBF" />
        <path d={getSectorPath(costStartAngle, costEndAngle)} fill="#B3C6FF" />
        <path d={getSectorPath(effStartAngle, effEndAngle)} fill="#2F54EB" />
      </svg>
      
      <div className="w-full mt-2 space-y-1 text-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2F54EB]"></div>
            <span className="text-gray-600">效率</span>
          </div>
          <span className="text-gray-700 font-medium">{eff.toFixed(1)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-[#B3C6FF]"></div>
            <span className="text-gray-600">成本</span>
          </div>
          <span className="text-gray-700 font-medium">{cost.toFixed(1)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-[#BFBFBF]"></div>
            <span className="text-gray-600">体积</span>
          </div>
          <span className="text-gray-700 font-medium">{vol.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
