import React, { useState } from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { PecLogoIcon, ProInput, ProRangeInput, CustomPieChart } from './PanelComponents';

interface ProfessionalPanelProps {
  onClose?: () => void;
}

const ProfessionalPanel: React.FC<ProfessionalPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'params' | 'design' | 'calc'>('params');

  // Form State
  const [formData, setFormData] = useState({
    // System Specs
    inputVoltage: '48',
    outputVoltage: '100',
    outputPower: '500',
    // Range Specs
    vInMin: '40',
    vInMax: '55',
    vInPoints: '4',
    pOutMin: '50',
    pOutMax: '500',
    pOutPoints: '5',
    // Optimization
    effWeight: '33.3',
    costWeight: '33.3',
    volWeight: '33.3',
    // Global Vars
    freq: '50e3',
    inductance: '20e-6',
    // Constraints
    maxAmbTemp: '50',
    maxJuncTemp: '125',
    maxCoreTemp: '100',
    ripple: '1.0',
    lRatio: '0.75'
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation Logic
  const validate = () => {
    const errors: Record<string, string> = {};
    const isNum = (v: string) => !isNaN(Number(v)) && v.trim() !== '';
    const isInt = (v: string) => isNum(v) && Number.isInteger(Number(v));
    const isPos = (v: string) => isNum(v) && Number(v) > 0;

    // Required Number Fields
    const requiredFields = [
      'inputVoltage', 'outputVoltage', 'outputPower',
      'vInMin', 'vInMax', 'pOutMin', 'pOutMax',
      'effWeight', 'costWeight', 'volWeight',
      'freq', 'inductance',
      'maxAmbTemp', 'maxJuncTemp', 'maxCoreTemp',
      'ripple', 'lRatio'
    ];

    requiredFields.forEach(field => {
      if (!isNum(formData[field as keyof typeof formData])) {
        errors[field] = '请输入有效数字';
      }
    });

    // Specific Checks
    if (isNum(formData.vInPoints) && (!isInt(formData.vInPoints) || Number(formData.vInPoints) < 1)) {
       errors.vInPoints = '必须为正整数';
    }
    if (isNum(formData.pOutPoints) && (!isInt(formData.pOutPoints) || Number(formData.pOutPoints) < 1)) {
       errors.pOutPoints = '必须为正整数';
    }

    // Range Logic
    if (isNum(formData.vInMin) && isNum(formData.vInMax) && Number(formData.vInMin) >= Number(formData.vInMax)) {
      errors.vInMin = 'Min应小于Max';
      errors.vInMax = 'Min应小于Max';
    }
    if (isNum(formData.pOutMin) && isNum(formData.pOutMax) && Number(formData.pOutMin) >= Number(formData.pOutMax)) {
      errors.pOutMin = 'Min应小于Max';
      errors.pOutMax = 'Min应小于Max';
    }

    // L Ratio (0-1)
    if (isNum(formData.lRatio)) {
      const val = Number(formData.lRatio);
      if (val <= 0 || val >= 1) errors.lRatio = '需在0-1之间';
    }

    return errors;
  };

  const errors = validate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => touched[field] ? errors[field] : undefined;
  
  // Helper for range inputs to reduce boilerplate in render
  const rangeBlur = (f1: string, f2: string, f3: string) => () => {
    handleBlur(f1); handleBlur(f2); handleBlur(f3);
  };

  return (
    <div className="h-full flex flex-col bg-[#EEF2FF] border-l border-white/60">
      {/* --- Top Header Area --- */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onClose}
            className="flex items-center text-[#2F54EB] hover:opacity-80 transition-opacity"
          >
            <ArrowLeftCircle className="w-5 h-5 mr-2" />
            <span className="font-medium text-sm">专业模式</span>
          </button>
          
          {/* Tabs */}
          <div className="flex bg-transparent space-x-2">
            <button
              onClick={() => setActiveTab('params')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'params' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              参数面板
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'design' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              设计方案
            </button>
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'calc' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              实时计算
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="opacity-90">
          <PecLogoIcon />
        </div>
      </div>

      {/* --- Scrollable Content Area --- */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin space-y-4">
        
        {/* Card 1: System Specs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50">
          <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">系统规格</h3>
          <p className="text-xs text-gray-400 mb-5">核心电气规格</p>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            {/* Left Column: Basic Inputs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">输入电压</span>
                <ProInput 
                  value={formData.inputVoltage} 
                  unit="V" 
                  width="w-20" 
                  onChange={(v) => handleChange('inputVoltage', v)}
                  onBlur={() => handleBlur('inputVoltage')}
                  error={getError('inputVoltage')}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">输出电压</span>
                <ProInput 
                  value={formData.outputVoltage} 
                  unit="V" 
                  width="w-20" 
                  onChange={(v) => handleChange('outputVoltage', v)}
                  onBlur={() => handleBlur('outputVoltage')}
                  error={getError('outputVoltage')}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">输出功率</span>
                <ProInput 
                  value={formData.outputPower} 
                  unit="W" 
                  width="w-20" 
                  onChange={(v) => handleChange('outputPower', v)}
                  onBlur={() => handleBlur('outputPower')}
                  error={getError('outputPower')}
                />
              </div>
            </div>

            {/* Right Column: Range Inputs */}
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2 font-medium">最差工况搜索范围</div>
              <ProRangeInput 
                label="输入电压范围"
                min={formData.vInMin}
                max={formData.vInMax}
                points={formData.vInPoints}
                unit="V"
                onMinChange={(v) => handleChange('vInMin', v)}
                onMaxChange={(v) => handleChange('vInMax', v)}
                onPointsChange={(v) => handleChange('vInPoints', v)}
                onBlur={rangeBlur('vInMin', 'vInMax', 'vInPoints')}
                errors={{ min: getError('vInMin'), max: getError('vInMax'), points: getError('vInPoints') }}
              />
              <ProRangeInput 
                label="输出功率范围"
                min={formData.pOutMin}
                max={formData.pOutMax}
                points={formData.pOutPoints}
                unit="W" 
                onMinChange={(v) => handleChange('pOutMin', v)}
                onMaxChange={(v) => handleChange('pOutMax', v)}
                onPointsChange={(v) => handleChange('pOutPoints', v)}
                onBlur={rangeBlur('pOutMin', 'pOutMax', 'pOutPoints')}
                errors={{ min: getError('pOutMin'), max: getError('pOutMax'), points: getError('pOutPoints') }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Optimization & Global Vars */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Card 2: Optimization Targets */}
          <div className="col-span-12 xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <h3 className="text-[#2F54EB] font-medium text-[15px]">优化目标</h3>
              <span className="text-[10px] text-gray-300 transform translate-y-0.5">请输入0-100的数字，程序会自动进行归一化处理</span>
            </div>

            <div className="flex justify-between items-start">
              {/* Left Side: Inputs */}
              <div className="flex-1 pr-4">
                 <div className="flex justify-between text-xs text-gray-400 mb-4 font-medium">
                    <span>多目标优化权重</span>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium">效率</span>
                      <ProInput 
                        value={formData.effWeight} 
                        width="w-24" 
                        variant="blue" // Use Blue Variant
                        onChange={(v) => handleChange('effWeight', v)}
                        onBlur={() => handleBlur('effWeight')}
                        error={getError('effWeight')}
                      />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium">成本</span>
                      <ProInput 
                        value={formData.costWeight} 
                        width="w-24" 
                        variant="blue" // Use Blue Variant
                        onChange={(v) => handleChange('costWeight', v)}
                        onBlur={() => handleBlur('costWeight')}
                        error={getError('costWeight')}
                      />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium">体积</span>
                      <ProInput 
                        value={formData.volWeight} 
                        width="w-24" 
                        variant="blue" // Use Blue Variant
                        onChange={(v) => handleChange('volWeight', v)}
                        onBlur={() => handleBlur('volWeight')}
                        error={getError('volWeight')}
                      />
                   </div>
                 </div>
              </div>

              {/* Right Side: Chart */}
              <div className="flex flex-col items-center w-28 pt-1">
                 <span className="text-xs text-gray-400 mb-4 font-medium">权重分配</span>
                 <CustomPieChart />
              </div>
            </div>
          </div>

          {/* Card 3: Global Design Variables */}
          <div className="col-span-12 xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-white/50">
            <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">全局设计变量</h3>
            <p className="text-xs text-gray-400 mb-6">全局变量迭代空间</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">开关频率</span>
                <ProInput 
                  value={formData.freq} 
                  unit="Hz" 
                  width="w-20" 
                  onChange={(v) => handleChange('freq', v)}
                  onBlur={() => handleBlur('freq')}
                  error={getError('freq')}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">电感值</span>
                <ProInput 
                  value={formData.inductance} 
                  unit="H" 
                  width="w-20" 
                  onChange={(v) => handleChange('inductance', v)}
                  onBlur={() => handleBlur('inductance')}
                  error={getError('inductance')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Component Constraints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50">
          <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">元器件约束</h3>
          <p className="text-xs text-gray-400 mb-5">设计安全与性能边界</p>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-12 gap-y-6">
             {/* Left Column: Thermal */}
             <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2 font-medium">热约束</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">最高环境温度</span>
                  <ProInput 
                    value={formData.maxAmbTemp} 
                    unit="°C" 
                    width="w-20" 
                    onChange={(v) => handleChange('maxAmbTemp', v)}
                    onBlur={() => handleBlur('maxAmbTemp')}
                    error={getError('maxAmbTemp')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">最高半导体结温</span>
                  <ProInput 
                    value={formData.maxJuncTemp} 
                    unit="°C" 
                    width="w-20" 
                    onChange={(v) => handleChange('maxJuncTemp', v)}
                    onBlur={() => handleBlur('maxJuncTemp')}
                    error={getError('maxJuncTemp')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">最高磁芯温度</span>
                  <ProInput 
                    value={formData.maxCoreTemp} 
                    unit="°C" 
                    width="w-20" 
                    onChange={(v) => handleChange('maxCoreTemp', v)}
                    onBlur={() => handleBlur('maxCoreTemp')}
                    error={getError('maxCoreTemp')}
                  />
                </div>
             </div>

             {/* Right Column: Electrical */}
             <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2 font-medium">电气约束</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">最大输出电压纹波</span>
                  <ProInput 
                    value={formData.ripple} 
                    unit="%" 
                    width="w-20" 
                    onChange={(v) => handleChange('ripple', v)}
                    onBlur={() => handleBlur('ripple')}
                    error={getError('ripple')}
                  />
                </div>
                
                {/* Consolidated Constraint Item */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-gray-600 text-sm">最小电感裕量 (防饱和)</span>
                     <span className="text-[10px] text-gray-400 mt-0.5">L(I_peak) / L(0) 不低于</span>
                  </div>
                  <ProInput 
                    value={formData.lRatio} 
                    unit="" 
                    width="w-20" 
                    onChange={(v) => handleChange('lRatio', v)}
                    onBlur={() => handleBlur('lRatio')}
                    error={getError('lRatio')}
                  />
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfessionalPanel;