import React from 'react';
import { 
  Check, Star, Crown, ToggleLeft, Zap, Calculator, Database, 
  Target, Microchip, LineChart, FileUp, TrendingUp, 
  Network, ShieldAlert, CheckCircle2, Library, Infinity, 
  Factory, Briefcase, Server, Sparkles 
} from 'lucide-react';
import { handlePaymentIntent } from './utils';

interface PlatformSubscriptionProps {
  billingCycle: 'monthly' | 'yearly';
}

const PlatformSubscription: React.FC<PlatformSubscriptionProps> = ({ billingCycle }) => {
  const calculatePrice = (price: number) => {
    return billingCycle === 'yearly' ? price * 12 * 0.8 : price;
  };

  const plans = [
    {
      id: 'basic',
      name: '普通会员',
      desc: '基础设计级',
      price: 5000,
      features: [
        { text: '普通专业双模式开放', icon: ToggleLeft },
        { text: '主流变换器拓扑选择', icon: Zap },
        { text: '基础参数自动计算', icon: Calculator },
        { text: '公共数据库访问', icon: Database }
      ]
    },
    {
      id: 'advanced',
      name: '高级会员',
      desc: '多目标优化级',
      price: 25000,
      recommended: true,
      features: [
        { text: '多目标优化 (效率/成本/体积等)', icon: Target },
        { text: '器件精细选型与参数敏感性分析', icon: Microchip },
        { text: '优化过程可视化与结果对比', icon: LineChart },
        { text: '仿真模型导出 (用于二次验证)', icon: FileUp },
        { text: '更高调用上限', icon: TrendingUp }
      ]
    },
    {
      id: 'vip',
      name: 'VIP会员',
      desc: '系统级设计级',
      price: 50000,
      features: [
        { text: '系统级多目标协同优化', icon: Network },
        { text: '复杂工程约束', icon: ShieldAlert },
        { text: '高精度仿真与设计一致性校验', icon: CheckCircle2 },
        { text: '私有设计库管理', icon: Library },
        { text: '不限制调用配额', icon: Infinity }
      ]
    },
    {
      id: 'supreme',
      name: '至尊VIP',
      desc: '企业深度定制级',
      price: 80000,
      isSupreme: true,
      features: [
        { text: '与制造环节深度对接', icon: Factory },
        { text: '全功能无限制使用', icon: Crown },
        { text: '行业/企业专属模型定制', icon: Briefcase },
        { text: '私有数据本地或私有云部署', icon: Server },
        { text: '专属优化策略与参数模板', icon: Sparkles }
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:transform hover:-translate-y-2 ${
            plan.isSupreme
              ? 'bg-gradient-to-b from-yellow-900/40 to-black/60 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]'
              : plan.recommended
                ? 'bg-gradient-to-b from-blue-900/40 to-blue-900/20 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
          } backdrop-blur-md`}
        >
          {plan.recommended && (
            <div className="absolute top-0 right-0">
              <div className="bg-blue-600 text-white text-[10px] px-6 py-0.5 transform rotate-45 translate-x-5 translate-y-3 shadow-sm">
                <Star size={8} className="inline mr-0.5" />推荐
              </div>
            </div>
          )}
          
          {plan.isSupreme && (
            <div className="absolute top-4 right-4 text-yellow-500 animate-pulse">
              <Crown size={24} />
            </div>
          )}

          <div className="mb-4">
            <h3 className={`text-xl font-bold mb-1 ${plan.isSupreme ? 'text-yellow-400' : 'text-white'}`}>{plan.name}</h3>
            <p className="text-gray-400 text-xs">{plan.desc}</p>
          </div>

          <div className="mb-6">
            <span className="text-sm text-gray-400">¥</span>
            <span className={`text-3xl font-bold mx-1 ${plan.isSupreme ? 'text-yellow-200' : 'text-white'}`}>
              {calculatePrice(plan.price).toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">{billingCycle === 'monthly' ? '/月' : '/年'}</span>
          </div>

          {/* Divider */}
          <div className={`h-px w-full mb-6 ${plan.isSupreme ? 'bg-yellow-500/30' : 'bg-white/10'}`}></div>

          <ul className="space-y-4 mb-8 flex-1">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-xs text-gray-300 leading-relaxed">
                <div className={`mt-0.5 mr-2 p-0.5 rounded-full shrink-0 ${plan.isSupreme ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  <feature.icon size={10} strokeWidth={3} />
                </div>
                {feature.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePaymentIntent('subscription', calculatePrice(plan.price), { planId: plan.id, cycle: billingCycle })}
            className={`w-full py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:scale-[1.02] ${
              plan.isSupreme
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:shadow-yellow-500/40'
                : plan.recommended
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-blue-500/40'
                  : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {plan.isSupreme ? '联系销售' : '立即订阅'}
          </button>
          
          <div className="mt-4 text-center">
            <button className={`text-xs transition-colors flex items-center justify-center w-full ${plan.isSupreme ? 'text-yellow-500/70 hover:text-yellow-400' : 'text-gray-500 hover:text-blue-400'}`}>
              了解更多 <span className="ml-1">&gt;</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlatformSubscription;
