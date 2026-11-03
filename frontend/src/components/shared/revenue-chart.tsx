"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PROVIDER_LIST, getProvider } from "@/data/providers";
import { formatBDT, formatCompactBDT, formatNumber } from "@/lib/format";
import type { PaymentProvider } from "@/types/api";

/**
 * A point on the revenue chart.
 *
 * `revenue` is in BDT; `transactions` is a count.
 */
export interface RevenuePoint {
  label: string;
  revenue: number;
  transactions: number;
}

/**
 * Revenue over time, as an area chart.
 *
 * The axis is in Taka and the tooltip shows both the money and the number of
 * transactions behind it.
 */
export function RevenueChart({
  data,
  className,
}: {
  data: RevenuePoint[];
  className?: string;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="zp-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#223b67" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#223b67" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatCompactBDT(value)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07)",
              fontSize: 13,
            }}
            formatter={(value, name) =>
              name === "Revenue"
                ? [formatBDT(Number(value)), name]
                : [formatNumber(Number(value)), name]
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#223b67"
            strokeWidth={2}
            fill="url(#zp-revenue-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Transaction volume over time, as a bar chart.
 */
export function VolumeChart({
  data,
  className,
}: {
  data: { label: string; value: number }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07)",
              fontSize: 13,
            }}
            formatter={(value) => [formatNumber(Number(value)), "Transactions"]}
          />
          <Bar
            dataKey="value"
            name="Transactions"
            fill="#10b981"
            radius={[3, 3, 0, 0]}
            maxBarSize={26}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * How the money was split across the payment providers.
 */
export interface MethodShare {
  method: PaymentProvider;
  amount: number;
  count: number;
}

/**
 * A donut chart of the provider split, with a legend that names each
 * provider and its share of the money.
 */
export function MethodSplitChart({
  data,
  className,
}: {
  data: MethodShare[];
  className?: string;
}) {
  const total = data.reduce((sum, row) => sum + row.amount, 0);

  const rows = data
    .map((row) => ({
      ...row,
      name: getProvider(row.method).name,
      color: getProvider(row.method).color,
      share: total > 0 ? (row.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="h-[200px] w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="name"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={2}
                stroke="none"
              >
                {rows.map((row) => (
                  <Cell key={row.method} fill={row.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07)",
                  fontSize: 13,
                }}
                formatter={(value) => [formatBDT(Number(value)), "Amount"]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#475569" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex w-full flex-col gap-2.5 sm:w-1/2">
          {rows.map((row) => (
            <li
              key={row.method}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-ink-soft">{row.name}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-medium text-ink">{formatBDT(row.amount)}</span>
                <span className="text-[12px] text-ink-muted">
                  {row.share.toFixed(0)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * The providers ZevaPay supports, in the order the charts show them.
 */
export const SUPPORTED_PROVIDERS = PROVIDER_LIST.map((provider) => provider.id);
