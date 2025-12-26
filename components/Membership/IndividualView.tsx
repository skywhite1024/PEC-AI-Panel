import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { handlePaymentIntent } from './utils';

const IndividualView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: '普通会员 (免费版)',
      description: '面向初学者、在校学生等',
      price: 0,
      features: [
        '基于自然语言的基础设计交互',
        '主流电力电子变换器拓扑推荐',
        '关键参数的自动计算与初步匹配',
        '标准示例案例与结果可视化展示'
      ],
      buttonText: '您当前的套餐',
      isCurrent: true
    },
    {
      id: 'pro',
      name: '付费用户 (订阅制)',
      description: '面向研究生、工程师等',
      price: billingCycle === 'monthly' ? 129 : 1290,
      period: billingCycle === 'monthly' ? '/月' : '/年',
      features: [
        '自由数据库导入',
        '历史方案保存与管理',
        '不限额的调用次数使用限制',
        '不限额的算力额度使用限制'
      ],
      buttonText: '立即订阅',
      recommended: true,
      isCurrent: false
    }
  ];

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-white mb-8">个人用户方案</h2>
      
      {/* Toggle */}
      <div className="flex items-center space-x-3 mb-12">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-medium' : 'text-gray-400'}`}>每月</span>
        <button 
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className="w-14 h-7 bg-blue-900/50 rounded-full border border-blue-500/30 relative flex items-center transition-colors"
        >
          <div className={`w-5 h-5 bg-blue-400 rounded-full shadow-md absolute transition-transform duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'translate-x-7 left-1'}`}></div>
        </button>
        <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white font-medium' : 'text-gray-400'}`}>每年</span>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 hover:transform hover:-translate-y-1 ${
              plan.recommended 
                ? 'bg-white/10 border-blue-400/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            } backdrop-blur-md p-8 flex flex-col`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-8 py-1 transform rotate-45 translate-x-8 translate-y-4 shadow-lg flex items-center justify-center">
                  <Star size={12} className="mr-1 fill-white" /> 推荐
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-white">¥{plan.price}</span>
              {plan.price > 0 && <span className="text-gray-400 text-sm ml-1">{plan.period}</span>}
              {plan.price === 0 && <span className="text-gray-400 text-sm ml-1">/永久免费</span>}
            </div>

            {/* Separator with glow */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-300">
                  <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (!plan.isCurrent) {
                  handlePaymentIntent('individual', plan.price, { cycle: billingCycle, planId: plan.id });
                }
              }}
              className={`w-full py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                plan.isCurrent
                  ? 'bg-white/5 text-gray-400 border border-white/10 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02]'
              }`}
            >
              {plan.buttonText}
            </button>
            
            <div className="mt-4 text-center">
              <button className="text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center justify-center w-full">
                了解更多 <span className="ml-1">&gt;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-12 text-xs text-gray-500">均不允许商用，最终解释权归本产品所有</p>
    </div>
  );
};

export default IndividualView;
