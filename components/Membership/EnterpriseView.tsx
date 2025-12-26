import React from 'react';
import ProjectDesignService from './ProjectDesignService';
import PlatformSubscription from './PlatformSubscription';
import ProductCustomization from './ProductCustomization';

interface EnterpriseViewProps {
  billingCycle: 'monthly' | 'yearly';
  activeTab: 'design' | 'subscription' | 'customization';
  onTabChange: (tab: 'design' | 'subscription' | 'customization') => void;
}

const EnterpriseView: React.FC<EnterpriseViewProps> = ({ billingCycle, activeTab, onTabChange }) => {

  const tabs = [
    { id: 'design', label: '项目设计服务' },
    { id: 'subscription', label: '平台订阅服务' },
    { id: 'customization', label: '产品定制制作' }
  ];

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-white mb-2">
        {activeTab === 'design' && '项目设计服务'}
        {activeTab === 'subscription' && '平台订阅服务'}
        {activeTab === 'customization' && '产品定制制作'}
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        {activeTab === 'design' && '服务配置与定价'}
        {activeTab === 'subscription' && '分级权益体系'}
        {activeTab === 'customization' && '100台起订'}
      </p>

      {/* Tab Navigation */}
      <div className="bg-white/5 backdrop-blur-md p-1 rounded-lg border border-white/10 flex mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'design' && <ProjectDesignService />}
        {activeTab === 'subscription' && <PlatformSubscription billingCycle={billingCycle} />}
        {activeTab === 'customization' && <ProductCustomization />}
      </div>
    </div>
  );
};

export default EnterpriseView;
