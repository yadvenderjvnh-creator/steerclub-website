import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const LIME = "#C8E600"; // print-friendly lime
const ASPHALT = "#111111";
const STEEL = "#707070";

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 40, fontFamily: "Helvetica", fontSize: 11, color: ASPHALT },
  header: { backgroundColor: ASPHALT, padding: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#FFFFFF", fontSize: 20, fontFamily: "Helvetica-Bold" },
  brandLime: { color: LIME },
  headerTag: { color: STEEL, fontSize: 8, letterSpacing: 2 },
  body: { padding: 28 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 },
  name: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  sub: { color: STEEL, fontSize: 9, marginTop: 2 },
  scoreBig: { fontSize: 48, fontFamily: "Helvetica-Bold", color: ASPHALT },
  band: { fontSize: 11, fontFamily: "Helvetica-Bold", textAlign: "right" },
  sectionLabel: { fontSize: 8, letterSpacing: 2, color: STEEL, textTransform: "uppercase", marginBottom: 10, marginTop: 14 },
  dimRow: { marginBottom: 9 },
  dimTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  dimLabel: { fontSize: 9 },
  dimVal: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  track: { height: 5, backgroundColor: "#EEEEEE", borderRadius: 3 },
  fill: { height: 5, borderRadius: 3, backgroundColor: LIME },
  recBox: { borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 6, padding: 14, marginTop: 6 },
  recName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  recText: { fontSize: 9, color: STEEL, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 18, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E5E5E5", paddingTop: 8 },
  footerText: { fontSize: 8, color: STEEL },
});

const DIM_LABELS: Record<string, string> = {
  vehicleControl: "Vehicle Control",
  hazardPerception: "Hazard Perception",
  cityNavigation: "City Navigation",
  highwayDriving: "Highway Driving",
  allConditions: "All Conditions",
  defensiveDriving: "Defensive Driving",
};

export type ScoreReportProps = {
  name: string;
  total: number;
  band: string;
  assessedAt: string;
  dimensions: Record<string, number>;
  recommendationName: string;
  recommendationText: string;
};

export function ScoreReportPDF(props: ScoreReportProps) {
  return (
    <Document title={`SteerClub Steer Score — ${props.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            STEER<Text style={styles.brandLime}>CLUB</Text>
          </Text>
          <Text style={styles.headerTag}>STEER SCORE REPORT</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{props.name}</Text>
              <Text style={styles.sub}>Assessed {props.assessedAt}</Text>
            </View>
            <View>
              <Text style={styles.scoreBig}>{props.total}<Text style={{ fontSize: 16, color: STEEL }}> / 100</Text></Text>
              <Text style={styles.band}>{props.band}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Score Breakdown</Text>
          {Object.entries(props.dimensions).map(([key, val]) => (
            <View key={key} style={styles.dimRow}>
              <View style={styles.dimTop}>
                <Text style={styles.dimLabel}>{DIM_LABELS[key] ?? key}</Text>
                <Text style={styles.dimVal}>{val}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, val))}%` }]} />
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Recommended Next Step</Text>
          <View style={styles.recBox}>
            <Text style={styles.recName}>{props.recommendationName}</Text>
            <Text style={styles.recText}>{props.recommendationText}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>SteerClub — Earn the Road.</Text>
          <Text style={styles.footerText}>steerclub.in</Text>
        </View>
      </Page>
    </Document>
  );
}
