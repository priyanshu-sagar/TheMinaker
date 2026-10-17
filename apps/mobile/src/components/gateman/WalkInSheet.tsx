import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { CheckBox, SearchField } from '@/components/gateman/sheets';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore, VisitorPass } from '@/store/gateman.store';

const CATEGORIES = ['Student', 'Parent / Guardian', 'Vendor / Supplier', 'School Worker / Maintenance', 'Official Guest / Visitor', 'Other'] as const;

const PURPOSES: Record<(typeof CATEGORIES)[number], string[]> = {
  Student: ['Late walk-in arrival', 'Parent drop at gate', 'Medical / early exit', 'Forgot ID / bus pass', 'Other'],
  'Parent / Guardian': ['Early pickup handover', 'Dropping child / belongings', 'Reception / fee query', 'Principal / teacher meeting', 'Transport query', 'Other'],
  'Vendor / Supplier': ['Canteen / food supply', 'Books and stationery', 'Lab / sports goods', 'Water / utility tanker', 'Courier / parcel', 'Other'],
  'School Worker / Maintenance': ['Electrical / AC work', 'Plumbing / civil repair', 'Fleet / bus mechanic', 'Housekeeping / grounds', 'IT / CCTV support', 'Other'],
  'Official Guest / Visitor': ['Inspection / audit', 'Campus event guest', 'Admission visit', 'Other'],
  Other: ['Other'],
};

const DESTINATIONS: Record<(typeof CATEGORIES)[number], string[]> = {
  Student: ['Classroom / homeroom', 'Reception desk', 'Medical room', 'Gate handover zone'],
  'Parent / Guardian': ['Reception desk', 'Principal office', 'Fee counter', 'Gate handover zone'],
  'Vendor / Supplier': ['Main store', 'Canteen bay', 'Bus depot', 'Reception desk'],
  'School Worker / Maintenance': ['Bus depot', 'Classroom block', 'Reception desk', 'Grounds'],
  'Official Guest / Visitor': ['Principal office', 'Reception desk', 'Campus hall'],
  Other: ['Reception desk', 'Gate handover zone', 'Other'],
};

function kindFor(category: string): VisitorPass['kind'] {
  if (category === 'Student') return 'Walk-in student';
  if (category === 'Vendor / Supplier') return 'Vendor';
  return 'Visitor';
}

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function WalkInSheet({ onSaved }: { onSaved: () => void }) {
  const visitors = useGatemanStore((state) => state.visitors);
  const logVisitor = useGatemanStore((state) => state.logVisitor);
  const markVisitorExited = useGatemanStore((state) => state.markVisitorExited);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | ''>('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
  const [otherText, setOtherText] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [badge, setBadge] = useState('');
  const [autoTime, setAutoTime] = useState(true);
  const [customTime, setCustomTime] = useState(clockNow());
  const [open, setOpen] = useState<'category' | 'purpose' | 'destination' | null>(null);
  const recent = useMemo(() => visitors.slice(0, 5), [visitors]);
  const purposes = category ? PURPOSES[category] : [];
  const destinations = category ? DESTINATIONS[category] : [];
  const needsOther = purpose === 'Other' || destination === 'Other' || category === 'Other';

  function save() {
    if (!category || !name.trim() || !purpose) return;
    const resolvedPurpose = purpose === 'Other' && otherText.trim() ? otherText.trim() : purpose;
    const stamp = new Date();
    if (!autoTime) {
      const [hour, minute] = customTime.split(':').map((part) => Number(part));
      if (!Number.isNaN(hour) && !Number.isNaN(minute)) stamp.setHours(hour, minute, 0, 0);
    }
    logVisitor({
      name: name.trim(),
      kind: kindFor(category),
      category,
      purpose: resolvedPurpose,
      destination: destination || undefined,
      phone: phone.trim() || undefined,
      badge: badge.trim() || undefined,
      time: stamp.toISOString(),
    });
    setName('');
    setPhone('');
    setBadge('');
    setPurpose('');
    setDestination('');
    setOtherText('');
    onSaved();
  }

  return (
    <ScrollView bounces={false} style={styles.flex} keyboardShouldPersistTaps="handled">
      <Picker label="Visiting category" value={category} open={open === 'category'} onToggle={() => setOpen(open === 'category' ? null : 'category')} options={[...CATEGORIES]} onPick={(value) => { setCategory(value as (typeof CATEGORIES)[number]); setPurpose(''); setDestination(''); setOpen(null); }} />
      <Picker label="Primary purpose" value={purpose} open={open === 'purpose'} disabled={!category} onToggle={() => setOpen(open === 'purpose' ? null : 'purpose')} options={purposes} onPick={(value) => { setPurpose(value); setOpen(null); }} />
      <Picker label="Campus destination" value={destination} open={open === 'destination'} disabled={!purpose} onToggle={() => setOpen(open === 'destination' ? null : 'destination')} options={destinations} onPick={(value) => { setDestination(value); setOpen(null); }} />
      {needsOther ? <SearchField value={otherText} onChangeText={setOtherText} placeholder="Please specify" /> : null}
      <SearchField value={name} onChangeText={setName} placeholder="Person or student name" />
      <SearchField value={phone} onChangeText={setPhone} placeholder="Phone number" />
      <SearchField value={badge} onChangeText={setBadge} placeholder="Vehicle no. or visitor badge" />
      <View style={styles.timeRow}>
        <CheckBox on={autoTime} onPress={() => setAutoTime((value) => !value)} />
        <Text style={styles.body}>Use current time</Text>
        <Text style={styles.meta}>{autoTime ? clockNow() : ''}</Text>
      </View>
      {autoTime ? null : <AppTextInput value={customTime} onChangeText={setCustomTime} placeholder="HH:MM" placeholderTextColor={colors.textPlaceholder} style={styles.input} />}
      <AnimatedPressable haptic="medium" onPress={save} style={styles.primary}>
        <Text style={styles.primaryText}>Save walk-in</Text>
      </AnimatedPressable>
      <Text style={styles.kicker}>Today's recent walk-ins</Text>
      {recent.map((item) => (
        <View key={item.id} style={styles.recent}>
          <View style={styles.main}>
            <Text style={styles.body}>{item.name}</Text>
            <Text style={styles.meta}>{item.category ?? item.kind} · {item.purpose}{item.destination ? ` · ${item.destination}` : ''}</Text>
          </View>
          {item.exitedAt ? <Text style={styles.meta}>Exited</Text> : (
            <AnimatedPressable haptic="medium" onPress={() => markVisitorExited(item.id)} style={styles.exit}>
              <Text style={styles.exitText}>Mark exited</Text>
            </AnimatedPressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function Picker({ label, value, options, open, disabled, onToggle, onPick }: { label: string; value: string; options: string[]; open: boolean; disabled?: boolean; onToggle: () => void; onPick: (value: string) => void }) {
  return (
    <View style={styles.picker}>
      <AnimatedPressable haptic="selection" onPress={disabled ? undefined : onToggle} style={[styles.pickerBtn, disabled ? styles.disabled : null]}>
        <Text style={styles.meta}>{label}</Text>
        <Text style={styles.body}>{value || 'Select'}</Text>
      </AnimatedPressable>
      {open ? options.map((option) => (
        <AnimatedPressable key={option} haptic="selection" onPress={() => onPick(option)} style={styles.option}>
          <Text style={styles.body}>{option}</Text>
        </AnimatedPressable>
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  picker: { marginBottom: spacing.sm },
  pickerBtn: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  input: { minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, color: colors.textPrimary, marginBottom: spacing.sm },
  primary: { minHeight: 46, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  kicker: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  recent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  main: { flex: 1 },
  exit: { borderRadius: radius.md, borderWidth: 1, borderColor: portalAccents.gateman.from, paddingHorizontal: spacing.sm, minHeight: 32, justifyContent: 'center' },
  exitText: { ...typography.caption, color: portalAccents.gateman.from },
});
