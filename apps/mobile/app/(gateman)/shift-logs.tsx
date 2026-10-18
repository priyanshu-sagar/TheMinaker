import { useEffect, useMemo, useState } from 'react';
import { FlatList, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { SearchField, SHEET } from '@/components/gateman/sheets';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { ConfirmRequest, GlassConfirmModal } from '@/components/gateman/GlassConfirmModal';
import { useAuthStore } from '@/store/auth.store';
import { AuditCategory, isBusOnCampus, ReportSpan, useGatemanStore } from '@/store/gateman.store';
import { useConductorStore } from '@/store/conductor.store';

const CATEGORIES: Array<{ key: AuditCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All daily logs' },
  { key: 'gate_entry', label: 'Student gate entry and exit' },
  { key: 'bus_movement', label: 'Bus departure and arrival' },
  { key: 'boarding', label: 'Student boarding and dropping' },
  { key: 'off_location', label: 'Off-location boarding and dropping' },
  { key: 'delay', label: 'Delayed and malfunction' },
  { key: 'self_pickup', label: 'Parent self-pickup and drop' },
  { key: 'visitor', label: 'Visitor, vendor, and walk-in' },
  { key: 'gate_control', label: 'Gate open, close, and admin override' },
  { key: 'handover', label: 'Shift handover reports' },
];

const SPANS: Array<{ key: ReportSpan; label: string; ms: number }> = [
  { key: '1d', label: '1 day', ms: 24 * 60 * 60 * 1000 },
  { key: '7d', label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '15d', label: '15 days', ms: 15 * 24 * 60 * 60 * 1000 },
  { key: '30d', label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 },
];

const QUESTIONS = [
  { code: 'Q1', title: 'Gate security', prompt: 'Is the campus gate closed and locked for shift transition?' },
  { code: 'Q2', title: 'Fleet accountability', prompt: 'Are all route buses confirmed arrived at school and accounted for?' },
  { code: 'Q3', title: 'Student transit safety', prompt: 'Are all off-location boarding flags and transit delays resolved?' },
  { code: 'Q4', title: 'Gate clearances', prompt: 'Are all early pickups, self drop-offs, and walk-ins verified?' },
  { code: 'Q5', title: 'Parent requests', prompt: 'Are pending parent stop and bus changes either decided or listed for the next duty?' },
];

const CHOICES = [
  { id: 'Yes / All Clear', label: 'Yes / All clear', tone: 'yes' as const },
  { id: 'Handed Over', label: 'Handed over', tone: 'hand' as const },
  { id: 'Pending / Issue', label: 'Pending / Issue', tone: 'issue' as const },
];

const NOTE_TAGS = ['All quiet / normal shift', 'Bus 3 and 5 maintenance tomorrow', 'VIP / inspection visit', 'Key placed in duty desk drawer', 'Gate motor servicing pending'];
const INCOMING = ['Rakesh Pal', 'Meena Joshi', 'Other / Relief Officer'];

export default function ShiftLogsScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const logs = useGatemanStore((state) => state.auditLogs);
  const expired = useGatemanStore((state) => state.expiredLogCount);
  const gateman = useGatemanStore((state) => state.signedInGateman);
  const gateOpen = useGatemanStore((state) => state.gateOpen);
  const buses = useGatemanStore((state) => state.buses);
  const canEndShift = useGatemanStore((state) => state.canEndShift);
  const submitHandover = useGatemanStore((state) => state.submitHandover);
  const [category, setCategory] = useState<AuditCategory | 'all'>('all');
  const [menu, setMenu] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [span, setSpan] = useState<ReportSpan>('1d');
  const [report, setReport] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [table, setTable] = useState(true);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const fleet = useGatemanStore((state) => state.buses);
  const conductorLogs = useConductorStore((state) => state.shiftLogs);
  const [busPick, setBusPick] = useState('Bus 7');
  const [busMenu, setBusMenu] = useState(false);
  const [answers, setAnswers] = useState<Array<string | null>>(Array(5).fill(null));
  const [incoming, setIncoming] = useState(INCOMING[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = [Math.floor(elapsed / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60].map((part) => String(part).padStart(2, '0')).join(':');
  const visible = useMemo(() => logs
    .filter((item) => category === 'all' || item.category === category)
    .filter((item) => `${item.title} ${item.detail} ${item.gatemanName}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [logs, category, query]);
  const reportRows = useMemo(() => {
    const windowMs = SPANS.find((item) => item.key === span)!.ms;
    const cutoff = Date.now() - windowMs;
    return logs.filter((item) => (category === 'all' || item.category === category) && new Date(item.timestamp).getTime() >= cutoff);
  }, [logs, span, category]);
  const label = CATEGORIES.find((item) => item.key === category)?.label ?? 'Logs';

  function startSignOut() {
    const check = canEndShift();
    if (!check.ok) {
      setAsk({ tone: 'override', title: 'Shift is not secure', summary: check.reason, confirmLabel: 'OK', onConfirm: () => undefined });
      return;
    }
    setAnswers(Array(5).fill(null));
    setTags([]);
    setNotes('');
    setIncoming(INCOMING[0]);
    setQuiz(true);
  }

  const answered = answers.filter(Boolean).length;
  const secured = !gateOpen && buses.every((bus) => isBusOnCampus(bus.status));
  const handoverNotes = [tags.join(', '), notes.trim()].filter(Boolean).join(' — ');

  function askFinish() {
    if (answered < QUESTIONS.length) return;
    setAsk({
      tone: 'approve',
      title: 'Complete shift handover?',
      summary: 'Your 5-point verification and handover notes will be logged into the permanent school audit trail, and your session will end.',
      confirmLabel: 'Complete handover',
      onConfirm: () => { void finishQuiz(); },
    });
  }

  async function finishQuiz() {
    if (answers.some((item) => !item)) return;
    submitHandover(answers as string[], handoverNotes || undefined, incoming);
    setQuiz(false);
    await signOut();
    router.replace('/(auth)/portal-showcase');
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Logs</Text>
          <NotificationBell />
        </View>
        <FlatList
          data={visible.slice(0, 40)}
          keyExtractor={(item) => item.id}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <View style={styles.card}>
                <Text style={styles.body}>{user?.fullName || gateman}</Text>
                <Text style={styles.meta}>On duty {clock} · Gate {gateOpen ? 'open' : 'closed'}</Text>
                <AnimatedPressable haptic="medium" onPress={startSignOut} style={styles.signOut}><Text style={styles.signOutText}>End shift and sign out</Text></AnimatedPressable>
              </View>
              <Text style={styles.kicker}>Fleet and bus logs</Text>
              <AnimatedPressable haptic="selection" onPress={() => setBusMenu((value) => !value)} style={styles.dropdown}><Text style={styles.body}>{busPick}</Text></AnimatedPressable>
              {busMenu ? ['Bus 7', ...fleet.slice(0, 12).map((bus) => bus.busNumber)].map((bus) => (
                <AnimatedPressable key={bus} haptic="selection" onPress={() => { setBusPick(bus); setBusMenu(false); }} style={styles.option}><Text style={styles.meta}>{bus}</Text></AnimatedPressable>
              )) : null}
              {(busPick === 'Bus 7' ? conductorLogs : logs.filter((item) => `${item.detail} ${item.subject ?? ''}`.includes(busPick))).slice(0, 6).map((item) => (
                <Text key={item.id} style={styles.meta}>{new Date(item.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {'action' in item ? item.action : item.title}</Text>
              ))}
              <AnimatedPressable haptic="selection" onPress={() => exportReport((busPick === 'Bus 7' ? conductorLogs : logs.filter((item) => `${item.detail} ${item.subject ?? ''}`.includes(busPick))).map((item) => ({ timestamp: item.timestamp, gatemanName: 'gatemanName' in item ? item.gatemanName : 'Ranjit Singh', category: 'category' in item ? item.category : 'bus', subject: busPick, title: 'action' in item ? item.action : item.title, detail: 'detail' in item ? item.detail : item.action })), (summary) => setAsk({ tone: 'info', title: 'Bus report ready', summary, confirmLabel: 'OK', onConfirm: () => undefined }))}><Text style={styles.link}>Export this bus report</Text></AnimatedPressable>
              <AnimatedPressable haptic="selection" onPress={() => setMenu((value) => !value)} style={styles.dropdown}>
                <Text style={styles.body}>{label}</Text>
              </AnimatedPressable>
              {menu ? CATEGORIES.map((item) => (
                <AnimatedPressable key={item.key} haptic="selection" onPress={() => { setCategory(item.key); setMenu(false); }} style={styles.option}>
                  <Text style={styles.meta}>{item.label}</Text>
                </AnimatedPressable>
              )) : null}
              <View style={styles.pills}>
                {CATEGORIES.slice(0, 4).map((item) => (
                  <AnimatedPressable key={item.key} haptic="selection" onPress={() => setCategory(item.key)} style={[styles.pill, category === item.key ? styles.pillOn : null]}>
                    <Text style={styles.pillText}>{item.label.split(' ')[0]}</Text>
                  </AnimatedPressable>
                ))}
              </View>
              <Text style={styles.meta}>Logs auto-expire after 30 days. {expired} older {expired === 1 ? 'entry was' : 'entries were'} removed.</Text>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search subject, event, or gateman" />
              <View style={styles.tools}>
                <AnimatedPressable haptic="selection" onPress={() => setTable((value) => !value)}><Text style={styles.link}>{table ? 'Detailed cards' : 'Table'}</Text></AnimatedPressable>
                <AnimatedPressable haptic="selection" onPress={() => setAllOpen(true)}><Text style={styles.link}>View all</Text></AnimatedPressable>
                <AnimatedPressable haptic="selection" onPress={() => setReport(true)}><Text style={styles.link}>PDF report</Text></AnimatedPressable>
              </View>
              {table ? <LogHead /> : null}
            </View>
          }
          renderItem={({ item, index }) => table ? <LogRow item={item} shaded={index % 2 === 1} /> : (
            <View style={styles.row}>
              <Text style={styles.body}>{item.subject ?? item.title}</Text>
              <Text style={styles.meta}>{item.detail}</Text>
              <Text style={styles.meta}>{item.gatemanName} · {new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
        />
      </SafeAreaView>

      <GlassModal visible={allOpen} fill scroll={false} maxHeight={SHEET} title="All logs" onClose={() => setAllOpen(false)}>
        <View style={styles.flex}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search logs" />
          <AnimatedPressable haptic="selection" onPress={() => setReport(true)}><Text style={styles.link}>PDF report</Text></AnimatedPressable>
          <LogHead />
          <FlatList data={visible} keyExtractor={(item) => item.id} bounces={false} style={styles.flex} renderItem={({ item, index }) => <LogRow item={item} shaded={index % 2 === 1} />} />
        </View>
      </GlassModal>

      <GlassModal visible={report} fill scroll={false} maxHeight="90%" title="Report preview" onClose={() => setReport(false)}>
        <View style={styles.flex}>
          <View style={styles.pills}>
            {SPANS.map((item) => (
              <AnimatedPressable key={item.key} haptic="selection" onPress={() => setSpan(item.key)} style={[styles.pill, span === item.key ? styles.pillOn : null]}>
                <Text style={styles.pillText}>{item.label}</Text>
              </AnimatedPressable>
            ))}
          </View>
          <View style={styles.paper}>
            <Text style={styles.watermark}>TheMinaker — Official Audit Log</Text>
            <Text style={styles.brand}>TheMinaker</Text>
            <Text style={styles.body}>Gate audit report</Text>
            <Text style={styles.meta}>{label} · {SPANS.find((item) => item.key === span)?.label} · Generated {new Date().toLocaleString()}</Text>
            <Text style={styles.meta}>Duty officer {gateman}</Text>
            <View style={styles.kpis}>
              <Kpi label="Records" value={reportRows.length} />
              <Kpi label="Bus" value={reportRows.filter((item) => item.category === 'bus_movement' || item.category === 'delay').length} />
              <Kpi label="Gate" value={reportRows.filter((item) => item.category === 'gate_entry' || item.category === 'boarding' || item.category === 'gate_control' || item.category === 'self_pickup').length} />
              <Kpi label="Exceptions" value={reportRows.filter((item) => item.category === 'off_location' || item.category === 'visitor').length} />
            </View>
            <LogHead />
            <FlatList data={reportRows} keyExtractor={(item) => item.id} bounces={false} style={styles.flex} renderItem={({ item, index }) => <LogRow item={item} shaded={index % 2 === 1} />} />
          </View>
          <View style={styles.tools}>
            <AnimatedPressable haptic="medium" onPress={() => exportReport(reportRows, (summary) => setAsk({ tone: 'info', title: 'Report ready', summary, confirmLabel: 'OK', onConfirm: () => undefined }))} style={styles.export}><Text style={styles.signOutText}>Download PDF</Text></AnimatedPressable>
            <AnimatedPressable haptic="medium" onPress={() => exportReport(reportRows, (summary) => setAsk({ tone: 'info', title: 'Report ready', summary, confirmLabel: 'OK', onConfirm: () => undefined }))} style={styles.exportAlt}><Text style={styles.link}>Share / print</Text></AnimatedPressable>
          </View>
        </View>
      </GlassModal>

      <GlassModal visible={quiz} fill maxHeight="90%" title="Shift handover" onClose={() => setQuiz(false)}>
        <View style={styles.officer}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.fullName || gateman).slice(0, 1)}</Text></View>
          <View style={styles.flex}>
            <Text style={styles.body}>{user?.fullName || gateman}</Text>
            <Text style={styles.meta}>Gate security officer · since 07:00 AM</Text>
          </View>
          <Text style={secured ? styles.secured : styles.waiting}>{secured ? 'Campus secured' : 'Not secured'}</Text>
        </View>
        <Text style={styles.kicker}>Incoming officer</Text>
        <View style={styles.pills}>
          {INCOMING.map((name) => (
            <AnimatedPressable key={name} haptic="selection" onPress={() => setIncoming(name)} style={[styles.pill, incoming === name ? styles.pillOn : null]}>
              <Text style={styles.pillText}>{name}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <AnimatedPressable haptic="medium" onPress={() => setAnswers(Array(QUESTIONS.length).fill('Yes / All Clear'))} style={styles.clearAll}>
          <Text style={styles.clearAllText}>Mark all as all clear</Text>
        </AnimatedPressable>
        {QUESTIONS.map((question, index) => (
          <View key={question.code} style={styles.question}>
            <Text style={styles.meta}>{question.code} · {question.title}</Text>
            <Text style={styles.body}>{question.prompt}</Text>
            <View style={styles.pills}>
              {CHOICES.map((choice) => {
                const on = answers[index] === choice.id;
                return (
                  <AnimatedPressable key={choice.id} haptic="selection" onPress={() => setAnswers((rows) => rows.map((row, rowIndex) => rowIndex === index ? choice.id : row))} style={[styles.choice, on && choice.tone === 'yes' ? styles.yes : null, on && choice.tone === 'hand' ? styles.hand : null, on && choice.tone === 'issue' ? styles.issue : null]}>
                    <Text style={[styles.pillText, on && choice.tone === 'yes' ? styles.yesText : null, on && choice.tone === 'hand' ? styles.handText : null, on && choice.tone === 'issue' ? styles.issueText : null]}>{choice.label}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={styles.kicker}>Notes for the next shift</Text>
        <View style={styles.pills}>
          {NOTE_TAGS.map((tag) => (
            <AnimatedPressable key={tag} haptic="selection" onPress={() => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} style={[styles.pill, tags.includes(tag) ? styles.pillOn : null]}>
              <Text style={styles.pillText}>{tag}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <AppTextInput value={notes} onChangeText={setNotes} multiline placeholder="Specify any exceptions, special instructions, or notes for the incoming duty officer..." placeholderTextColor={colors.textPlaceholder} style={styles.notes} />
        <Text style={styles.meta}>{answered} of {QUESTIONS.length} answered</Text>
        <AnimatedPressable haptic="medium" disabled={answered < QUESTIONS.length} onPress={askFinish} style={answered < QUESTIONS.length ? styles.disabled : null}>
          <LinearGradient colors={['#059669', '#34D399']} style={styles.submit}>
            <Text style={styles.signOutText}>Complete handover and sign out</Text>
          </LinearGradient>
        </AnimatedPressable>
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

function exportReport(rows: Array<{ timestamp: string; gatemanName: string; category: string; subject?: string; title: string; detail: string }>, notice: (summary: string) => void) {
  const message = ['TheMinaker — Official Audit Log', ...rows.map((item) => `${item.timestamp} | ${item.category} | ${item.subject ?? item.title} | ${item.detail} | ${item.gatemanName}`)].join('\n');
  notice('The audit table is ready to share or print.');
  Share.share({ title: 'TheMinaker audit log', message }).catch(() => undefined);
}

function LogHead() {
  return (
    <View style={styles.head}>
      <Text style={[styles.cellTime, styles.headText]}>Time</Text>
      <Text style={[styles.cell, styles.headText]}>Category</Text>
      <Text style={[styles.cell, styles.headText]}>Subject</Text>
      <Text style={[styles.cellWide, styles.headText]}>Event</Text>
      <Text style={[styles.cell, styles.headText]}>Officer</Text>
    </View>
  );
}

function LogRow({ item, shaded }: { item: { timestamp: string; category: string; subject?: string; title: string; detail: string; gatemanName: string }; shaded: boolean }) {
  return (
    <View style={[styles.tableRow, shaded ? styles.shaded : null]}>
      <Text style={styles.cellTime}>{new Date(item.timestamp).toLocaleString([], { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
      <Text style={styles.cell}>{item.category.replace('_', ' ')}</Text>
      <Text style={styles.cell}>{item.subject ?? item.title}</Text>
      <Text style={styles.cellWide}>{item.detail}</Text>
      <Text style={styles.cell}>{item.gatemanName}</Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <View style={styles.kpi}><Text style={styles.body}>{value}</Text><Text style={styles.meta}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: palette.offWhite, zIndex: 2 },
  title: { ...typography.heading },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 150 },
  card: { backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  signOut: { marginTop: spacing.md, minHeight: 44, borderRadius: radius.md, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  signOutText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  dropdown: { marginTop: spacing.md, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, justifyContent: 'center', paddingHorizontal: spacing.md },
  option: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg },
  pillText: { ...typography.caption, color: colors.textPrimary },
  tools: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm },
  link: { ...typography.bodyBold, color: portalAccents.gateman.from, backgroundColor: 'transparent' },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  paper: { flex: 1, marginTop: spacing.sm, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md, overflow: 'hidden' },
  watermark: { position: 'absolute', top: 140, left: -20, fontSize: 28, fontWeight: '800', color: 'rgba(15,23,42,0.08)', transform: [{ rotate: '-28deg' }], backgroundColor: 'transparent' },
  brand: { ...typography.heading, color: portalAccents.gateman.from },
  kpis: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  kpi: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, padding: spacing.xs },
  head: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.borderStrong, paddingVertical: 4 },
  headText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.divider, paddingVertical: 4 },
  shaded: { backgroundColor: '#f1f5f9' },
  cellTime: { width: 78, ...typography.caption },
  cell: { flex: 1, ...typography.caption },
  cellWide: { flex: 1.4, ...typography.caption },
  export: { flex: 1, minHeight: 44, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  exportAlt: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  question: { marginTop: spacing.md, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  officer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.heading, color: portalAccents.gateman.from },
  kicker: { ...typography.overline, marginTop: spacing.md, marginBottom: spacing.xs },
  secured: { ...typography.caption, backgroundColor: '#ECFDF5', color: '#059669', overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, fontWeight: '700' },
  waiting: { ...typography.caption, backgroundColor: '#FEF2F2', color: '#DC2626', overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, fontWeight: '700' },
  clearAll: { marginTop: spacing.sm, alignSelf: 'flex-start', borderRadius: radius.full, backgroundColor: '#ECFDF5', paddingHorizontal: spacing.md, minHeight: 36, justifyContent: 'center' },
  clearAllText: { ...typography.bodyBold, color: '#059669', backgroundColor: 'transparent' },
  choice: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.sm, minHeight: 34, justifyContent: 'center' },
  yes: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
  yesText: { color: '#059669', fontWeight: '700' },
  hand: { backgroundColor: '#FFF7ED', borderColor: '#EA580C' },
  handText: { color: '#EA580C', fontWeight: '700' },
  issue: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  issueText: { color: '#DC2626', fontWeight: '700' },
  notes: { minHeight: 88, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, padding: spacing.md, color: colors.textPrimary, textAlignVertical: 'top', marginBottom: spacing.sm },
  submit: { minHeight: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  disabled: { opacity: 0.45 },
});
