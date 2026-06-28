"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const LIME = "#D7FF2F";
const STEEL = "#707070";
const PALETTE = ["#D7FF2F", "#7CC4FF", "#FF9F6B", "#B68CFF", "#5BE0A0", "#FF7AA2"];

const axis = { stroke: STEEL, fontSize: 11, fontFamily: "Inter, sans-serif" };
const tooltipStyle = { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 };

export function RevenueLineChart({ data }: { data: { label: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${v}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
        <Line type="monotone" dataKey="revenue" stroke={LIME} strokeWidth={2.5} dot={{ r: 3, fill: LIME }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SourceDonut({ data }: { data: { source: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="source" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`₹${Number(v).toLocaleString("en-IN")}`, String(n)]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LeadSourceBars({ data }: { data: { source: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="source" tick={axis} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={56} />
        <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" fill={LIME} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
