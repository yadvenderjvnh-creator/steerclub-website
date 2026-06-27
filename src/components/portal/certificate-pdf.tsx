import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const LIME = "#C8E600";
const ASPHALT = "#111111";
const STEEL = "#707070";

const styles = StyleSheet.create({
  page: { backgroundColor: ASPHALT, color: "#FFFFFF", fontFamily: "Helvetica", padding: 0 },
  border: { margin: 18, borderWidth: 2, borderColor: LIME, flex: 1, padding: 44, alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  brandLime: { color: LIME },
  kicker: { color: STEEL, fontSize: 9, letterSpacing: 3, marginTop: 14, marginBottom: 28 },
  awarded: { color: STEEL, fontSize: 11, marginBottom: 8 },
  name: { fontSize: 34, fontFamily: "Helvetica-Bold", marginBottom: 20 },
  body: { fontSize: 12, color: "#DDDDDD", textAlign: "center", maxWidth: 460, lineHeight: 1.5 },
  program: { color: LIME, fontFamily: "Helvetica-Bold" },
  footer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 44, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#333333" },
  meta: { fontSize: 9, color: STEEL },
  tagline: { color: LIME, fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 24, letterSpacing: 1 },
});

export type CertificateProps = {
  name: string;
  programName: string;
  issuedAt: string;
  serial: string;
};

export function CertificatePDF(props: CertificateProps) {
  return (
    <Document title={`SteerClub Certificate — ${props.name}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.brand}>STEER<Text style={styles.brandLime}>CLUB</Text></Text>
          <Text style={styles.kicker}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.awarded}>This certifies that</Text>
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.body}>
            has successfully completed the <Text style={styles.program}>{props.programName}</Text> program and
            demonstrated genuine, earned driving capability to the SteerClub standard.
          </Text>
          <Text style={styles.tagline}>EARN THE ROAD.™</Text>
          <View style={styles.footer}>
            <Text style={styles.meta}>Issued {props.issuedAt}</Text>
            <Text style={styles.meta}>Certificate No. {props.serial} · steerclub.in</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
