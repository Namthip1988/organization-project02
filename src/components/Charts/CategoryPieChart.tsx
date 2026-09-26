import React, { useState } from 'react';
import { PieChart as PieIcon, ArrowRight, Layers } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryInfo } from '../../constants/categories';

interface CategoryPieChartProps {
  transactions: Transaction[];
  type: 'expense' | 'income';
  onTypeChange?: (type: 'expense' | 'income') => void;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  transactions,
  type,
  onTypeChange,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter transactions by current type
  const filtered = transactions.filter((t) => t.type === type);
  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  filtered.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryList = Object.entries(categoryMap)
    .map(([category, amount]) => {
      const info = getCategoryInfo(category, type);
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        category,
        amount,
        percentage,
        color: info.color,
        icon: info.icon,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Build SVG Donut paths
  let cumulativeAngle = 0;
  const size = 260;
  const radius = 90;
  const innerRadius = 56;
  const center = size / 2;

  const slices = categoryList.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Convert polar coordinates to Cartesian
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Path command for donut sector
    const d = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...item,
      d,
      isSingleFull: item.percentage >= 99.9,
    };
  });

  const activeItem = hoveredCategory
    ? categoryList.find((c) => c.category === hoveredCategory)
    : categoryList[0];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-full">
      {/* Header with Type Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              สัดส่วนตามหมวดหมู่
            </h3>
            <p className="text-xs text-slate-400">
              วิเคราะห์โครงสร้าง{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}
            </p>
          </div>
        </div>

        {onTypeChange && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => onTypeChange('expense')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => onTypeChange('income')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>
        )}
      </div>

      {categoryList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-400">
          <Layers className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            ยังไม่มีข้อมูล{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            เพิ่มรายการใหม่เพื่อเริ่มแสดงผลกราฟิกวิเคราะห์
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6 flex-1">
          {/* Donut Chart SVG */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {slices.map((slice) => {
                const isHovered = hoveredCategory === slice.category;
                if (slice.isSingleFull) {
                  return (
                    <circle
                      key={slice.category}
                      cx={center}
                      cy={center}
                      r={(radius + innerRadius) / 2}
                      stroke={slice.color}
                      strokeWidth={radius - innerRadius}
                      fill="none"
                    />
                  );
                }
                return (
                  <path
                    key={slice.category}
                    d={slice.d}
                    fill={slice.color}
                    className="transition-all duration-200 cursor-pointer hover:opacity-90"
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${center}px ${center}px`,
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-medium text-slate-400 truncate max-w-[110px]">
                {activeItem ? activeItem.category : 'รวมทั้งหมด'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {activeItem ? `${activeItem.percentage.toFixed(1)}%` : formatCurrency(totalAmount)}
              </span>
              {activeItem && (
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatCurrency(activeItem.amount)}
                </span>
              )}
            </div>
          </div>

          {/* Category List & Legends */}
          <div className="flex-1 w-full max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {categoryList.map((item) => {
              const isHovered = hoveredCategory === item.category;
              return (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isHovered ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 truncate" title={item.category}>
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-slate-400 text-[10px] w-9 text-right font-mono">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
