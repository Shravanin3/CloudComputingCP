import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { colors } from '../../constants/colors';

// ============================================================================
// 1. MODERN BEZIER CURVED LINE CHART
// ============================================================================

interface BezierLineChartProps {
  labels: string[];
  data: number[];
  secondaryData?: number[];
  secondaryLabel?: string;
  primaryLabel?: string;
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  yAxisPrefix?: string;
}

export const ModernBezierLineChart: React.FC<BezierLineChartProps> = ({
  labels,
  data,
  secondaryData,
  secondaryLabel = 'Expenses',
  primaryLabel = 'Sales',
  width,
  height = 220,
  primaryColor = '#4F46E5',
  secondaryColor = '#EF4444',
  yAxisPrefix = '₹',
}) => {
  const chartWidth = width || Math.min(Dimensions.get('window').width - 32, 650);
  const hasActivity = data.some((v) => v > 0) || (secondaryData && secondaryData.some((v) => v > 0));

  // Sanitize data: chart-kit requires at least 2 points and avoids dividing by 0
  const safeData = data.length >= 2 ? data : [0, ...(data.length === 1 ? data : [0])];
  const safeLabels = labels.length >= 2 ? labels : ['Start', ...(labels.length === 1 ? labels : ['Today'])];
  const allZeros = safeData.every((v) => v === 0);
  const chartData = allZeros ? safeData.map(() => 1) : safeData; // Avoid divide-by-zero internally

  const datasets: any[] = [
    {
      data: chartData,
      color: (opacity = 1) => primaryColor,
      strokeWidth: 3,
    },
  ];

  if (secondaryData && secondaryData.length > 0) {
    const safeSec = secondaryData.length >= 2 ? secondaryData : [0, ...(secondaryData.length === 1 ? secondaryData : [0])];
    datasets.push({
      data: allZeros ? safeSec.map(() => 1) : safeSec,
      color: (opacity = 1) => secondaryColor,
      strokeWidth: 2,
    });
  }

  const formatY = (val: string) => {
    const num = Number(val);
    if (allZeros) return `${yAxisPrefix}0`;
    if (num >= 100000) return `${yAxisPrefix}${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${yAxisPrefix}${(num / 1000).toFixed(0)}k`;
    return `${yAxisPrefix}${Math.round(num)}`;
  };

  const peakValue = Math.max(...data, 0);

  return (
    <View style={styles.chartOuterBox}>
      {/* Legend & Stats Header */}
      <View style={styles.lineHeaderRow}>
        <View style={styles.legendGroup}>
          <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
          <Text style={styles.legendText}>{primaryLabel}</Text>
          {secondaryData && (
            <>
              <View style={[styles.legendDot, { backgroundColor: secondaryColor, marginLeft: 12 }]} />
              <Text style={styles.legendText}>{secondaryLabel}</Text>
            </>
          )}
        </View>
        {peakValue > 0 && (
          <View style={styles.peakBadge}>
            <Text style={styles.peakBadgeText}>Peak: ₹{peakValue.toLocaleString('en-IN')}</Text>
          </View>
        )}
      </View>

      {!hasActivity ? (
        <View style={[styles.emptyContainer, { height: height - 40 }]}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>No Sales Activity in Selected Period</Text>
          <Text style={styles.emptySubtitle}>
            When POS bills are created, real-time revenue curves will automatically display here.
          </Text>
        </View>
      ) : (
        <LineChart
          data={{
            labels: safeLabels,
            datasets,
          }}
          width={chartWidth}
          height={height}
          yAxisLabel={yAxisPrefix}
          yAxisSuffix=""
          formatYLabel={formatY}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: '4',
              stroke: '#E2E8F0',
              strokeWidth: 1,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: primaryColor,
              fill: '#FFFFFF',
            },
          }}
          bezier
          style={styles.chartBorderRadius}
        />
      )}
    </View>
  );
};

// ============================================================================
// 2. MODERN 4-PILLAR COMPARISON BAR CHART
// ============================================================================

interface ModernPillarBarChartProps {
  labels: string[];
  data: number[];
  width?: number;
  height?: number;
}

export const ModernPillarBarChart: React.FC<ModernPillarBarChartProps> = ({
  labels,
  data,
  width,
  height = 220,
}) => {
  const chartWidth = width || Math.min(Dimensions.get('window').width - 32, 650);
  const allZeros = data.every((v) => v <= 0);
  const safeData = allZeros ? [1, 1, 1, 1] : data.map((v) => Math.max(0, v));

  const formatY = (val: string) => {
    const num = Number(val);
    if (allZeros) return '₹0';
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${Math.round(num)}`;
  };

  return (
    <View style={styles.chartOuterBox}>
      <BarChart
        data={{
          labels,
          datasets: [{ data: safeData }],
        }}
        width={chartWidth}
        height={height}
        yAxisLabel="₹"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#F8FAFC',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
          barPercentage: 0.65,
          fillShadowGradient: colors.primary,
          fillShadowGradientOpacity: 1,
          propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: '#E2E8F0',
            strokeWidth: 1,
          },
        }}
        showValuesOnTopOfBars
        style={styles.chartBorderRadius}
      />
    </View>
  );
};

// ============================================================================
// 3. MODERN PAYMENT / REVENUE PIE CHART
// ============================================================================

interface PieChartItem {
  name: string;
  population: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

interface ModernPieChartCardProps {
  data: PieChartItem[];
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
}

export const ModernPieChartCard: React.FC<ModernPieChartCardProps> = ({
  data,
  width,
  height = 190,
  title,
  subtitle,
}) => {
  const chartWidth = width || Math.min(Dimensions.get('window').width - 48, 620);
  const total = data.reduce((sum, item) => sum + Math.max(0, item.population), 0);

  const displayData = total > 0
    ? data.filter((item) => item.population > 0)
    : [{ name: 'No Data', population: 1, color: '#CBD5E1', legendFontColor: '#64748B', legendFontSize: 12 }];

  return (
    <View style={styles.pieContainer}>
      {title && (
        <View style={styles.pieHeader}>
          <Text style={styles.pieTitle}>{title}</Text>
          {subtitle && <Text style={styles.pieSubtitle}>{subtitle}</Text>}
        </View>
      )}

      <PieChart
        data={displayData}
        width={chartWidth}
        height={height}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />

      {/* Breakdown Legend Cards with exact Rupee amounts & Percentages */}
      {total > 0 && (
        <View style={styles.pieLegendGrid}>
          {data.map((item, idx) => {
            const pct = total > 0 ? Math.round((Math.max(0, item.population) / total) * 100) : 0;
            return (
              <View key={idx} style={styles.pieLegendCard}>
                <View style={styles.pieLegendTop}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pieLegendName}>{item.name}</Text>
                  <Text style={styles.pieLegendPct}>{pct}%</Text>
                </View>
                <Text style={styles.pieLegendAmt}>₹{item.population.toLocaleString('en-IN')}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// 4. FINANCIAL HEALTH PROGRESS RINGS
// ============================================================================

interface ModernHealthRingProps {
  grossMarginPct: number; // 0 to 100
  netMarginPct: number;   // 0 to 100
  cashCollectionPct: number; // 0 to 100
  width?: number;
  height?: number;
}

export const ModernFinancialHealthRings: React.FC<ModernHealthRingProps> = ({
  grossMarginPct,
  netMarginPct,
  cashCollectionPct,
  width,
  height = 180,
}) => {
  const chartWidth = width || Math.min(Dimensions.get('window').width - 48, 620);

  // Normalize to 0.0 - 1.0 (capped at 1.0)
  const normGross = Math.max(0, Math.min(1, grossMarginPct / 100));
  const normNet = Math.max(0, Math.min(1, netMarginPct / 100));
  const normCash = Math.max(0, Math.min(1, cashCollectionPct / 100));

  const ringData = {
    labels: ['Gross Margin', 'Net Margin', 'Cash Ratio'],
    data: [normGross, normNet, normCash],
  };

  const isHealthy = netMarginPct >= 10 && cashCollectionPct >= 60;

  return (
    <View style={styles.ringsContainer}>
      <View style={styles.ringsHeader}>
        <View>
          <Text style={styles.ringsTitle}>Financial Health Rings</Text>
          <Text style={styles.ringsSubtitle}>Profit margins & collection liquidity</Text>
        </View>
        <View
          style={[
            styles.healthBadge,
            { backgroundColor: isHealthy ? colors.successBg : colors.warningBg },
          ]}
        >
          <Text
            style={[
              styles.healthBadgeText,
              { color: isHealthy ? colors.success : colors.warning },
            ]}
          >
            {isHealthy ? '● Strong Health' : '● Needs Attention'}
          </Text>
        </View>
      </View>

      <ProgressChart
        data={ringData}
        width={chartWidth}
        height={height}
        strokeWidth={12}
        radius={28}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          color: (opacity = 1, index) => {
            if (index === 0) return `rgba(16, 185, 129, ${opacity})`; // Gross: Emerald
            if (index === 1) return `rgba(79, 70, 229, ${opacity})`;  // Net: Indigo
            return `rgba(245, 158, 11, ${opacity})`;                  // Cash: Amber
          },
          labelColor: () => '#475569',
        }}
        hideLegend={false}
        style={styles.chartBorderRadius}
      />

      {/* Ring Stat Pills */}
      <View style={styles.ringPillsRow}>
        <View style={[styles.ringPill, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.ringPillLabel}>Gross Margin</Text>
          <Text style={[styles.ringPillVal, { color: '#10B981' }]}>{grossMarginPct}%</Text>
        </View>
        <View style={[styles.ringPill, { borderLeftColor: '#4F46E5' }]}>
          <Text style={styles.ringPillLabel}>Net Margin</Text>
          <Text style={[styles.ringPillVal, { color: '#4F46E5' }]}>{netMarginPct}%</Text>
        </View>
        <View style={[styles.ringPill, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.ringPillLabel}>Instant Cash</Text>
          <Text style={[styles.ringPillVal, { color: '#F59E0B' }]}>{cashCollectionPct}%</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 5. EXISTING CLEAN FALLBACK CHARTS PRESERVED FOR LIGHTWEIGHT RENDERING
// ============================================================================

interface TrendBarChartProps {
  labels: string[];
  data: number[];
  height?: number;
  barColor?: string;
}

export const ModernTrendBarChart: React.FC<TrendBarChartProps> = ({
  labels,
  data,
  height = 180,
  barColor = colors.primary,
}) => {
  const maxVal = Math.max(...data, 1);
  const hasActivity = data.some((v) => v > 0);

  const formatShort = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Math.round(val)}`;
  };

  if (!hasActivity) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Sales Recorded in Last 7 Days</Text>
        <Text style={styles.emptySubtitle}>
          Invoices generated in Point of Sale will automatically reflect in this daily trend chart.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.chartWrapper, { height }]}>
      <View style={styles.gridContainer}>
        <View style={styles.gridLineRow}>
          <Text style={styles.axisLabel}>{formatShort(maxVal)}</Text>
          <View style={styles.gridLine} />
        </View>
        <View style={styles.gridLineRow}>
          <Text style={styles.axisLabel}>{formatShort(maxVal / 2)}</Text>
          <View style={styles.gridLine} />
        </View>
        <View style={styles.gridLineRow}>
          <Text style={styles.axisLabel}>₹0</Text>
          <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
        </View>
      </View>

      <View style={styles.barsContainer}>
        {data.map((val, idx) => {
          const heightPercent = maxVal > 0 ? Math.min(100, Math.max(0, (val / maxVal) * 100)) : 0;
          const isHighest = val === maxVal && val > 0;

          return (
            <View key={idx} style={styles.barColumn}>
              <View style={styles.topValueContainer}>
                {val > 0 ? (
                  <Text style={[styles.topValueText, isHighest && styles.topValueHighlight]}>
                    {formatShort(val)}
                  </Text>
                ) : (
                  <Text style={styles.topValueText}>-</Text>
                )}
              </View>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isHighest ? colors.accent : barColor,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.barLabel, isHighest && styles.barLabelHighlight]}>
                {labels[idx] || ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
}

interface ModernBreakdownBarChartProps {
  items: BreakdownItem[];
  totalRevenue?: number;
}

export const ModernBreakdownBarChart: React.FC<ModernBreakdownBarChartProps> = ({
  items,
  totalRevenue,
}) => {
  const maxAmount = Math.max(...items.map((i) => i.amount), totalRevenue || 1, 1);

  return (
    <View style={styles.breakdownContainer}>
      {items.map((item, idx) => {
        const percent = Math.min(100, Math.round((Math.max(0, item.amount) / maxAmount) * 100));
        return (
          <View key={idx} style={styles.breakdownRow}>
            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownLabelGroup}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
              <Text style={[styles.breakdownAmount, { color: item.color }]}>
                ₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percent}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

interface DistributionSegment {
  label: string;
  amount: number;
  color: string;
  icon?: string;
}

interface ModernDistributionBarProps {
  segments: DistributionSegment[];
}

export const ModernDistributionBar: React.FC<ModernDistributionBarProps> = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.amount), 0);

  return (
    <View style={styles.distributionContainer}>
      <View style={styles.segmentedBar}>
        {total === 0 ? (
          <View style={[styles.segmentPart, { width: '100%', backgroundColor: '#E2E8F0' }]} />
        ) : (
          segments.map((seg, idx) => {
            const pct = (Math.max(0, seg.amount) / total) * 100;
            if (pct <= 0) return null;
            return (
              <View
                key={idx}
                style={[
                  styles.segmentPart,
                  {
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                  },
                ]}
              />
            );
          })
        )}
      </View>

      <View style={styles.distributionCards}>
        {segments.map((seg, idx) => {
          const pct = total > 0 ? Math.round((Math.max(0, seg.amount) / total) * 100) : 0;
          return (
            <View key={idx} style={styles.distCard}>
              <View style={styles.distCardHeader}>
                <View style={[styles.colorDot, { backgroundColor: seg.color }]} />
                <Text style={styles.distCardLabel}>{seg.label}</Text>
                <Text style={styles.distCardPct}>{pct}%</Text>
              </View>
              <Text style={styles.distCardAmount}>₹{seg.amount.toLocaleString('en-IN')}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  chartOuterBox: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  chartBorderRadius: {
    borderRadius: 16,
    marginVertical: 6,
  },
  lineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  peakBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  peakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

  // Pie Chart Styles
  pieContainer: {
    width: '100%',
    marginVertical: 4,
  },
  pieHeader: {
    marginBottom: 8,
  },
  pieTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pieSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pieLegendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pieLegendCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pieLegendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pieLegendName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  pieLegendPct: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  pieLegendAmt: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // Rings Styles
  ringsContainer: {
    width: '100%',
    marginVertical: 4,
  },
  ringsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ringsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ringsSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  healthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ringPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  ringPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 3,
  },
  ringPillLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ringPillVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  // Fallback Chart Styles
  chartWrapper: {
    width: '100%',
    position: 'relative',
    marginTop: 10,
    marginBottom: 6,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 18,
  },
  gridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    width: 44,
    textAlign: 'left',
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 46,
    paddingBottom: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  topValueContainer: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  topValueText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  topValueHighlight: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  barTrack: {
    width: 22,
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
    height: 16,
  },
  barLabelHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 18,
  },

  breakdownContainer: {
    width: '100%',
    marginTop: 12,
  },
  breakdownRow: {
    marginBottom: 14,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakdownAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  distributionContainer: {
    width: '100%',
    marginTop: 10,
  },
  segmentedBar: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  segmentPart: {
    height: '100%',
  },
  distributionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  distCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  distCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distCardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  distCardPct: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  distCardAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
