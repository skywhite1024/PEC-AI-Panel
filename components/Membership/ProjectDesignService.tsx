import React, { useState, useMemo } from 'react';
import { Check, Star, ChevronRight } from 'lucide-react';
import { handlePaymentIntent } from './utils';
import { QuantityTier } from './types';

const ProjectDesignService: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('pro');
  const [quantityTier, setQuantityTier] = useState<QuantityTier>('4-6');

  const plans = {
    standard: {
      id: 'standard',
      name: '普通设计',
      price: 800,
      desc: '仅支持普通模式'
    },
    pro: {
      id: 'pro',
      name: '专业设计',
      price: 1200,
      desc: '参数全开 | 深度调优',
      recommended: true
    }
  };

  const tiers: { id: QuantityTier; label: string; qty: number; discount: number; isNegotiable?: boolean }[] = [
    { id: '1', label: '1个项目', qty: 1, discount: 0 },
    { id: '2-3', label: '2-3个项目', qty: 3, discount: 100 },
    { id: '4-6', label: '4-6个项目', qty: 5, discount: 200 },
    { id: '>=6', label: '≥6个项目', qty: 10, discount: 0, isNegotiable: true }
  ];

  const currentTier = tiers.find(t => t.id === quantityTier)!;
  const currentPlan = plans[selectedPlan];

  const totalPrice = useMemo(() => {
    if (currentTier.isNegotiable) return 0;
    return (currentPlan.price - currentTier.discount) * currentTier.qty;
  }, [currentPlan, currentTier]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto">
      {/* Left Column: Selection */}
      <div className="flex-1 space-y-8">
        
        {/* Step 1: Design Depth */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-white text-lg mb-4 flex items-center">
            <span className="text-blue-400 mr-2">Step1:</span> 选择设计深度
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.values(plans).map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`relative cursor-pointer rounded-xl p-6 border transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-500 text-white text-[10px] px-6 py-0.5 transform rotate-45 translate-x-4 translate-y-3 shadow-sm">
                      <Star size={8} className="inline mr-0.5" />推荐
                    </div>
                  </div>
                )}
                <h4 className={`text-xl font-bold mb-1 ${selectedPlan === plan.id ? 'text-blue-300' : 'text-white'}`}>{plan.name}</h4>
                <p className="text-gray-400 text-xs mb-4">{plan.desc}</p>
                <div className="text-white">
                  <span className="text-sm">¥</span>
                  <span className="text-3xl font-bold mx-1">{plan.price}</span>
                  <span className="text-xs text-gray-400">/项</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Quantity Tier */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-white text-lg mb-6 flex items-center">
            <span className="text-blue-400 mr-2">Step2:</span> 选择项目数量阶梯
          </h3>
          
          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-between">
            {tiers.map((tier) => {
              const isActive = quantityTier === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setQuantityTier(tier.id)}
                  className={`flex-1 min-w-[100px] cursor-pointer relative group`}
                >
                  {/* Arrow shape container */}
                  <div className={`
                    relative h-14 flex items-center justify-center
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg z-10' 
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}
                    clip-path-arrow
                  `}
                  style={{
                    clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
                    // Adjust first item to be flat on left
                    ...(tier.id === '1' ? { clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)' } : {}),
                     // Adjust last item to be flat on right? No, screenshot shows arrows.
                  }}
                  >
                    <span className="font-bold text-sm relative right-2">{tier.label}</span>
                  </div>
                  
                  {/* Price indication below */}
                  <div className={`text-center mt-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    {tier.isNegotiable ? (
                      <span className="text-white font-bold text-sm">协议价</span>
                    ) : (
                      <>
                         {isActive && <div className="text-[10px] text-blue-300 mb-1">优惠单价</div>}
                         <span className="text-gray-400 text-xs">¥</span>
                         <span className="text-white font-bold text-lg">{currentPlan.price - tier.discount}</span>
                      </>
                    )}
                  </div>

                  {/* Active Indicator Triangle */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-600"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Quote List */}
      <div className="lg:w-80 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col h-fit">
        <h3 className="text-blue-300 text-xl font-bold mb-8">报价清单</h3>
        
        <div className="space-y-6 mb-8 flex-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">{currentPlan.name} (单价)</span>
            <span className="text-white font-mono">¥ {currentPlan.price}</span>
          </div>
          
          {!currentTier.isNegotiable && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">数量折扣 ({quantityTier})</span>
                <span className="text-green-400 font-mono">- ¥ {currentTier.discount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">选定数量</span>
                <span className="text-white font-mono">× {currentTier.qty}</span>
              </div>
            </>
          )}
          
          <div className="h-px w-full bg-white/10 my-4"></div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">服务支持</span>
            <span className="text-white">包含</span>
          </div>
        </div>

        <div className="mt-auto">
          {currentTier.isNegotiable ? (
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-1">需咨询</div>
              <div className="text-xs text-gray-400">大客户专属通道</div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="text-sm text-gray-400 mb-1">总计:</div>
              <div className="text-4xl font-bold text-blue-300">
                <span className="text-2xl mr-1">¥</span>
                {totalPrice.toLocaleString()}
              </div>
            </div>
          )}

          <button
            onClick={() => handlePaymentIntent('enterprise-design', currentTier.isNegotiable ? 'negotiable' : totalPrice, { plan: selectedPlan, tier: quantityTier })}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all"
          >
            {currentTier.isNegotiable ? '联系大客户经理' : '生成正式合同'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDesignService;
