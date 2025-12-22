import React, { useState, useEffect } from 'react';
import { ProInput } from './PanelComponents';
import { Cpu, Zap, Activity, Save, Upload, Usb, Play, RefreshCw, Layers } from 'lucide-react';

// --- Types ---
interface ParamGroup {
  title: string;
  items: {
    label: string;
    value: string;
    unit: string;
    key: string;
  }[];
}

// --- Mock Data ---
const CORE_PARAMS: ParamGroup[] = [
  {
    title: "基础控制参数",
    items: [
      { label: "开关频率", value: "100.0", unit: "kHz", key: "f_sw" },
      { label: "死区时间", value: "200", unit: "ns", key: "dead_time" },
      { label: "最大占空比", value: "0.95", unit: "", key: "duty_max" },
      { label: "最小占空比", value: "0.05", unit: "", key: "duty_min" },
      { label: "软启动时间", value: "10", unit: "ms", key: "soft_start" },
      { label: "采样频率", value: "200.0", unit: "kHz", key: "f_sample" },
    ]
  },
  {
    title: "高级调制算法",
    items: [
      { label: "调制指数", value: "0.85", unit: "", key: "mod_index" },
      { label: "载波频率", value: "100.0", unit: "kHz", key: "carrier_freq" },
      { label: "相移角度", value: "120", unit: "deg", key: "phase_shift" },
      { label: "抖频范围", value: "5.0", unit: "%", key: "dither_range" },
      { label: "抖频周期", value: "10", unit: "ms", key: "dither_period" },
      { label: "三次谐波注入", value: "15.0", unit: "%", key: "harm_3rd" },
    ]
  },
  {
    title: "闭环控制 (PID)",
    items: [
      { label: "电压环 Kp", value: "0.500", unit: "", key: "v_kp" },
      { label: "电压环 Ki", value: "0.020", unit: "", key: "v_ki" },
      { label: "电压环 Kd", value: "0.000", unit: "", key: "v_kd" },
      { label: "电流环 Kp", value: "1.200", unit: "", key: "i_kp" },
      { label: "电流环 Ki", value: "0.150", unit: "", key: "i_ki" },
      { label: "前馈系数", value: "0.80", unit: "", key: "feed_fwd" },
    ]
  },
  {
    title: "保护与限值",
    items: [
      { label: "过压阈值", value: "110", unit: "V", key: "ovp" },
      { label: "欠压阈值", value: "35", unit: "V", key: "uvp" },
      { label: "过流阈值", value: "15.0", unit: "A", key: "ocp" },
      { label: "过温阈值", value: "105", unit: "°C", key: "otp" },
      { label: "恢复滞后", value: "5.0", unit: "V", key: "hysteresis" },
      { label: "最大斜率", value: "50", unit: "V/ms", key: "slew_rate" },
    ]
  }
];

const METRICS = [
  { label: "预计系统效率", value: "98.5", unit: "%", icon: Zap, color: "text-green-600" },
  { label: "结温波动 (Tj)", value: "±2.5", unit: "°C", icon: Activity, color: "text-orange-500" },
  { label: "开关损耗", value: "12.5", unit: "W", icon: Cpu, color: "text-blue-500" },
  { label: "总谐波失真 (THD)", value: "< 1.5", unit: "%", icon: RefreshCw, color: "text-purple-500" },
];

// --- Components ---

const WaveformChart = () => {
  // Simple simulated waveform SVG
  return (
    <div className="w-full h-40 bg-[#1e293b] rounded-lg overflow-hidden relative border border-gray-700 shadow-inner">
      <div className="absolute top-2 left-2 text-[10px] text-gray-400 font-mono">
        CH1: I_L1 (5A/div) <br/>
        CH2: V_out (20V/div)
      </div>
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(47, 84, 235, 0.5)" />
            <stop offset="100%" stopColor="rgba(47, 84, 235, 0)" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <path d="M0 20 H1000 M0 40 H1000 M0 60 H1000 M0 80 H1000 M0 100 H1000 M0 120 H1000 M0 140 H1000" stroke="#334155" strokeWidth="0.5" fill="none" />
        <path d="M20 0 V160 M40 0 V160 M60 0 V160 M80 0 V160 M100 0 V160 M120 0 V160 M140 0 V160 M160 0 V160" stroke="#334155" strokeWidth="0.5" fill="none" />
        
        {/* Waveform 1: Sine-like (Blue) */}
        <path 
          d="M0 80 Q 20 20 40 80 T 80 80 T 120 80 T 160 80 T 200 80 T 240 80 T 280 80 T 320 80 T 360 80 T 400 80"
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
          className="animate-[dash_5s_linear_infinite]"
        />
        
        {/* Waveform 2: PWM-like (Yellow) */}
        <path
          d="M0 120 L 10 120 L 10 40 L 20 40 L 20 120 L 30 120 L 30 40 L 40 40 L 40 120 L 50 120 L 50 40 L 60 40 L 60 120 L 70 120 L 70 40 L 80 40 L 80 120"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

const ExpertTuningPanel: React.FC = () => {
  const [params, setParams] = useState<Record<string, string>>({});

  // Initialize params
  useEffect(() => {
    const initialParams: Record<string, string> = {};
    CORE_PARAMS.forEach(group => {
      group.items.forEach(item => {
        initialParams[item.key] = item.value;
      });
    });
    setParams(initialParams);
  }, []);

  const handleParamChange = (key: string, val: string) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="h-full flex flex-col bg-[#EEF2FF] border-l border-white/60 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 md:pb-32 scrollbar-thin">
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* --- Zone A: Core Parameters --- */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div>
                  <h3 className="text-[#2F54EB] font-bold text-lg flex items-center gap-2">
                    <Layers size={20} />
                    核心参数配置
                  </h3>
                  <p className="text-xs text-gray-500">底层控制算法与硬件参数微调</p>
               </div>
               <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                 MODE: EXPERT
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CORE_PARAMS.map((group, groupIdx) => (
                <div key={groupIdx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h4 className="text-gray-700 font-medium text-sm mb-3 border-b pb-2 border-gray-100 flex justify-between">
                    {group.title}
                  </h4>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between group">
                        <label className="text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors w-24 truncate">
                          {item.label}
                        </label>
                        <div className="relative transition-all duration-300">
                          <ProInput
                            value={params[item.key] || item.value}
                            unit={item.unit}
                            width="w-24"
                            variant="default"
                            onChange={(v) => handleParamChange(item.key, v)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Zone B: Real-time Evaluation & Charts --- */}
          <div className="w-full xl:w-80 space-y-6 flex flex-col">
             
             {/* Metrics Dashboard */}
             <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
               <h3 className="text-[#2F54EB] font-bold text-sm mb-4 flex items-center gap-2">
                 <Activity size={16} />
                 实时性能评估
               </h3>
               <div className="grid grid-cols-1 gap-3">
                 {METRICS.map((m, idx) => (
                   <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <m.icon size={14} className={m.color} />
                        <span className="text-xs text-gray-600">{m.label}</span>
                      </div>
                      <div className="text-sm font-bold font-mono text-gray-800">
                        {m.value} <span className="text-[10px] text-gray-400 font-normal">{m.unit}</span>
                      </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Waveform Chart */}
             <div className="bg-[#0f172a] rounded-xl p-4 shadow-lg border border-gray-700 flex-1 min-h-[200px] flex flex-col">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-blue-400 font-bold text-xs flex items-center gap-2">
                     <Activity size={14} />
                     实时波形监控
                   </h3>
                   <span className="text-[10px] text-green-500 font-mono animate-pulse">● LIVE</span>
                </div>
                <WaveformChart />
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-mono">
                   <div>V_rms: 99.8 V</div>
                   <div>I_rms: 4.98 A</div>
                   <div>Freq: 50.01 Hz</div>
                   <div>PF: 0.99</div>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* --- Zone C: Bottom Action Bar --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 px-6 flex flex-col md:flex-row items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 gap-4 md:gap-0">
         <div className="flex items-center gap-4 text-xs text-gray-500 w-full md:w-auto justify-center md:justify-start">
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <span>DSP 连接正常</span>
            </div>
            <div className="h-3 w-px bg-gray-300"></div>
            <div className="font-mono">COM3: 115200bps</div>
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end overflow-x-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
               <Layers size={14} />
               生成底层代码
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
               <Save size={14} />
               导出固件 (.HEX)
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-[#2F54EB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap">
               <Usb size={14} />
               在线烧录
            </button>
         </div>
      </div>
    </div>
  );
};

export default ExpertTuningPanel;
