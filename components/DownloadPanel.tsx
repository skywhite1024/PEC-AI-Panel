// components/DownloadPanel.tsx
import React, { useState, useEffect } from 'react';
import { Bot, Download, FileText, Table, FileCode, Package, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
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

interface DownloadPanelProps {
  designParams: DesignParams;
  onClose?: () => void;
}

interface DownloadItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  downloading?: boolean;
}

const DownloadItem: React.FC<DownloadItemProps> = ({ icon, title, description, onClick, downloading }) => (
  <div 
    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[#F0F5FF] cursor-pointer transition-colors group"
    onClick={onClick}
  >
    <div className="text-[#5B5FC7] mt-0.5">{icon}</div>
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-[#2F54EB] group-hover:underline">{title}</span>
        {downloading && <span className="text-xs text-gray-400">下载中...</span>}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <Download size={16} className="text-gray-400 group-hover:text-[#5B5FC7] mt-1" />
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

const DownloadPanel: React.FC<DownloadPanelProps> = ({ designParams, onClose }) => {
  const [result, setResult] = useState<DesignResult | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    console.log('DownloadPanel useEffect 执行');
    const designResult = generateDesignResult(designParams);
    setResult(designResult);
    console.log('设计结果生成完成:', designResult);
  }, [designParams]);

  if (!result) {
    return <div className="p-4 text-center text-gray-500">正在生成设计结果...</div>;
  }

  // 下载处理函数 - 现在都是异步的
  const handleDownloadBOM = () => {
    const csv = generateBOMCSV(designParams, result);
    downloadCSV(csv, 'PEC-AI_物料清单(BOM).csv');
  };

  const handleDownloadDesignReport = async () => {
    try {
      const doc = await generateDesignReportPDF(designParams, result);
      downloadPDF(doc, 'PEC-AI_设计报告.pdf');
    } catch (error) {
      console.error('生成设计报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadSemiconductorReport = async () => {
    try {
      const doc = await generateSemiconductorReportPDF(designParams, result);
      downloadPDF(doc, 'PEC-AI_半导体选型与热分析.pdf');
    } catch (error) {
      console.error('生成半导体报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadInductorReport = async () => {
    try {
      const doc = await generateInductorReportPDF(designParams, result);
      downloadPDF(doc, 'PEC-AI_磁性元件设计报告.pdf');
    } catch (error) {
      console.error('生成电感报告失败:', error);
      alert('生成报告失败，请重试');
    }
  };

  const handleDownloadCapacitorReport = async () => {
    try {
      const doc = await generateCapacitorReportPDF(designParams, result);
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
          <div className="font-medium text-sm text-gray-800">[PEC-AI]</div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="text-sm text-gray-600 mb-3">核心指标回顾:</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">效率: <strong className="text-[#2F54EB]">{result.efficiency.toFixed(1)}%</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">成本: <strong className="text-[#2F54EB]">¥{result.cost}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-gray-700">体积: <strong className="text-[#2F54EB]">{result.volume} dm³</strong></span>
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
        所有文件由 PEC-AI 根据您的设计参数自动生成
      </div>
    </div>
  );
};

export default DownloadPanel;