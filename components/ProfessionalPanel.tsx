// components/ProfessionalPanel.tsx
import React, { useState, useCallback } from 'react';
import { ArrowLeftCircle, X, ChevronRight, Lock, Check, Pause, Square } from 'lucide-react';
import { PecLogoIcon, ProInput, ProRangeInput, CustomPieChart } from './PanelComponents';
import ExpertTuningPanel from './ExpertTuningPanel';

// 拓扑选择选项
type TopologyType = 'buck' | 'boost' | 'buck-boost';

// 调制模式选项
type ModulationType = 'CCM' | 'DCM' | 'BCM';

// 半导体技术选项
type SemiconductorTech = 'Si' | 'GaN' | 'SiC';

// 磁芯材料选项
type CoreMaterial = 'Ferrite' | 'PowderCore' | 'Amorphous';

// 拓扑信息
const topologyInfo: Record<TopologyType, { name: string; description: string; image: string }> = {
  'buck': {
    name: 'Buck (降压型转换器)',
    description: '输出电压低于输入电压，适用于电压降压场景',
    image: '/image/buck-topology.png'
  },
  'boost': {
    name: 'Boost (升压型转换器)',
    description: '输出电压高于输入电压，适用于电压升压场景',
    image: '/image/boost-topology.png'
  },
  'buck-boost': {
    name: 'Buck-Boost (升降压型转换器)',
    description: '输出电压可高于或低于输入电压，适用于宽范围输入场景',
    image: '/image/buck-boost-topology.png'
  }
};

// 调制模式信息
const modulationInfo: Record<ModulationType, { name: string; description: string }> = {
  'CCM': {
    name: 'CCM (连续导通模式)',
    description: '电感电流始终大于零，适用于大功率应用'
  },
  'DCM': {
    name: 'DCM (不连续导通模式)',
    description: '电感电流在每个周期内会降到零，适用于轻载优化'
  },
  'BCM': {
    name: 'BCM (临界导通模式)',
    description: '电感电流刚好降到零时开始下一周期，效率与EMI平衡'
  }
};

// 选择按钮组件
interface SelectButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const SelectButton: React.FC<SelectButtonProps> = ({ selected, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
      border-2 flex items-center justify-center gap-2
      ${selected 
        ? 'border-[#2F54EB] bg-[#EEF2FF] text-[#2F54EB] shadow-sm' 
        : 'border-gray-200 bg-white text-gray-600 hover:border-[#2F54EB]/30 hover:bg-gray-50'
      }
      ${className}
    `}
  >
    {selected && <Check size={14} className="text-[#2F54EB]" />}
    {children}
  </button>
);

// 多选按钮组件（用于技术选型）
interface MultiSelectButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const MultiSelectButton: React.FC<MultiSelectButtonProps> = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
      border flex items-center justify-center gap-1.5
      ${selected 
        ? 'border-[#2F54EB] bg-[#2F54EB] text-white' 
        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#2F54EB]/50'
      }
    `}
  >
    {selected && <Check size={12} />}
    {children}
  </button>
);

// 设计面板组件
interface DesignPanelProps {
  onLockAndContinue: () => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({ onLockAndContinue }) => {
  // 拓扑选择状态
  const [selectedTopology, setSelectedTopology] = useState<TopologyType>('boost');
  
  // 调制模式状态
  const [selectedModulation, setSelectedModulation] = useState<ModulationType>('CCM');
  
  // 半导体技术状态（多选）
  const [selectedSemiconductors, setSelectedSemiconductors] = useState<SemiconductorTech[]>(['Si']);
  
  // 磁芯材料状态（多选）
  const [selectedCoreMaterials, setSelectedCoreMaterials] = useState<CoreMaterial[]>(['Ferrite']);

  // 切换半导体技术选择
  const toggleSemiconductor = (tech: SemiconductorTech) => {
    setSelectedSemiconductors(prev => {
      if (prev.includes(tech)) {
        // 允许取消所有选择
        return prev.filter(t => t !== tech);
      }
      return [...prev, tech];
    });
  };

  // 切换磁芯材料选择
  const toggleCoreMaterial = (material: CoreMaterial) => {
    setSelectedCoreMaterials(prev => {
      if (prev.includes(material)) {
        // 允许取消所有选择
        return prev.filter(m => m !== material);
      }
      return [...prev, material];
    });
  };

  return (
    <div className="space-y-6">
      {/* 拓扑选择卡片 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
        <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">拓扑选择</h3>
        <p className="text-xs text-gray-400 mb-5">选择变换器拓扑</p>

        {/* 拓扑选择按钮 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SelectButton
            selected={selectedTopology === 'buck'}
            onClick={() => setSelectedTopology('buck')}
          >
            Buck
          </SelectButton>
          <SelectButton
            selected={selectedTopology === 'boost'}
            onClick={() => setSelectedTopology('boost')}
          >
            Boost
          </SelectButton>
          <SelectButton
            selected={selectedTopology === 'buck-boost'}
            onClick={() => setSelectedTopology('buck-boost')}
          >
            Buck-Boost
          </SelectButton>
        </div>

        {/* 当前选择的拓扑信息 */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-600 mb-3">
            您当前选择的变换器拓扑：
            <span className="font-medium text-[#2F54EB] ml-1">
              {topologyInfo[selectedTopology].name}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {topologyInfo[selectedTopology].description}
          </p>
          
          {/* 拓扑电路图 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center min-h-[180px]">
            <img 
              src={topologyInfo[selectedTopology].image}
              alt={topologyInfo[selectedTopology].name}
              className="max-w-full max-h-[160px] object-contain"
              onError={(e) => {
                // 图片加载失败时显示占位符
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="text-center text-gray-400">
                    <svg class="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <p class="text-sm">${topologyInfo[selectedTopology].name}</p>
                    <p class="text-xs mt-1">电路图加载中...</p>
                  </div>
                `;
              }}
            />
          </div>
        </div>
      </div>

      {/* 调制方案卡片 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
        <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">调制方案</h3>
        <p className="text-xs text-gray-400 mb-5">选择调制与工作模式</p>

        {/* 调制模式选择按钮 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <SelectButton
            selected={selectedModulation === 'CCM'}
            onClick={() => setSelectedModulation('CCM')}
          >
            CCM
          </SelectButton>
          <SelectButton
            selected={selectedModulation === 'DCM'}
            onClick={() => setSelectedModulation('DCM')}
          >
            DCM
          </SelectButton>
          <SelectButton
            selected={selectedModulation === 'BCM'}
            onClick={() => setSelectedModulation('BCM')}
          >
            BCM
          </SelectButton>
        </div>

        {/* 当前选择的调制模式说明 */}
        <div className="bg-[#F8FAFC] rounded-lg p-3 border border-gray-100">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2F54EB] mt-1.5 shrink-0"></div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                {modulationInfo[selectedModulation].name}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {modulationInfo[selectedModulation].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 关键技术选型卡片 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
        <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">关键技术选型</h3>
        <p className="text-xs text-gray-400 mb-5">限定元器件技术范围（可选，可多选）</p>

        <div className="space-y-5">
          {/* 半导体技术 */}
          <div>
            <div className="text-sm text-gray-600 mb-3 font-medium">半导体技术</div>
            <div className="flex flex-wrap gap-2">
              <MultiSelectButton
                selected={selectedSemiconductors.includes('Si')}
                onClick={() => toggleSemiconductor('Si')}
              >
                Si (硅)
              </MultiSelectButton>
              <MultiSelectButton
                selected={selectedSemiconductors.includes('GaN')}
                onClick={() => toggleSemiconductor('GaN')}
              >
                GaN (氮化镓)
              </MultiSelectButton>
              <MultiSelectButton
                selected={selectedSemiconductors.includes('SiC')}
                onClick={() => toggleSemiconductor('SiC')}
              >
                SiC (碳化硅)
              </MultiSelectButton>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              已选择: {selectedSemiconductors.map(s => 
                s === 'Si' ? '硅' : s === 'GaN' ? '氮化镓' : '碳化硅'
              ).join('、')}
            </p>
          </div>

          {/* 磁芯材料 */}
          <div>
            <div className="text-sm text-gray-600 mb-3 font-medium">磁芯材料 (主电感)</div>
            <div className="flex flex-wrap gap-2">
              <MultiSelectButton
                selected={selectedCoreMaterials.includes('Ferrite')}
                onClick={() => toggleCoreMaterial('Ferrite')}
              >
                Ferrite (铁氧体)
              </MultiSelectButton>
              <MultiSelectButton
                selected={selectedCoreMaterials.includes('PowderCore')}
                onClick={() => toggleCoreMaterial('PowderCore')}
              >
                Powder Core (磁粉芯)
              </MultiSelectButton>
              <MultiSelectButton
                selected={selectedCoreMaterials.includes('Amorphous')}
                onClick={() => toggleCoreMaterial('Amorphous')}
              >
                Amorphous (非晶)
              </MultiSelectButton>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              已选择: {selectedCoreMaterials.map(m => 
                m === 'Ferrite' ? '铁氧体' : m === 'PowderCore' ? '磁粉芯' : '非晶'
              ).join('、')}
            </p>
          </div>
        </div>
      </div>

      {/* 锁定方案并继续按钮 */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onLockAndContinue}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-[#2F54EB] to-[#5B5FC7] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
        >
          <Lock size={16} className="mr-2" />
          锁定方案并继续
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

interface ProfessionalPanelProps {
  onClose?: () => void;
  // 预留实时计算相关接口，后续可由上层传入真实数据
  progress?: number; // 0-100 总进度
  currentTopology?: string;
  currentMode?: string;
  currentSweepIndex?: number;
  totalSweepCount?: number;
  currentFreq?: string;
  currentInductance?: string;
  elapsed?: string;
  eta?: string;
  foundCount?: number;
  logs?: string[];
  onPause?: () => void;
  onStop?: () => void;
}

const ProfessionalPanel: React.FC<ProfessionalPanelProps> = ({
  onClose,
  progress = 35,
  currentTopology = 'Boost',
  currentMode = 'CCM',
  currentSweepIndex = 18,
  totalSweepCount = 48,
  currentFreq = '150.0 kHz',
  currentInductance = '20.0 µH',
  elapsed = '00:02:15',
  eta = '00:04:30',
  foundCount = 112,
  logs = [],
  onPause,
  onStop,
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'design' | 'calc' | 'expert'>('design');

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

  const [touched, setTouched] = useState<Record<string, boolean>>({
    inputVoltage: false,
    outputVoltage: false,
    outputPower: false,
    vInMin: false,
    vInMax: false,
    vInPoints: false,
    pOutMin: false,
    pOutMax: false,
    pOutPoints: false,
    effWeight: false,
    costWeight: false,
    volWeight: false,
    freq: false,
    inductance: false,
    maxAmbTemp: false,
    maxJuncTemp: false,
    maxCoreTemp: false,
    ripple: false,
    lRatio: false
  });

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
      <div className="px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4 md:space-x-6">
          <button 
            onClick={onClose}
            className="flex items-center text-[#2F54EB] hover:opacity-80 transition-opacity"
          >
            <ArrowLeftCircle className="w-5 h-5 mr-1 md:mr-2" />
            <span className="font-medium text-sm hidden sm:inline">专业模式</span>
            <span className="font-medium text-sm sm:hidden">返回</span>
          </button>
          
          {/* Tabs */}
          <div className="flex bg-transparent space-x-1 md:space-x-2">
            <button
              onClick={() => setActiveTab('params')}
              className={`px-3 md:px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'params' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              参数面板
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-3 md:px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'design' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              设计方案
            </button>
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-3 md:px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'calc' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              实时计算
            </button>
            <button
              onClick={() => setActiveTab('expert')}
              className={`px-3 md:px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'expert' 
                  ? 'bg-white text-[#2F54EB] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              算法导出
            </button>
          </div>
        </div>

        {/* Logo - Hide on small screens */}
        <div className="opacity-90 hidden sm:block">
          <PecLogoIcon />
        </div>
      </div>

      {/* --- Scrollable Content Area --- */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 scrollbar-thin space-y-4">
        {activeTab === 'params' ? (
          /* 参数面板内容 */
          <>
            {/* Card 1: System Specs */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-white/50">
              <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">系统规格</h3>
              <p className="text-xs text-gray-400 mb-4 md:mb-5">核心电气规格</p>

              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,1fr] items-start gap-6 md:gap-8">
                {/* Left Column: Basic Inputs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm w-24">输入电压</span>
                    <ProInput 
                      value={formData.inputVoltage} 
                      unit="V" 
                      width="w-16 md:w-20" 
                      onChange={(v) => handleChange('inputVoltage', v)}
                      onBlur={() => handleBlur('inputVoltage')}
                      error={getError('inputVoltage')}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm w-24">输出电压</span>
                    <ProInput 
                      value={formData.outputVoltage} 
                      unit="V" 
                      width="w-16 md:w-20" 
                      onChange={(v) => handleChange('outputVoltage', v)}
                      onBlur={() => handleBlur('outputVoltage')}
                      error={getError('outputVoltage')}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm w-24">输出功率</span>
                    <ProInput 
                      value={formData.outputPower} 
                      unit="W" 
                      width="w-16 md:w-20" 
                      onChange={(v) => handleChange('outputPower', v)}
                      onBlur={() => handleBlur('outputPower')}
                      error={getError('outputPower')}
                    />
                  </div>
                </div>

                {/* Right Column: Range Inputs */}
                <div className="space-y-4 lg:min-w-[420px]">
                  <div className="text-xs text-gray-500 font-medium">最差工况搜索范围</div>
                  <div className="space-y-3">
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
                     
                     <div className="space-y-3 mt-4">
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
                     <CustomPieChart 
                       effWeight={formData.effWeight}
                       costWeight={formData.costWeight}
                       volWeight={formData.volWeight}
                     />
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
                      width="w-24" 
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
                      width="w-24" 
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
                        width="w-24" 
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
                        width="w-24" 
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
                        width="w-24" 
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
                        width="w-24" 
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
                        width="w-24" 
                        onChange={(v) => handleChange('lRatio', v)}
                        onBlur={() => handleBlur('lRatio')}
                        error={getError('lRatio')}
                      />
                    </div>
                 </div>
              </div>
            </div>
          </>
        ) : activeTab === 'design' ? (
          /* 设计方案内容 */
          <DesignPanel onLockAndContinue={() => {}} />
        ) : activeTab === 'expert' ? (
          /* 算法导出内容 */
          <ExpertTuningPanel />
        ) : (
          /* 实时计算内容 */
          <div className="space-y-4">
            {/* 进度与控制 */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
              <h3 className="text-[#2F54EB] font-medium text-[15px] mb-3">进度与控制</h3>

              <div className="space-y-3">
                {/* 总进度 */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>总进度</span>
                  <span className="text-[#2F54EB] font-medium">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-[#E8EDFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B5FC7] to-[#2F54EB] rounded-full transition-all"
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                  />
                </div>

                {/* 当前任务状态 + 控制按钮 */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr,180px] gap-4">
                  <div className="space-y-3">
                    <div className="bg-[#F6F8FF] border border-[#E1E6FF] rounded-xl p-3 text-sm text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-gray-500 text-xs">当前拓扑</div>
                        <div className="font-medium text-gray-800">
                          {currentTopology} ({currentMode})
                        </div>
                        <div className="text-xs text-gray-600">
                          正在处理全局组合 ({currentSweepIndex} / {totalSweepCount})
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 whitespace-nowrap md:text-right">
                        f_sw = {currentFreq}, L = {currentInductance}
                      </div>
                    </div>

                    <div className="bg-[#F6F8FF] border border-[#E1E6FF] rounded-xl p-3 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center justify-between md:block">
                        <div className="text-xs text-gray-500 mb-1">已用时</div>
                        <div className="font-medium">{elapsed}</div>
                      </div>
                      <div className="flex items-center justify-between md:block">
                        <div className="text-xs text-gray-500 mb-1">预计剩余</div>
                        <div className="font-medium">{eta}</div>
                      </div>
                      <div className="flex items-center justify-between md:block">
                        <div className="text-xs text-gray-500 mb-1">已发现帕累托最优解</div>
                        <div className="font-medium">{foundCount}个</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-stretch gap-3 justify-center">
                    <button
                      onClick={onPause}
                      className="flex items-center justify-center w-full lg:w-auto lg:flex-1 px-4 py-3 bg-white border border-[#2F54EB] text-[#2F54EB] rounded-xl font-medium hover:bg-[#EEF2FF] transition-colors"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      暂停
                    </button>
                    <button
                      onClick={onStop}
                      className="flex items-center justify-center w-full lg:w-auto lg:flex-1 px-4 py-3 bg-gradient-to-r from-[#2F54EB] to-[#5B5FC7] text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      停止
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 日志与帕累托图 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* 计算日志 */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
                <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">计算日志</h3>
                <p className="text-xs text-gray-400 mb-4">详细计算日志（实时刷新）</p>
                <div className="bg-[#F6F8FF] border border-[#E1E6FF] rounded-xl p-3 h-64 overflow-auto text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {logs.length > 0 ? (
                    logs.map((line, idx) => <div key={idx}>{line}</div>)
                  ) : (
                    <div className="space-y-1">
                      <div>20:35:10 [INFO] — 开始处理组合；f_sw=150kHz, L=20µH</div>
                      <div>20:35:10 [INFO] — 行为选择：调整电磁建模权重...</div>
                      <div>20:35:11 [INFO] — 行为结束：搜索稳定工况... 完成。</div>
                      <div>20:35:11 [INFO] — 启动局部最优优化...</div>
                      <div>20:35:12 [INFO] — [热约束] 找到3/20个候选解。</div>
                      <div>20:35:13 [INFO] — [磁件] 找到7个候选解。</div>
                      <div>20:35:19 [INFO] — [电容] 找到15个候选解。</div>
                      <div>20:35:21 [INFO] — 系统提示：在当前组合下发现 4 个新的全局托最优解。</div>
                      <div>…</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 实时帕累托前沿图 */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-white/50">
                <h3 className="text-[#2F54EB] font-medium text-[15px] mb-1">实时帕累托前沿图</h3>
                <p className="text-xs text-gray-400 mb-4">帕累托前沿构建过程</p>
                <div className="bg-[#F6F8FF] border border-[#E1E6FF] rounded-xl p-3 h-64 flex items-center justify-center">
                  <div className="text-center text-xs text-gray-500">
                    <div className="text-sm font-medium text-gray-700 mb-2">图表占位</div>
                    <p>预留 3D/2D 帕累托点云渲染区域</p>
                    <p className="mt-1 text-[11px] text-gray-400">（后续可接入 WebGL / Canvas / ECharts）</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPanel;
