import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { ISSUER, type GstBreakup } from "@/lib/billing/issuer";

const LIME = "#C8E600";
const ASPHALT = "#111111";
const STEEL = "#707070";

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 40, fontFamily: "Helvetica", fontSize: 10, color: ASPHALT },
  header: { backgroundColor: ASPHALT, padding: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#FFFFFF", fontSize: 20, fontFamily: "Helvetica-Bold" },
  brandLime: { color: LIME },
  docType: { color: STEEL, fontSize: 8, letterSpacing: 2, textTransform: "uppercase", textAlign: "right" },
  docNumber: { color: "#FFFFFF", fontSize: 11, fontFamily: "Helvetica-Bold", textAlign: "right", marginTop: 4 },
  body: { padding: 28 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  metaLabel: { fontSize: 7, letterSpacing: 1.5, color: STEEL, textTransform: "uppercase", marginBottom: 4 },
  metaText: { fontSize: 10, lineHeight: 1.4 },
  table: { borderTopWidth: 1, borderTopColor: "#E5E5E5", marginTop: 8 },
  th: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#E5E5E5" },
  tr: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  colItem: { flex: 1 },
  colAmt: { width: 110, textAlign: "right" },
  thText: { fontSize: 7, letterSpacing: 1, color: STEEL, textTransform: "uppercase" },
  totals: { marginTop: 14, alignSelf: "flex-end", width: 240 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 9, color: STEEL },
  totalVal: { fontSize: 9 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#E5E5E5", marginTop: 4 },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandVal: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  note: { fontSize: 8, color: STEEL, marginTop: 24, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 18, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E5E5E5", paddingTop: 8 },
  footerText: { fontSize: 8, color: STEEL },
});

const inr = (paise: number) => `Rs. ${(paise / 100).toLocaleString("en-IN")}`;

export type InvoiceProps = {
  number: string;
  issuedAt: string;
  billToName: string;
  billToEmail: string;
  lineItem: string;
  subtotal: number;
  total: number;
  gst: GstBreakup | null;
  status: string;
};

export function InvoicePDF(props: InvoiceProps) {
  const isTaxInvoice = Boolean(props.gst);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Steer<Text style={styles.brandLime}>Club</Text></Text>
            <Text style={{ color: STEEL, fontSize: 8, marginTop: 4 }}>{ISSUER.legalName} · {ISSUER.address}</Text>
          </View>
          <View>
            <Text style={styles.docType}>{isTaxInvoice ? "Tax Invoice" : "Receipt"}</Text>
            <Text style={styles.docNumber}>{props.number}</Text>
            {props.status === "refunded" && <Text style={{ color: "#E5704B", fontSize: 8, textAlign: "right", marginTop: 2 }}>REFUNDED</Text>}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Billed To</Text>
              <Text style={styles.metaText}>{props.billToName}</Text>
              <Text style={[styles.metaText, { color: STEEL }]}>{props.billToEmail}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Issued</Text>
              <Text style={styles.metaText}>{props.issuedAt}</Text>
              {props.gst && (
                <>
                  <Text style={[styles.metaLabel, { marginTop: 8 }]}>GSTIN</Text>
                  <Text style={styles.metaText}>{props.gst.gstin}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.th}>
              <Text style={[styles.thText, styles.colItem]}>Description{props.gst ? `  (HSN/SAC ${props.gst.hsn})` : ""}</Text>
              <Text style={[styles.thText, styles.colAmt]}>Amount</Text>
            </View>
            <View style={styles.tr}>
              <Text style={styles.colItem}>{props.lineItem}</Text>
              <Text style={styles.colAmt}>{inr(props.subtotal)}</Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{props.gst ? "Taxable value" : "Subtotal"}</Text>
              <Text style={styles.totalVal}>{inr(props.subtotal)}</Text>
            </View>
            {props.gst && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST ({props.gst.rate / 2}%)</Text>
                  <Text style={styles.totalVal}>{inr(props.gst.cgst)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST ({props.gst.rate / 2}%)</Text>
                  <Text style={styles.totalVal}>{inr(props.gst.sgst)}</Text>
                </View>
              </>
            )}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandVal}>{inr(props.total)}</Text>
            </View>
          </View>

          <Text style={styles.note}>
            {isTaxInvoice
              ? "This is a computer-generated tax invoice and does not require a signature."
              : "This is a computer-generated receipt and does not require a signature. Amounts are inclusive of all applicable charges."}
            {"\n"}Thank you for choosing SteerClub. Earn the Road.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{ISSUER.legalName} · {ISSUER.site}</Text>
          <Text style={styles.footerText}>{ISSUER.email}</Text>
        </View>
      </Page>
    </Document>
  );
}
