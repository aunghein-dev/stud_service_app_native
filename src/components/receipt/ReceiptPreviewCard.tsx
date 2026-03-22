import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { brandLogoSvg } from '@/branding/logoSvg';
import { AppButton } from '@/components/common/AppButton';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { settingsApi } from '@/services/settingsApi';
import { studentsApi } from '@/services/studentsApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import { teachersApi } from '@/services/teachersApi';
import { enrollmentsApi } from '@/services/enrollmentsApi';
import { formatCurrency } from '@/utils/currency';
import type { Receipt } from '@/types/receipt';
import type { Settings } from '@/types/settings';
import type { Student } from '@/types/student';
import type { ClassCourse } from '@/types/classCourse';
import type { Teacher } from '@/types/teacher';
import type { Enrollment } from '@/types/enrollment';
import { theme } from '@/theme';

type Props = {
  receipt: Receipt;
};

type OptionalItem = {
  name: string;
  quantity: number;
  amount: number;
  total: number;
};

type SlipView = {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  receiptNo: string;
  receiptType: string;
  issuedDateTime: string;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentCode: string;
  className: string;
  courseName: string;
  classRoom: string;
  teacherName: string;
  teacherCode: string;
  teacherPhone: string;
  teacherSpecialty: string;
  paymentMethod: string;
  paymentDateTime: string;
  receivedBy: string;
  note: string;
  baseCourseFee: number;
  registrationFee: number;
  examFee: number;
  certificateFee: number;
  optionalFeeTotal: number;
  subTotal: number;
  discountAmount: number;
  finalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  optionalItems: OptionalItem[];
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asText(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return fallback;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return Number.NaN;
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(slip: SlipView, showLogo: boolean): string {
  const optionalRows = slip.optionalItems.length
    ? slip.optionalItems
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td style="text-align:center;">${item.quantity}</td>
              <td style="text-align:right;">${formatCurrency(item.amount)}</td>
              <td style="text-align:right;">${formatCurrency(item.total)}</td>
            </tr>
          `
        )
        .join('')
    : `<tr><td colspan="4" style="text-align:center; color:#63746f;">No optional fee items</td></tr>`;
  const feeRowsHtml = [
    { label: 'Base Course Fee', value: slip.baseCourseFee, show: true },
    { label: 'Registration Fee', value: slip.registrationFee, show: slip.registrationFee > 0 },
    { label: 'Exam Fee', value: slip.examFee, show: slip.examFee > 0 },
    { label: 'Certificate Fee', value: slip.certificateFee, show: slip.certificateFee > 0 },
    { label: 'Optional Items Total', value: slip.optionalFeeTotal, show: slip.optionalFeeTotal > 0 },
    { label: 'Sub Total', value: slip.subTotal, show: true },
    { label: 'Discount', value: slip.discountAmount, show: slip.discountAmount > 0 },
    { label: 'Final Fee', value: slip.finalFee, show: true, strong: true },
    { label: 'Paid Amount', value: slip.paidAmount, show: true },
    { label: 'Remaining Amount', value: slip.remainingAmount, show: true, strong: true }
  ]
    .filter((item) => item.show)
    .map((item) => `<tr${item.strong ? ` class="totals"` : ''}><td>${item.label}</td><td class="right">${formatCurrency(item.value)}</td></tr>`)
    .join('');
  const logoMarkup = showLogo
    ? `
        <div class="brand-mark">
          ${brandLogoSvg}
        </div>
      `
    : '';

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #172320; }
          .header { border: 1px solid #d4ddd5; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
          .header-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
          .brand-block { display: flex; align-items: center; gap: 14px; }
          .brand-mark { width: 62px; height: 62px; border-radius: 20px; overflow: hidden; flex: 0 0 auto; }
          .brand-mark svg { width: 62px; height: 62px; display: block; }
          .title { margin: 0; font-size: 24px; }
          .muted { color: #5f6f68; margin: 4px 0; }
          .badge { display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 999px; border: 1px solid #14584f; background: #d7ece5; color: #14584f; font-size: 11px; }
          .section { border: 1px solid #d4ddd5; border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
          .section h3 { margin: 0; padding: 10px 12px; background: #f5f8f3; font-size: 14px; }
          .section .body { padding: 10px 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .cell strong { display: block; margin-bottom: 4px; font-size: 11px; color: #5f6f68; text-transform: uppercase; }
          .cell span { font-size: 13px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #e4ebe6; padding: 8px; font-size: 12px; }
          th { text-align: left; background: #f5f8f3; }
          .right { text-align: right; }
          .totals td { font-weight: bold; }
          .footer { margin-top: 18px; color: #63746f; font-size: 11px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-top">
            <div class="brand-block">
              ${logoMarkup}
              <div>
                <h1 class="title">${escapeHtml(slip.schoolName)}</h1>
                <p class="muted">${escapeHtml(slip.schoolAddress)}</p>
                <p class="muted">Phone: ${escapeHtml(slip.schoolPhone)}</p>
                <p class="muted"><strong>Receipt:</strong> ${escapeHtml(slip.receiptNo)} | <strong>Issued:</strong> ${escapeHtml(slip.issuedDateTime)}</p>
              </div>
            </div>
            <span class="badge">${escapeHtml(slip.receiptType.toUpperCase())}</span>
          </div>
        </div>

        <div class="section">
          <h3>Student / Class / Teacher</h3>
          <div class="body grid">
            <div class="cell">
              <strong>Student</strong>
              <span>${escapeHtml(slip.studentName)} (${escapeHtml(slip.studentCode)})</span>
              <div class="muted">${escapeHtml(slip.studentPhone)}</div>
              <div class="muted">Guardian: ${escapeHtml(slip.guardianName)} (${escapeHtml(slip.guardianPhone)})</div>
            </div>
            <div class="cell">
              <strong>Class</strong>
              <span>${escapeHtml(slip.className)} • ${escapeHtml(slip.courseName)}</span>
              <div class="muted">Room: ${escapeHtml(slip.classRoom)}</div>
              <div class="muted">Enrollment: ${escapeHtml(slip.enrollmentCode)}</div>
            </div>
            <div class="cell" style="grid-column: 1 / span 2;">
              <strong>Teacher</strong>
              <span>${escapeHtml(slip.teacherName)} (${escapeHtml(slip.teacherCode)})</span>
              <div class="muted">${escapeHtml(slip.teacherPhone)} • ${escapeHtml(slip.teacherSpecialty)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Fee Breakdown</h3>
          <div class="body">
            <table>
              ${feeRowsHtml}
            </table>
            <p class="muted"><strong>Status:</strong> ${escapeHtml(slip.paymentStatus.toUpperCase())}</p>
          </div>
        </div>

        <div class="section">
          <h3>Optional Fee Items</h3>
          <div class="body">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th class="right">Amount</th>
                  <th class="right">Total</th>
                </tr>
              </thead>
              <tbody>${optionalRows}</tbody>
            </table>
          </div>
        </div>

        <div class="section">
          <h3>Payment Detail</h3>
          <div class="body grid">
            <div class="cell"><strong>Method</strong><span>${escapeHtml(slip.paymentMethod)}</span></div>
            <div class="cell"><strong>Payment Date/Time</strong><span>${escapeHtml(slip.paymentDateTime)}</span></div>
            <div class="cell"><strong>Received By</strong><span>${escapeHtml(slip.receivedBy)}</span></div>
            <div class="cell"><strong>Note</strong><span>${escapeHtml(slip.note)}</span></div>
          </div>
        </div>

        <p class="footer">Generated from student service app print slip module</p>
      </body>
    </html>
  `;
}

export function ReceiptPreviewCard({ receipt }: Props) {
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [classInfo, setClassInfo] = useState<ClassCourse | undefined>(undefined);
  const [teacher, setTeacher] = useState<Teacher | undefined>(undefined);
  const [enrollment, setEnrollment] = useState<Enrollment | undefined>(undefined);
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setMetaLoading(true);
      setTeacher(undefined);

      const [settingsRes, studentRes, classRes, enrollmentRes] = await Promise.allSettled([
        settingsApi.get(),
        studentsApi.getById(Number(receipt.student_id)),
        classCoursesApi.getById(Number(receipt.class_course_id)),
        enrollmentsApi.getById(Number(receipt.enrollment_id))
      ]);

      if (!active) {
        return;
      }

      setSettings(settingsRes.status === 'fulfilled' ? settingsRes.value : undefined);
      setStudent(studentRes.status === 'fulfilled' ? studentRes.value : undefined);
      setClassInfo(classRes.status === 'fulfilled' ? classRes.value : undefined);
      setEnrollment(enrollmentRes.status === 'fulfilled' ? enrollmentRes.value : undefined);

      const classValue = classRes.status === 'fulfilled' ? classRes.value : undefined;
      if (classValue?.assigned_teacher_id) {
        try {
          const teacherRes = await teachersApi.getById(Number(classValue.assigned_teacher_id));
          if (active) {
            setTeacher(teacherRes);
          }
        } catch {
          if (active) {
            setTeacher(undefined);
          }
        }
      }

      if (active) {
        setMetaLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [receipt.id, receipt.student_id, receipt.class_course_id, receipt.enrollment_id]);

  const slip = useMemo<SlipView>(() => {
    const payload = asRecord(receipt.payload);
    const feeBreakdown = asRecord(payload.fee_breakdown);
    const paymentPayload = asRecord(payload.payment);
    const enrollmentPayload = asRecord(payload.enrollment);
    const optionalRaw = Array.isArray(payload.optional_items)
      ? payload.optional_items
      : enrollment?.optional_items || [];

    const optionalItems: OptionalItem[] = optionalRaw.map((item) => {
      const raw = asRecord(item);
      const quantity = pickNumber(raw.quantity, 1);
      const amount = pickNumber(raw.amount_snapshot, raw.amount, 0);
      return {
        name: asText(raw.item_name_snapshot, asText(raw.item_name, 'Optional Item')),
        quantity,
        amount,
        total: pickNumber(raw.total_amount, amount * quantity)
      };
    });

    const optionalFeeTotal = pickNumber(
      feeBreakdown.optional_fee_total,
      feeBreakdown.optional_items_total,
      optionalItems.reduce((sum, item) => sum + item.total, 0)
    );

    const baseCourseFee = pickNumber(feeBreakdown.base_course_fee, classInfo?.base_course_fee, 0);
    const registrationFee = pickNumber(feeBreakdown.registration_fee, classInfo?.registration_fee, 0);
    const examFee = pickNumber(feeBreakdown.exam_fee, classInfo?.exam_fee, 0);
    const certificateFee = pickNumber(feeBreakdown.certificate_fee, classInfo?.certificate_fee, 0);
    const subTotal = pickNumber(
      feeBreakdown.sub_total,
      enrollmentPayload.sub_total,
      enrollment?.sub_total,
      baseCourseFee + registrationFee + examFee + certificateFee + optionalFeeTotal
    );
    const discountAmount = pickNumber(feeBreakdown.discount_amount, enrollment?.discount_amount, 0);
    const finalFee = pickNumber(
      feeBreakdown.final_fee,
      enrollmentPayload.final_fee,
      enrollment?.final_fee,
      receipt.total_amount
    );
    const paidAmount = pickNumber(
      feeBreakdown.paid_amount,
      paymentPayload.amount,
      paymentPayload.initial_payment,
      enrollmentPayload.new_total_paid,
      enrollment?.paid_amount,
      receipt.paid_amount
    );
    const remainingAmount = pickNumber(
      feeBreakdown.remaining_amount,
      enrollmentPayload.remaining_amount,
      enrollment?.remaining_amount,
      receipt.remaining_amount
    );

    return {
      schoolName: settings?.school_name || 'Student Service Academy',
      schoolAddress: settings?.school_address || '-',
      schoolPhone: settings?.school_phone || '-',
      receiptNo: receipt.receipt_no,
      receiptType: receipt.receipt_type,
      issuedDateTime: formatDateTime(receipt.issued_at),
      studentName: student?.full_name || `Student #${receipt.student_id}`,
      studentCode: student?.student_code || '-',
      studentPhone: student?.phone || '-',
      guardianName: student?.guardian_name || '-',
      guardianPhone: student?.guardian_phone || '-',
      enrollmentCode: asText(payload.enrollment_code, asText(enrollmentPayload.enrollment_code, enrollment?.enrollment_code || `#${receipt.enrollment_id}`)),
      className: asText(payload.class_name, classInfo?.class_name || `Class #${receipt.class_course_id}`),
      courseName: asText(payload.course_name, classInfo?.course_name || '-'),
      classRoom: classInfo?.room || '-',
      teacherName: teacher?.teacher_name || 'Not Assigned',
      teacherCode: teacher?.teacher_code || '-',
      teacherPhone: teacher?.phone || '-',
      teacherSpecialty: teacher?.subject_specialty || '-',
      paymentMethod: asText(paymentPayload.payment_method, 'cash'),
      paymentDateTime: formatDateTime(asText(paymentPayload.payment_date, receipt.issued_at)),
      receivedBy: asText(paymentPayload.received_by, '-'),
      note: asText(paymentPayload.note, '-'),
      baseCourseFee,
      registrationFee,
      examFee,
      certificateFee,
      optionalFeeTotal,
      subTotal,
      discountAmount,
      finalFee,
      paidAmount,
      remainingAmount,
      paymentStatus: asText(feeBreakdown.payment_status, enrollment?.payment_status || '-'),
      optionalItems
    };
  }, [receipt, settings, student, classInfo, teacher, enrollment]);

  const displayFeeRows = useMemo(
    () =>
      [
        { label: 'Base Course Fee', value: slip.baseCourseFee, show: true, strong: false },
        { label: 'Registration Fee', value: slip.registrationFee, show: slip.registrationFee > 0, strong: false },
        { label: 'Exam Fee', value: slip.examFee, show: slip.examFee > 0, strong: false },
        { label: 'Certificate Fee', value: slip.certificateFee, show: slip.certificateFee > 0, strong: false },
        { label: 'Optional Fees Total', value: slip.optionalFeeTotal, show: slip.optionalFeeTotal > 0, strong: false },
        { label: 'Sub Total', value: slip.subTotal, show: true, strong: false },
        { label: 'Discount', value: slip.discountAmount, show: slip.discountAmount > 0, strong: false },
        { label: 'Final Fee', value: slip.finalFee, show: true, strong: true },
        { label: 'Paid Amount', value: slip.paidAmount, show: true, strong: false },
        { label: 'Remaining Amount', value: slip.remainingAmount, show: true, strong: true }
      ].filter((item) => item.show),
    [slip]
  );
  const shouldShowLogo = settings?.print_preferences?.show_logo !== false;

  const onPrint = async () => {
    try {
      const html = buildHtml(slip, shouldShowLogo);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      Alert.alert('Print failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandHeader}>
          {shouldShowLogo ? <BrandLogo size={54} /> : null}
          <View style={styles.headerCopy}>
            <Text style={styles.schoolName}>{slip.schoolName}</Text>
            <Text style={styles.schoolMeta}>{slip.schoolAddress}</Text>
            <Text style={styles.schoolMeta}>{slip.schoolPhone}</Text>
          </View>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>{slip.receiptType.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.receiptNo}>Receipt {slip.receiptNo}</Text>
        <Text style={styles.issuedText}>{slip.issuedDateTime}</Text>
      </View>

      {metaLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading student/class/teacher details...</Text>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Paid</Text>
          <Text style={styles.metricValue}>{formatCurrency(slip.paidAmount)}</Text>
        </View>
        <View style={[styles.metricCell, styles.metricWarn]}>
          <Text style={styles.metricLabel}>Remaining</Text>
          <Text style={styles.metricValue}>{formatCurrency(slip.remainingAmount)}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Student / Class / Teacher</Text>
        <Text style={styles.sectionText}>Student: {slip.studentName} ({slip.studentCode})</Text>
        <Text style={styles.sectionText}>Guardian: {slip.guardianName} ({slip.guardianPhone})</Text>
        <Text style={styles.sectionText}>Class: {slip.className} • {slip.courseName} • Room {slip.classRoom}</Text>
        <Text style={styles.sectionText}>Teacher: {slip.teacherName} ({slip.teacherCode}) • {slip.teacherPhone}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Related Fees</Text>
        {displayFeeRows.map((item) => (
          <View key={item.label} style={[styles.feeRow, item.strong && styles.feeRowStrong]}>
            <Text style={item.strong ? styles.feeLabelStrong : styles.feeLabel}>{item.label}</Text>
            <Text style={item.strong ? styles.feeValueStrong : styles.feeValue}>{formatCurrency(item.value)}</Text>
          </View>
        ))}
        <Text style={styles.statusText}>Status: {slip.paymentStatus.toUpperCase()}</Text>
        <Text style={styles.hintText}>To change these values, edit Enrollment or Payment entries from their tabs.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Optional Items</Text>
        {slip.optionalItems.length ? (
          slip.optionalItems.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.optionalRow}>
              <Text style={styles.optionalName}>{item.name} x {item.quantity}</Text>
              <Text style={styles.optionalTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionText}>No optional fee items</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Payment Detail</Text>
        <Text style={styles.sectionText}>Enrollment: {slip.enrollmentCode}</Text>
        <Text style={styles.sectionText}>Method: {slip.paymentMethod}</Text>
        <Text style={styles.sectionText}>Payment Date/Time: {slip.paymentDateTime}</Text>
        <Text style={styles.sectionText}>Received By: {slip.receivedBy}</Text>
        <Text style={styles.sectionText}>Note: {slip.note}</Text>
      </View>

      <AppButton label="Print / Share Slip" onPress={onPrint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    alignItems: 'flex-start'
  },
  brandHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  schoolName: {
    ...theme.typography.heading,
    color: theme.colors.text
  },
  schoolMeta: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  badgeWrap: {
    alignItems: 'flex-end'
  },
  badge: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    alignItems: 'center'
  },
  receiptNo: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  issuedText: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  metricCell: {
    flex: 1,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  metricWarn: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  metricValue: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  sectionCard: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  sectionText: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  feeRowStrong: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs,
    marginTop: theme.spacing.xs
  },
  feeLabel: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  feeValue: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  },
  feeLabelStrong: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  feeValueStrong: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs
  },
  hintText: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  optionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  optionalName: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  optionalTotal: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  }
});
