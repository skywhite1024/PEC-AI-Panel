// components/DownloadPanel.tsx
import React, { useState, useEffect } from 'react';
import { Bot, Download, FileText, Table, FileCode, Package, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
}

interface DownloadItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  downloading?: boolean;
  disabled?: boolean;
}

const DownloadItem: React.FC<DownloadItemProps> = ({ icon, title, description, onClick, downloading, disabled }) => (
  <div 
    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors group ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-[#F0F5FF] cursor-pointer'
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <div className={`mt-0.5 ${disabled ? 'text-gray-400' : 'text-[#5B5FC7]'}`}>{icon}</div>
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-[#2F54EB] group-hover:underline'}`}>
          {title}
        </span>
        {downloading && <span className="text-xs text-gray-400">下载中...</span>}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <Download size={16} className={`mt-1 ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-[#5B5FC7]'}`} />
  </div>
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

const DownloadPanel: React.FC<DownloadPanelProps> = ({ 
  designParams, 
  designResult,
  extractedDesign,
  designSummary,
  isExtracting,
  hasValidDesign,
  onClose 
}) => {
  const [downloadingAll, setDownloadingAll] = useState(false);

  // 如果正在提取
  if (isExtracting) {
    return (
      <div className="bg-[#F0F5FF] rounded-2xl p-6 max-w-full shadow-sm">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-12 h-12 text-[#5B5FC7] animate-spin mb-4" />
          <p className="text-sm text-gray-600">正在分析对话内容，提取设计参数...</p>
          <p className="text-xs text-gray-400 mt-2">这可能需要几秒钟</p>
        </div>
      </div>
    );
  }

  // 如果没有有效设计
  if (!hasValidDesign || !designParams || !designResult) {
    return (
      <div className="bg-[#FFF7ED] rounded-2xl p-6 max-w-full shadow-sm">
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800 mb-1">设计信息不完整</h3>
            <p className="text-sm text-gray-600 mb-3">
              需要更多信息才能生成设计方案。请在对话中提供以下参数：
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              {extractedDesign?.missingFields.map((field, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  <span>
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
    } catch (error) {
      console.error('批量下载失败:', error);
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="bg-[#F0F5FF] rounded-2xl p-4 md:p-5 max-w-full shadow-sm">
      {/* AI 头像和标题 */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
          <Bot className="text-white w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800">[PEC-AI] 设计方案已就绪</div>
          <div className="text-xs text-gray-500 mt-0.5">
            基于您的对话内容自动生成
          </div>
        </div>
      </div>

      {/* 设计摘要 */}
      {extractedDesign && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">提取的设计需求:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">拓扑:</span>
              <span className="font-medium">{extractedDesign.topology}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">输入电压:</span>
              <span className="font-medium">{extractedDesign.inputVoltage}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">输出电压:</span>
              <span className="font-medium">{extractedDesign.outputVoltage}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">输出功率:</span>
              <span className="font-medium">{extractedDesign.outputPower}W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">优化策略:</span>
              <span className="font-medium">
                {extractedDesign.priority === 'efficiency' ? '效率优先' :
                 extractedDesign.priority === 'cost' ? '成本优先' :
                 extractedDesign.priority === 'volume' ? '体积优先' : '均衡设计'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">置信度:</span>
              <span className={`font-medium ${extractedDesign.confidence > 0.8 ? 'text-green-600' : 'text-orange-500'}`}>
                {(extractedDesign.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 核心指标 */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="text-sm text-gray-600 mb-3">优化结果:</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">效率: <strong className="text-[#2F54EB]">{designResult.efficiency.toFixed(1)}%</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">成本: <strong className="text-[#2F54EB]">¥{designResult.cost}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">体积: <strong className="text-[#2F54EB]">{designResult.volume} dm³</strong></span>
          </div>
        </div>
      </div>

      {/* 文件清单标题 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">文件清单</span>
        <button 
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="flex items-center space-x-1.5 bg-[#5B5FC7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#4a4ea3] transition-colors disabled:opacity-50"
        >
          <Package size={14} />
          <span>{downloadingAll ? '打包中...' : '一键打包下载'}</span>
        </button>
      </div>

      {/* 下载列表 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-3">
          <Section title="1. 核心设计文档">
            <DownloadItem 
              icon={<Table size={18} />}
              title="物料清单 (BOM) [下载.csv]"
              description="包含所有元器件的推荐型号、制造商、关键参数及预估成本"
              onClick={handleDownloadBOM}
            />
            <DownloadItem 
              icon={<FileText size={18} />}
              title="完整设计报告 [下载.pdf]"
              description="包含系统规格、优化目标、BOM、损耗分析和热分析的完整报告"
              onClick={handleDownloadDesignReport}
            />
          </Section>

          <Section title="2. 元器件详细设计报告">
            <DownloadItem 
              icon={<FileText size={18} />}
              title="半导体选型与热分析 [下载.pdf]"
              description="MOSFET和二极管的型号、损耗计算及预计结温"
              onClick={handleDownloadSemiconductorReport}
            />
            <DownloadItem 
              icon={<FileText size={18} />}
              title="磁性元件设计报告 [下载.pdf]"
              description="电感的磁芯型号、匝数、气隙、损耗和温升计算"
              onClick={handleDownloadInductorReport}
            />
            <DownloadItem 
              icon={<FileText size={18} />}
              title="电容选型报告 [下载.pdf]"
              description="输入/输出电容的型号、纹波电流和电压计算"
              onClick={handleDownloadCapacitorReport}
            />
          </Section>

          <Section title="3. 仿真与验证文件 (可选)" defaultExpanded={false}>
            <DownloadItem 
              icon={<FileCode size={18} />}
              title="性能仿真模型 [下载.plecs]"
              description="预配置的仿真模型文件，可直接运行验证电路性能"
              onClick={() => alert('仿真模型功能开发中...')}
            />
            <DownloadItem 
              icon={<FileText size={18} />}
              title="详细性能分析报告 [下载.pdf]"
              description="包含效率曲线、损耗分布图、最差工况分析等详细图表"
              onClick={handleDownloadDesignReport}
            />
          </Section>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        所有文件由 PEC-AI 根据您的对话内容自动生成
      </div>
    </div>
  );
};

export default DownloadPanel;