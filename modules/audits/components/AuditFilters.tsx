import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SearchBar, Select } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG } from '@src/configs/constants';
import { Company, User } from '@src/types';
import { AuditFilters as AuditFiltersType } from '../services/auditService';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  companies: Company[];
  fieldUsers: User[];
  onFilterChange: (filters: Partial<AuditFiltersType>) => void;
}

const STATUS_OPTIONS = [
  { label: 'Tümü', value: '' },
  ...Object.entries(AUDIT_STATUS_CONFIG).map(([key, config]) => ({
    label: config.label,
    value: key,
  })),
];

const AuditFiltersComponent = ({ filters, companies, fieldUsers, onFilterChange }: AuditFiltersProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <SearchBar
        value={filters.search || ''}
        onChangeText={(text) => onFilterChange({ search: text })}
        placeholder="Denetim ara..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {STATUS_OPTIONS.map((opt) => {
          const isActive = (filters.status || '') === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                { backgroundColor: colors.surfaceVariant },
                isActive && { backgroundColor: colors.primary },
              ]}
              onPress={() => onFilterChange({ status: opt.value || undefined })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  isActive && { color: colors.white },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {companies.length > 0 && (
        <Select
          placeholder="Şirket filtresi..."
          options={[{ label: 'Tüm Şirketler', value: 0 }, ...companies.map((c) => ({ label: c.name, value: c.id }))]}
          value={filters.companyId || 0}
          onChange={(v) => onFilterChange({ companyId: v === 0 ? undefined : (v as number) })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING.sm, marginBottom: SPACING.md },
  chips: { flexDirection: 'row', paddingVertical: SPACING.xs },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  chipText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
});

export default React.memo(AuditFiltersComponent);
