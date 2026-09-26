import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/design/theme';
import { FormField } from './FormField';
import { OptionRow } from './OptionRow';
import { LinkButton } from './Buttons';
import { MockSchool, searchSchools } from '@/auth/mock-directory';
import { clearPinnedSchool, getPinnedSchool, setPinnedSchool } from '@/auth/pinned-school';

export function SchoolPicker({
  scope,
  onSelect,
}: {
  scope: 'teacher' | 'school-admin';
  onSelect: (school: MockSchool) => void;
}) {
  const [pinned, setPinned] = useState<MockSchool | null | undefined>(undefined);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getPinnedSchool(scope).then(setPinned);
  }, [scope]);

  async function choose(school: MockSchool) {
    await setPinnedSchool(scope, school);
    onSelect(school);
  }

  async function forgetPinned() {
    await clearPinnedSchool(scope);
    setPinned(null);
  }

  if (pinned === undefined) return null;

  if (pinned && query.length === 0) {
    return (
      <View style={styles.gap}>
        <Text style={styles.helper}>Your last school is pinned for quick sign-in.</Text>
        <OptionRow
          label={pinned.name}
          sublabel={pinned.id}
          initial={pinned.name.charAt(0)}
          onPress={() => choose(pinned)}
        />
        <LinkButton label="Not your school? Search instead" onPress={() => setQuery(' ')} />
      </View>
    );
  }

  const { refine, matches } = searchSchools(query);

  return (
    <View style={styles.gap}>
      <FormField
        label="School name or ID"
        value={query.trim()}
        onChangeText={setQuery}
        placeholder="Enter school name or ID"
        autoCapitalize="words"
      />
      {query.trim().length === 0 ? (
        <Text style={styles.helper}>Type at least 2 characters to search.</Text>
      ) : refine ? (
        <Text style={styles.helper}>Multiple schools match — keep typing to refine.</Text>
      ) : matches.length === 0 && query.trim().length >= 2 ? (
        <Text style={styles.helper}>No school found. Check the spelling or ID.</Text>
      ) : null}
      {matches.map((school) => (
        <OptionRow
          key={school.id}
          label={school.name}
          sublabel={school.id}
          initial={school.name.charAt(0)}
          onPress={() => choose(school)}
        />
      ))}
      {pinned ? <LinkButton label="Use pinned school instead" onPress={forgetPinned} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.md },
  helper: { fontSize: 13, color: colors.textMuted },
});
