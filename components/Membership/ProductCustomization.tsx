import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Rocket, Beaker, Headphones, 
  TrendingUp, PiggyBank, CalendarCheck, 
  Coins, Factory, Globe, Handshake 
} from 'lucide-react';
import { handlePaymentIntent } from './utils';

const ProductCustomization: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(500);
  const BASE_COST = 500; // Constant base cost

  // Determine active batch type based on quantity
  const activeBatch = useMemo(() => {
    if (quantity < 200) return 'small';
    if (quantity < 2000) return 'medium';
    return 'large';
  }, [quantity]);

  // Calculate prices
  const { unitPrice, totalPrice, formula } = useMemo(() => {
    let price = 0;
    let formulaText = '';
    
    if (quantity < 200) {
      price = BASE_COST * 1.1 + 200;
      formulaText = '成本价 * 1.1 + 200';
    } else if (quantity < 2000) {
      price = BASE_COST * 1.07 + 100;
      formulaText = '成本价 * 1.07 + 100';
    } else {
      price = BASE_COST * 1.02;
      formulaText = '成本价 * 1.02';
    }
    
    return {
      unitPrice: Math.round(price),
      totalPrice: Math.round(price * quantity),
      formula: formulaText
    };
  }, [quantity]);

  const batches = [
    {
      id: 'small',
      name: '小批量 (<200台)',
      desc: '按台计价',
      formulaDisplay: '成本价*1.1+200',
      features: [
        { text: '快速交付', icon: Rocket },
        { text: '适合原型验证', icon: Beaker },
        { text: '标准支持服务', icon: Headphones }
      ]
    },
    {
      id: 'medium',
      name: '中批量 (200-2000台)',
      desc: '单价下调',
      formulaDisplay: '成本价*1.07+100',
      features: [
        { text: '效率优化', icon: TrendingUp },
        { text: '降低启动成本', icon: PiggyBank },
        { text: '优先排程', icon: CalendarCheck }
      ]
    },
    {
      id: 'large',
      name: '大批量 (>2000台)',
      desc: '封顶价',
      formulaDisplay: '成本价*1.02',
      features: [
        { text: '最大化成本节约', icon: Coins },
        { text: '专属生产线', icon: Factory },
        { text: '全球物流集成', icon: Globe },
        { text: '战略合作协议', icon: Handshake }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      
      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const isActive = activeBatch === batch.id;
          return (
            <div
              key={batch.id}
              className={`relative p-6 rounded-2xl border transition-all duration-500 ${
                isActive
                  ? 'bg-gradient-to-b from-blue-600/30 to-blue-900/30 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] transform scale-105 z-10'
                  : 'bg-white/5 border-white/10 opacity-70 scale-95'
              } backdrop-blur-md overflow-hidden`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg">当前区间</div>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-1">{batch.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{batch.desc}</p>
              
              <div className="text-blue-300 font-mono text-lg mb-6">
                ¥ <span className="font-bold">{batch.formulaDisplay}</span> <span className="text-xs text-gray-400">/台</span>
              </div>

              <div className="h-px w-full bg-white/10 mb-6"></div>

              <ul className="space-y-3">
                {batch.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-300">
                    <feat.icon size={14} className="mr-2 text-blue-400" />
                    {feat.text}
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 text-right">
                <button className="text-xs text-gray-500 hover:text-blue-300 transition-colors">
                  了解更多 &gt;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Control & Result */}
      <div className="grid md:grid-cols-3 gap-6 mt-4">
        {/* Slider Control */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col justify-center">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-white">生产数量</h3>
            <div className="bg-blue-600 px-4 py-1 rounded-full text-white font-mono font-bold">
              {quantity} 台
            </div>
          </div>
          
          <div className="relative h-12 flex items-center">
            {/* Track */}
            <div className="absolute w-full h-4 bg-gray-700 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                 style={{ width: `${((quantity - 100) / (2500 - 100)) * 100}%` }}
               ></div>
            </div>
            
            {/* Range Input */}
            <input
              type="range"
              min="100"
              max="2500"
              step="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="absolute w-full h-4 opacity-0 cursor-pointer z-10"
            />
            
            {/* Thumb (Visual Only) */}
            <div 
              className="absolute h-8 w-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-4 border-blue-500 pointer-events-none transition-all duration-75"
              style={{ left: `calc(${((quantity - 100) / (2500 - 100)) * 100}% - 16px)` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-gray-400 text-xs mt-4 font-mono">
            <span>100</span>
            <span>500</span>
            <span>1000</span>
            <span>2000</span>
            <span>2500+</span>
          </div>
          
          <p className="mt-6 text-xs text-gray-500">
            说明：数量越大，单台设计转化成本越低；大批量阶段采用批量封顶价
          </p>
        </div>

        {/* Price Result */}
        <div className="bg-gradient-to-b from-blue-900/40 to-black/40 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-gray-300 text-sm mb-2">预估单价</h3>
            <div className="text-3xl font-bold text-white mb-1">
              <span className="text-lg mr-1">¥</span>
              {unitPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mb-6">基于 {quantity} 台的单价分析</div>
            
            <div className="h-px bg-white/10 w-full mb-4"></div>
            
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">总价预估</span>
              <span className="text-blue-300 font-mono">¥ {(totalPrice / 10000).toFixed(2)} w</span>
            </div>
          </div>
          
          <button
            onClick={() => handlePaymentIntent('customization', totalPrice, { quantity, unitPrice })}
            className="w-full py-3 mt-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center"
          >
            <ShoppingCart size={18} className="mr-2" />
            提交排产
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomization;
