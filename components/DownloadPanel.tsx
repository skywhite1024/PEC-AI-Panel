// components/DownloadPanel.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Download, 
  FileText, 
  FileCode, 
  Package, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  MessageSquare,
  Table,
  Clock
} from 'lucide-react';
import {
  DesignParams,
  DesignResult,
  generateDesignResult,
  generateDesignReportPDF,
  generateSemiconductorReportPDF,
  generateInductorReportPDF,
  generateCapacitorReportPDF,
  generateBOMCSV,
  downloadPDF,
  downloadCSV,
} from '../services/reportGenerator';
import { ExtractedDesign } from '../services/designExtractor';

interface DownloadPanelProps {
  designParams: DesignParams | null;
  designResult: DesignResult | null;
  extractedDesign: ExtractedDesign | null;
  designSummary: string;
  isExtracting: boolean;
  hasValidDesign: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

interface DownloadItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

const DownloadItem: React.FC<DownloadItemProps> = ({ icon, title, description, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-start space-x-3 p-2 rounded-lg transition-colors text-left ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-[#F0F5FF] cursor-pointer'
    }`}
  >
    <div className={`shrink-0 ${disabled ? 'text-gray-400' : 'text-[#5B5FC7]'}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} truncate`}>{title}</div>
      <div className="text-xs text-gray-400 truncate">{description}</div>
    </div>
  </button>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button 
        className="w-full flex items-center justify-between py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {expanded && <div className="pb-3 space-y-1">{children}</div>}
    </div>
  );
};

// 生成状态类型
type GenerationStatus = 'idle' | 'generating' | 'completed';

// 生成进度步骤 - 包含权重
interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed';
  weight: number; // 时间权重（占总时间的百分比）
}

const DownloadPanel: React.FC<DownloadPanelProps> = ({ 
  designParams, 
  designResult,
  extractedDesign,
  designSummary,
  isExtracting,
  hasValidDesign,
  onClose,
  onConfirm
}) => {
  const [downloadingAll, setDownloadingAll] = useState(false);
  
  // 新增：生成状态管理
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [estimatedTime, setEstimatedTime] = useState<number>(0); // 预计时间（分钟）
  const [elapsedTime, setElapsedTime] = useState<number>(0); // 已用时间（秒）
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // 6个步骤，每个步骤有不同的时间权重
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: 'semiconductor', name: '半导体器件迭代优化', status: 'pending', weight: 25 },
    { id: 'inductor', name: '电感参数迭代优化', status: 'pending', weight: 20 },
    { id: 'capacitor', name: '电容参数迭代优化', status: 'pending', weight: 15 },
    { id: 'pareto', name: '筛选帕累托最优解', status: 'pending', weight: 20 },
    { id: 'report', name: '生成设计报告', status: 'pending', weight: 10 },
    { id: 'package', name: '报告资料打包', status: 'pending', weight: 10 },
  ]);

  // 随机选择延迟时间（1、1.5、2分钟）
  const getRandomDelayMinutes = (): number => {
    const delays = [1, 1.5, 2];
    return delays[Math.floor(Math.random() * delays.length)];
  };

  // 计算累积权重阈值
  const getWeightThresholds = () => {
    let cumulative = 0;
    return generationSteps.map(step => {
      cumulative += step.weight;
      return cumulative;
    });
  };

  // 开始生成方案
  const startGeneration = () => {
    const delay = getRandomDelayMinutes();
    setEstimatedTime(delay);
    setElapsedTime(0);
    setCurrentStep(0);
    setGenerationStatus('generating');
    
    // 重置所有步骤状态
    setGenerationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  // 计时器效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (generationStatus === 'generating') {
      timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          const totalSeconds = estimatedTime * 60;
          
          // 计算当前进度百分比
          const progressPercent = (newTime / totalSeconds) * 100;
          
          // 根据权重阈值确定当前步骤
          const thresholds = getWeightThresholds();
          let stepIndex = 0;
          for (let i = 0; i < thresholds.length; i++) {
            if (progressPercent < thresholds[i]) {
              stepIndex = i;
              break;
            }
            stepIndex = i;
          }
          
          // 更新步骤状态
          setGenerationSteps(prevSteps => 
            prevSteps.map((step, idx) => ({
              ...step,
              status: idx < stepIndex ? 'completed' : 
                      idx === stepIndex ? 'processing' : 'pending'
            }))
          );
          setCurrentStep(stepIndex);
          
          // 检查是否完成
          if (newTime >= totalSeconds) {
            setGenerationStatus('completed');
            // 将所有步骤标记为完成
            setGenerationSteps(prevSteps => 
              prevSteps.map(step => ({ ...step, status: 'completed' }))
            );
            clearInterval(timer);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [generationStatus, estimatedTime]);

  // 计算进度百分比
  const getProgressPercentage = (): number => {
    if (generationStatus === 'completed') return 100;
    if (generationStatus === 'idle') return 0;
    return Math.min(99, Math.round((elapsedTime / (estimatedTime * 60)) * 100));
  };

  // 格式化预计时间显示
  const formatEstimatedTime = (): string => {
    if (estimatedTime === 1) return '1 分钟';
    if (estimatedTime === 1.5) return '1 分 30 秒';
    if (estimatedTime === 2) return '2 分钟';
    return `${estimatedTime} 分钟`;
  };

  // 如果正在提取
  if (isExtracting) {
    return (
      <div className="bg-[#F0F5FF] rounded-2xl p-4 md:p-6 w-full max-w-full shadow-sm">
        <div className="flex flex-col items-center justify-center py-6 md:py-8">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#5B5FC7] animate-spin mb-4" />
          <p className="text-sm text-gray-600 text-center">正在分析对话内容，提取设计参数...</p>
          <p className="text-xs text-gray-400 mt-2">这可能需要几秒钟</p>
        </div>
      </div>
    );
  }

  // 如果没有有效设计
  if (!hasValidDesign || !designParams || !designResult) {
    return (
      <div className="bg-[#FFF7ED] rounded-2xl p-4 md:p-6 w-full max-w-full shadow-sm">
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm md:text-base">设计信息不完整</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              需要更多信息才能生成设计方案。请在对话中提供以下参数：
            </p>
            <ul className="text-xs md:text-sm text-gray-500 space-y-1">
              {extractedDesign?.missingFields.map((field, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0"></span>
                  <span className="truncate">
                    {field === 'inputVoltage' && '输入电压（如：48V）'}
                    {field === 'outputVoltage' && '输出电压（如：100V）'}
                    {field === 'outputPower' && '输出功率（如：500W）'}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-4">
              提示：您可以说"帮我设计一个48V输入、100V输出、500W的升压变换器"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 如果还没开始生成或正在生成中
  if (generationStatus === 'idle' || generationStatus === 'generating') {
    return (
      <div className="bg-[#F0F5FF] rounded-2xl p-3 md:p-5 w-full max-w-full shadow-sm">
        {/* AI 头像和标题 */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
            <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-800">[PEC-AI] 设计方案生成</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {generationStatus === 'idle' ? '准备就绪' : '正在生成中...'}
            </div>
          </div>
        </div>

        {/* 设计摘要 */}
        {extractedDesign && (
          <div className="bg-white rounded-xl p-3 md:p-4 mb-4 shadow-sm">
            <div className="text-xs md:text-sm text-gray-600 mb-2">提取的设计需求:</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">拓扑:</span>
                <span className="font-medium truncate ml-1">
                  {extractedDesign.topology === 'boost' ? 'Boost' :
                  extractedDesign.topology === 'buck' ? 'Buck' :
                  extractedDesign.topology === 'buck-boost' ? 'Buck-Boost' :
                  extractedDesign.topology}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">输入:</span>
                <span className="font-medium truncate ml-1">
                  {extractedDesign.inputVoltageMin && extractedDesign.inputVoltageMax 
                    ? `${extractedDesign.inputVoltageMin}-${extractedDesign.inputVoltageMax}V`
                    : `${extractedDesign.inputVoltage}V`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">输出:</span>
                <span className="font-medium truncate ml-1">{extractedDesign.outputVoltage}V</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">功率:</span>
                <span className="font-medium truncate ml-1">{extractedDesign.outputPower}W</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">策略:</span>
                <span className="font-medium truncate ml-1">
                  {extractedDesign.priority === 'efficiency' ? '效率优先' :
                  extractedDesign.priority === 'cost' ? '成本优先' :
                  extractedDesign.priority === 'volume' ? '体积优先' : '均衡设计'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">置信度:</span>
                <span className={`font-medium ${extractedDesign.confidence > 0.8 ? 'text-green-600' : extractedDesign.confidence > 0.5 ? 'text-yellow-600' : 'text-orange-500'}`}>
                  {(extractedDesign.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 生成状态 */}
        {generationStatus === 'generating' ? (
          <div className="bg-white rounded-xl p-3 md:p-4 mb-4 shadow-sm">
            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-gray-700">生成进度</span>
                <span className="text-xs md:text-sm text-[#5B5FC7] font-medium">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#5B5FC7] to-[#7C3AED] transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* 预计时间信息 */}
            <div className="flex items-center justify-between text-xs md:text-sm mb-4 p-2 md:p-3 bg-[#F0F5FF] rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-[#5B5FC7]" />
                <span className="text-gray-600">预计耗时</span>
              </div>
              <span className="font-medium text-[#5B5FC7]">{formatEstimatedTime()}</span>
            </div>

            {/* 步骤列表 */}
            <div className="space-y-1.5 md:space-y-2">
              {generationSteps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-2 md:space-x-3 p-1.5 md:p-2 rounded-lg transition-all duration-300 ${
                    step.status === 'processing' ? 'bg-[#EEF2FF]' : ''
                  }`}
                >
                  <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : step.status === 'processing' ? (
                      <Loader2 size={16} className="text-[#5B5FC7] animate-spin" />
                    ) : (
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <span className={`text-xs md:text-sm truncate ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'processing' ? 'text-[#5B5FC7] font-medium' :
                    'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>

            {/* 提示信息 */}
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">
                💡 正在运行多目标优化算法，探索数万种元器件组合...
              </p>
            </div>
          </div>
        ) : (
          /* 开始生成按钮 */
          <div className="bg-white rounded-xl p-3 md:p-4 mb-4 shadow-sm">
            <div className="text-center">
              <div className="mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-[#EEF2FF] rounded-full flex items-center justify-center mb-2 md:mb-3">
                  <Package size={24} className="text-[#5B5FC7] md:hidden" />
                  <Package size={32} className="text-[#5B5FC7] hidden md:block" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1 text-sm md:text-base">准备生成设计方案</h3>
                <p className="text-xs md:text-sm text-gray-500">
                  PEC-AI 将为您运行多目标优化算法
                </p>
              </div>
              
              <div className="text-xs text-gray-400 mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg text-left">
                <p className="mb-1 font-medium">将生成以下文件：</p>
                <ul className="space-y-0.5">
                  <li>• 物料清单 (BOM)</li>
                  <li>• 完整设计报告</li>
                  <li>• 半导体选型与热分析</li>
                  <li>• 磁性元件设计报告</li>
                  <li>• 电容选型报告</li>
                </ul>
              </div>

              <button
                onClick={startGeneration}
                className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-[#5B5FC7] to-[#7C3AED] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
              >
                <Download size={16} className="mr-2" />
                开始生成设计方案
              </button>
              
              <p className="text-xs text-gray-400 mt-2 md:mt-3">
                预计需要 1-2 分钟
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 生成完成后的下载界面
  // 下载处理函数
  const handleDownloadBOM = () => {
    const csv = generateBOMCSV(designParams, designResult);
    downloadCSV(csv, 'PEC-AI_物料清单(BOM).csv');
  };

  const handleDownloadDesignReport = async () => {
    try {
      const doc = await generateDesignReportPDF(designParams, designResult);
      downloadPDF(doc, 'PEC-AI_设计报告.pdf');
    } catch (error) {
      console.error('生成设计报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadSemiconductorReport = async () => {
    try {
      const doc = await generateSemiconductorReportPDF(designParams, designResult);
      downloadPDF(doc, 'PEC-AI_半导体选型与热分析.pdf');
    } catch (error) {
      console.error('生成半导体报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadInductorReport = async () => {
    try {
      const doc = await generateInductorReportPDF(designParams, designResult);
      downloadPDF(doc, 'PEC-AI_磁性元件设计报告.pdf');
    } catch (error) {
      console.error('生成电感报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadCapacitorReport = async () => {
    try {
      const doc = await generateCapacitorReportPDF(designParams, designResult);
      downloadPDF(doc, 'PEC-AI_电容选型报告.pdf');
    } catch (error) {
      console.error('生成电容报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      await handleDownloadDesignReport();
      await new Promise(resolve => setTimeout(resolve, 300));
      handleDownloadBOM();
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleDownloadSemiconductorReport();
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleDownloadInductorReport();
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleDownloadCapacitorReport();
      
      onConfirm?.();
    } catch (error) {
      console.error('批量下载失败:', error);
    } finally {
      setDownloadingAll(false);
    }
  };

  // 生成完成后的下载界面
  return (
    <div className="bg-[#F0F5FF] rounded-2xl p-3 md:p-5 w-full max-w-full shadow-sm overflow-hidden">
      {/* AI 头像和标题 */}
      <div className="flex items-start space-x-3 mb-3 md:mb-4">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
          <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800">[PEC-AI] 设计方案已就绪</div>
          <div className="text-xs text-gray-500 mt-0.5">
            优化完成，用时 {formatEstimatedTime()}
          </div>
        </div>
      </div>

      {/* 成功提示 */}
      <div className="bg-green-50 rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 flex items-center space-x-2">
        <CheckCircle size={16} className="text-green-500 shrink-0" />
        <span className="text-xs md:text-sm text-green-700 truncate">设计方案生成成功！共找到 3 个帕累托最优解</span>
      </div>

      {/* 设计摘要 - 移动端简化显示 */}
      {extractedDesign && (
        <div className="bg-white rounded-xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm">
          <div className="text-xs md:text-sm text-gray-600 mb-2">设计需求:</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">拓扑:</span>
              <span className="font-medium">
                {extractedDesign.topology === 'boost' ? 'Boost' :
                extractedDesign.topology === 'buck' ? 'Buck' : 'Buck-Boost'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">输入:</span>
              <span className="font-medium">
                {extractedDesign.inputVoltageMin && extractedDesign.inputVoltageMax 
                  ? `${extractedDesign.inputVoltageMin}-${extractedDesign.inputVoltageMax}V`
                  : `${extractedDesign.inputVoltage}V`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">输出:</span>
              <span className="font-medium">{extractedDesign.outputVoltage}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">功率:</span>
              <span className="font-medium">{extractedDesign.outputPower}W</span>
            </div>
          </div>
        </div>
      )}

      {/* 核心指标 - 移动端紧凑布局 */}
      <div className="bg-white rounded-xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm">
        <div className="text-xs md:text-sm text-gray-600 mb-2">优化结果:</div>
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center space-x-1">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span className="text-gray-700">效率: <strong className="text-[#2F54EB]">{designResult.efficiency.toFixed(1)}%</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span className="text-gray-700">成本: <strong className="text-[#2F54EB]">¥{designResult.cost}</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span className="text-gray-700">体积: <strong className="text-[#2F54EB]">{designResult.volume}dm³</strong></span>
          </div>
        </div>
      </div>

      {/* 文件清单标题 */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-xs md:text-sm font-medium text-gray-700">文件清单</span>
        <button 
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="flex items-center space-x-1 bg-[#5B5FC7] text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-medium hover:bg-[#4a4ea3] transition-colors disabled:opacity-50"
        >
          <Package size={12} />
          <span>{downloadingAll ? '打包中...' : '一键下载'}</span>
        </button>
      </div>

      {/* 下载列表 - 移动端优化 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-2 md:p-3">
          <Section title="1. 核心文档">
            <DownloadItem 
              icon={<Table size={16} />}
              title="物料清单 (BOM)"
              description="元器件型号、参数及成本"
              onClick={handleDownloadBOM}
            />
            <DownloadItem 
              icon={<FileText size={16} />}
              title="完整设计报告"
              description="系统规格、损耗与热分析"
              onClick={handleDownloadDesignReport}
            />
          </Section>

          <Section title="2. 元器件报告">
            <DownloadItem 
              icon={<FileText size={16} />}
              title="半导体选型"
              description="MOSFET/二极管型号及热分析"
              onClick={handleDownloadSemiconductorReport}
            />
            <DownloadItem 
              icon={<FileText size={16} />}
              title="磁性元件设计"
              description="电感磁芯、匝数及损耗"
              onClick={handleDownloadInductorReport}
            />
            <DownloadItem 
              icon={<FileText size={16} />}
              title="电容选型"
              description="输入/输出电容型号及纹波"
              onClick={handleDownloadCapacitorReport}
            />
          </Section>

          <Section title="3. 仿真文件 (可选)" defaultExpanded={false}>
            <DownloadItem 
              icon={<FileCode size={16} />}
              title="性能仿真模型"
              description="预配置的仿真模型文件"
              onClick={() => alert('抱歉，仿真文件当前设备不支持...')}
            />
          </Section>
        </div>
      </div>

      {/* 进入问答模式按钮 */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-[#5B5FC7] to-[#7C3AED] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
        >
          <MessageSquare size={16} className="mr-2" />
          进入问答模式
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          您可以针对此方案向AI提问
        </p>
      </div>
    </div>
  );
};

export default DownloadPanel;