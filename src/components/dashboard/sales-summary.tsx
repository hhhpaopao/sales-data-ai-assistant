import { formatCurrency, formatPercent } from "@/lib/format";
import type { ProductItem } from "@/lib/types";

type SalesSummaryProps = {
  products: ProductItem[];
};

export function SalesSummary({ products }: SalesSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="col-span-2">商品</span>
        <span>销售额</span>
        <span>转化率</span>
      </div>
      <div className="divide-y divide-slate-100">
        {products.map((product) => (
          <div key={product.name} className="grid grid-cols-4 px-4 py-4 text-sm">
            <div className="col-span-2 min-w-0">
              <p className="truncate font-medium text-slate-950">{product.name}</p>
              <p className="mt-1 text-xs text-slate-500">{product.orders} 单</p>
            </div>
            <p className="text-slate-700">{formatCurrency(product.revenue)}</p>
            <p className="text-slate-700">{formatPercent(product.conversion)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
