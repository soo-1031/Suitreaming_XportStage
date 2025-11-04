import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 한글 폰트 등록 (Google Fonts에서 무료로 사용 가능한 Noto Sans KR 사용)
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v13/PbykFmXiEBPT4ITbgNA5Cgm20HTs4JMMuA.woff2',
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v13/PbykFmXiEBPT4ITbgNA5Cgm20HTs4JMMuA.woff2',
      fontWeight: 'bold',
    },
  ],
});

// PDF 스타일 정의 (항공사 영수증 스타일)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'NotoSansKR',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'NotoSansKR',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    fontFamily: 'NotoSansKR',
  },
  logo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'NotoSansKR',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'NotoSansKR',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  label: {
    width: '40%',
    fontSize: 9,
    color: '#666666',
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR',
  },
  value: {
    width: '60%',
    fontSize: 9,
    color: '#000000',
    fontFamily: 'NotoSansKR',
  },
  performanceBox: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4EABED',
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    fontFamily: 'NotoSansKR',
  },
  performanceInfo: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 2,
    fontFamily: 'NotoSansKR',
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#DFAEE2',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'NotoSansKR',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR',
  },
  summaryValue: {
    fontSize: 10,
    color: '#000000',
    fontFamily: 'NotoSansKR',
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
    fontFamily: 'NotoSansKR',
  },
  dashed: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    marginVertical: 10,
    paddingBottom: 10,
  }
});

const ProposalPDF = ({ showcase, formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PERFORMANCE PROPOSAL</Text>
          <Text style={styles.subtitle}>Korean Arts Booking Proposal</Text>
        </View>
        <View>
          <Text style={styles.logo}>PAMS 2025</Text>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Performance Information */}
      <View style={styles.performanceBox}>
        <Text style={styles.performanceTitle}>{showcase.title}</Text>
        <Text style={styles.performanceInfo}>Artist: {showcase.artist}</Text>
        <Text style={styles.performanceInfo}>Genre: {showcase.genre}</Text>
        <Text style={styles.performanceInfo}>Duration: {showcase.duration}</Text>
      </View>

      {/* Booker Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booker Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Company:</Text>
          <Text style={styles.value}>{formData.bookerCompany}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Person:</Text>
          <Text style={styles.value}>{formData.bookerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{formData.bookerAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{formData.bookerPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{formData.bookerEmail}</Text>
        </View>
      </View>

      {/* Venue Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Venue Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Venue Name:</Text>
          <Text style={styles.value}>{formData.venueName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{formData.venueAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Capacity:</Text>
          <Text style={styles.value}>{formData.venueCapacity} seats</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{formData.venueType}</Text>
        </View>
      </View>

      {/* Performance Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formData.performanceDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{formData.performanceTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ticket Price:</Text>
          <Text style={styles.value}>${formData.ticketPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Performances:</Text>
          <Text style={styles.value}>{formData.performanceCount} show(s)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Target Audience:</Text>
          <Text style={styles.value}>{formData.audienceType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Marketing Budget:</Text>
          <Text style={styles.value}>${formData.marketingBudget}</Text>
        </View>
      </View>

      <View style={styles.dashed} />

      {/* Special Requirements */}
      {formData.specialRequirements && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requirements</Text>
          <Text style={styles.value}>{formData.specialRequirements}</Text>
        </View>
      )}

      {/* Additional Notes */}
      {formData.additionalNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Text style={styles.value}>{formData.additionalNotes}</Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>PROPOSAL SUMMARY</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Revenue:</Text>
          <Text style={styles.summaryValue}>
            ${(parseInt(formData.ticketPrice || 0) * parseInt(formData.venueCapacity || 0) * parseInt(formData.performanceCount || 1)).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Marketing Budget:</Text>
          <Text style={styles.summaryValue}>${parseInt(formData.marketingBudget || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Shows:</Text>
          <Text style={styles.summaryValue}>{formData.performanceCount}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>This proposal is generated through PAMS 2025 Platform</Text>
        <Text style={styles.footerText}>For inquiries, please contact the booker directly</Text>
        <Text style={styles.footerText}>Generated on {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

export default ProposalPDF;