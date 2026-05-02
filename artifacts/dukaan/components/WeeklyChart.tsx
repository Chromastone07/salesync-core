import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { G, Line, Rect, Svg, Text as SvgText } from "react-native-svg";

import type { Sale } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type DayData = {
  date: Date;
  label: string;
  isToday: boolean;
  total: number;
};

function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function formatAmount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
}

interface WeeklyChartProps {
  sales: Sale[];
}

const BAR_W = 28;
const BAR_GAP = 14;
const CHART_H = 110;
const MIN_BAR_H = 4;

export function WeeklyChart({ sales }: WeeklyChartProps) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayData: DayData[] = getLast7Days().map((day) => {
    const key = day.toDateString();
    const total = sales
      .filter((s) => new Date(s.date).toDateString() === key)
      .reduce((acc, s) => acc + s.total, 0);
    return {
      date: day,
      label: DAY_LABELS[day.getDay()],
      isToday: day.getTime() === today.getTime(),
      total,
    };
  });

  const weekTotal = dayData.reduce((s, d) => s + d.total, 0);
  const maxVal = Math.max(...dayData.map((d) => d.total), 1);

  const svgW = 7 * (BAR_W + BAR_GAP) - BAR_GAP;
  const svgH = CHART_H + 20; // bars + day labels

  const todayIdx = dayData.findIndex((d) => d.isToday);
  const displayIdx = selected !== null ? selected : todayIdx;
  const displayDay = dayData[displayIdx];

  const s = StyleSheet.create({
    wrap: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius + 4,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    weekLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    weekTotal: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginTop: 2,
    },
    badge: {
      alignItems: "flex-end",
    },
    badgeLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    badgeAmount: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    chartWrap: {
      alignItems: "center",
    },
    noDataWrap: {
      height: svgH,
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });

  const hasAnyData = weekTotal > 0;

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <View>
          <Text style={s.weekLabel}>This week</Text>
          <Text style={s.weekTotal}>{formatAmount(weekTotal)}</Text>
        </View>
        {displayDay && (
          <View style={s.badge}>
            <Text style={s.badgeLabel}>
              {displayDay.isToday ? "Today" : displayDay.label}
            </Text>
            <Text style={s.badgeAmount}>
              {formatAmount(displayDay.total)}
            </Text>
          </View>
        )}
      </View>

      <View style={s.chartWrap}>
        {!hasAnyData ? (
          <View style={s.noDataWrap}>
            <Text style={s.noDataText}>Record your first sale to see trends</Text>
          </View>
        ) : (
          <Svg width={svgW} height={svgH}>
            {/* grid line at top */}
            <Line
              x1={0}
              y1={2}
              x2={svgW}
              y2={2}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 3"
            />

            {dayData.map((day, i) => {
              const barH = Math.max(
                day.total > 0 ? (day.total / maxVal) * CHART_H : 0,
                day.total > 0 ? MIN_BAR_H : 0
              );
              const x = i * (BAR_W + BAR_GAP);
              const y = CHART_H - barH;
              const isSelected = selected === i;
              const isHighlighted = day.isToday || isSelected;

              return (
                <G key={i}>
                  {/* tap target */}
                  <Rect
                    x={x}
                    y={0}
                    width={BAR_W}
                    height={svgH}
                    fill="transparent"
                    onPress={() =>
                      setSelected(isSelected && !day.isToday ? null : i)
                    }
                  />
                  {/* bar */}
                  <Rect
                    x={x}
                    y={y}
                    width={BAR_W}
                    height={barH}
                    rx={6}
                    ry={6}
                    fill={
                      isHighlighted
                        ? colors.primary
                        : colors.muted
                    }
                    opacity={isHighlighted ? 1 : 0.7}
                  />
                  {/* amount label above bar (only if selected or today and bar is tall enough) */}
                  {isHighlighted && day.total > 0 && barH > 20 && (
                    <SvgText
                      x={x + BAR_W / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fill={colors.primary}
                      fontSize={10}
                      fontWeight="700"
                    >
                      {formatAmount(day.total)}
                    </SvgText>
                  )}
                  {/* day label */}
                  <SvgText
                    x={x + BAR_W / 2}
                    y={svgH - 2}
                    textAnchor="middle"
                    fill={
                      isHighlighted ? colors.primary : colors.mutedForeground
                    }
                    fontSize={11}
                    fontWeight={isHighlighted ? "700" : "400"}
                  >
                    {day.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>
    </View>
  );
}
