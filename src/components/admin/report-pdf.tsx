import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ReportData } from "@/lib/finance/reports";

const LIME = "#C8E600";
const ASPHALT = "#111111";
const STEEL = "#707070";

const s = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 10, color: ASPHALT },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  tag: { fontSize: 8, letterSpacing: 2, color: STEEL, marginBottom: 16, textTransform: "uppercase" },
  kpis: { flexDirection: "row", gap: 12, marginBottom: 20 },
  kpi: { flex: 1, borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 6, padding: 12 },
  kpiVal: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  kpiLabel: { fontSize: 7, color: STEEL, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 },
  section: { fontSize: 9, letterSpacing: 1.5, color: STEEL, textTransform: "uppercase", marginTop: 14, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, borderTopWidth: 1, borderTopColor: "#E5E5E5", paddingTop: 8, fontSize: 8, color: STEEL },
});

const inr = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

export function ReportPDF({ data, generatedAt }: { data: ReportData; generatedAt: string }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>SteerClub — Business Report</Text>
        <Text style={s.tag}>Generated {generatedAt}</Text>

        <View style={s.kpis}>
          <View style={s.kpi}><Text style={s.kpiVal}>{inr(Math.round(data.kpis.totalRevenue / 100))}</Text><Text style={s.kpiLabel}>Total Revenue</Text></View>
          <View style={s.kpi}><Text style={s.kpiVal}>{data.kpis.paidCount}</Text><Text style={s.kpiLabel}>Paid Orders</Text></View>
          <View style={s.kpi}><Text style={s.kpiVal}>{inr(Math.round(data.kpis.avgOrder / 100))}</Text><Text style={s.kpiLabel}>Avg Order Value</Text></View>
        </View>

        <Text style={s.section}>Revenue by source</Text>
        {data.sourceBreakdown.map((r) => (
          <View style={s.row} key={r.source}><Text>{r.source}</Text><Text>{inr(r.amount)} · {r.count} orders</Text></View>
        ))}

        <Text style={s.section}>Conversion funnel</Text>
        <View style={s.row}><Text>Leads</Text><Text>{data.funnel.leads}</Text></View>
        <View style={s.row}><Text>Assessment customers</Text><Text>{data.funnel.assessmentCustomers}</Text></View>
        <View style={s.row}><Text>Program customers</Text><Text>{data.funnel.programCustomers}</Text></View>

        <Text style={s.section}>Lead sources</Text>
        {data.leadSources.map((r) => (
          <View style={s.row} key={r.source}><Text>{r.source}</Text><Text>{r.count}</Text></View>
        ))}

        {data.topCoupons.length > 0 && (
          <>
            <Text style={s.section}>Top coupons</Text>
            {data.topCoupons.map((r) => (
              <View style={s.row} key={r.code}><Text>{r.code}</Text><Text>{r.used} used · {inr(r.discounted)} off</Text></View>
            ))}
          </>
        )}

        <Text style={s.footer}>Steer Co. · steerclub.in · Confidential business report</Text>
      </Page>
    </Document>
  );
}
