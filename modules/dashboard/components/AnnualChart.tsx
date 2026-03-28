import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card } from '@src/components';
import { SPACING, FONT_SIZE } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AnnualStat } from '@src/types';

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

interface AnnualChartProps {
  data: AnnualStat[];
}

const AnnualChart = ({ data }: AnnualChartProps) => {
  const { colors } = useTheme();
  if (data.length === 0) return null;

  const screenWidth = Dimensions.get('window').width - 64;

  const chartData = {
    labels: data.map((d) => MONTH_LABELS[d.month - 1] || ''),
    datasets: [{ data: data.map((d) => d.averageScore || 0) }],
  };

  return (
    <Card style={styles.card} variant="elevated">
      <Text style={[styles.title, { color: colors.text }]}>Yıllık Denetim Puanları</Text>
      <BarChart
        data={chartData}
        width={screenWidth}
        height={200}
        yAxisSuffix=""
        yAxisLabel=""
        fromZero
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          labelColor: () => colors.textSecondary,
          barPercentage: 0.6,
          propsForBackgroundLines: { strokeDasharray: '', stroke: colors.borderLight },
        }}
        style={styles.chart}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: SPACING.lg },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chart: { borderRadius: 8, marginLeft: -SPACING.md },
});

export default React.memo(AnnualChart);
