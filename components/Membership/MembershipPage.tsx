import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import IndividualView from './IndividualView';
import EnterpriseView from './EnterpriseView';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: any) => void;
  className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, className = '' }) => {
  const selectedIndex = options.findIndex(o => o.value === value);
  const isFirst = selectedIndex === 0;

  return (
    <div className={`bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 flex relative ${className}`}>
      {/* Sliding Indicator */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 shadow-lg ${
          isFirst ? 'left-1' : 'left-[calc(50%+4px)]'
        }`}
      ></div>
      
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 flex-1 min-w-[100px] text-center ${
            value === option.value ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

interface MembershipPageProps {
  onClose: () => void;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ onClose }) => {
  const [viewMode, setViewMode] = useState<'individual' | 'enterprise'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [enterpriseTab, setEnterpriseTab] = useState<'design' | 'subscription' | 'customization'>('design');

  const showBillingCycle = viewMode === 'individual' || (viewMode === 'enterprise' && enterpriseTab === 'subscription');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]">
      {/* Background with radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] opacity-90"></div>
      
      {/* Glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col px-6 pt-6 md:px-12 shrink-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-wider">PEC<span className="text-blue-400">AI</span></span>
              <span className="text-white/50 text-sm border-l border-white/20 pl-2 ml-2">会员与商业服务</span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Controls - Justify Between */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
             <SegmentedControl 
               value={viewMode} 
               onChange={setViewMode} 
               options={[
                 {value: 'individual', label: '个人 (Individual)'}, 
                 {value: 'enterprise', label: '企业 (Enterprise)'}
               ]} 
               className="min-w-[360px]"
             />
             
             {showBillingCycle && (
               <SegmentedControl 
                 value={billingCycle} 
                 onChange={setBillingCycle} 
                 options={[
                   {value: 'monthly', label: '每月 (Monthly)'}, 
                   {value: 'yearly', label: '每年 (Yearly)'}
                 ]} 
                 className="min-w-[320px] animate-in fade-in duration-300"
               />
             )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-32 z-10 scrollbar-thin">
          <div className="max-w-7xl mx-auto h-full">
            {viewMode === 'individual' ? (
              <IndividualView billingCycle={billingCycle} />
            ) : (
              <EnterpriseView 
                billingCycle={billingCycle}
                activeTab={enterpriseTab}
                onTabChange={setEnterpriseTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
