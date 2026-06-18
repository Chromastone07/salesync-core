import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

  const maxVal = Math.max(...dayData.map((d) => d.total), 1);

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
    noDataText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    barsContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      width: "100%",
      height: CHART_H + 24, // extra space for labels
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderStyle: "dashed", // simulated grid line
      paddingTop: 10,
    },
    barColumn: {
      alignItems: "center",
      justifyContent: "flex-end",
      height: "100%",
      flex: 1,
    },
    barArea: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      width: "100%",
    },
    bar: {
      width: 24, // bar width
      borderRadius: 6,
    },
    barAmountLabel: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      marginBottom: 4,
    },
    dayLabel: {
      fontSize: 11,
      marginTop: 6,
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
          <View style={{ height: CHART_H + 24, alignItems: "center", justifyContent: "center" }}>
            <Text style={s.noDataText}>Record your first sale to see trends</Text>
          </View>
        ) : (
          <View style={s.barsContainer}>
            {dayData.map((day, i) => {
              const barH = Math.max(
                day.total > 0 ? (day.total / maxVal) * CHART_H : 0,
                day.total > 0 ? MIN_BAR_H : 0
              );
              const isSelected = selected === i;
              const isHighlighted = day.isToday || isSelected;

              return (
                <Pressable
                  key={i}
                  style={s.barColumn}
                  onPress={() => setSelected(isSelected && !day.isToday ? null : i)}
                >
                  <View style={s.barArea}>
                    {isHighlighted && day.total > 0 && barH > 20 && (
                      <Text style={s.barAmountLabel}>{formatAmount(day.total)}</Text>
                    )}
                    <View
                      style={[
                        s.bar,
                        {
                          height: barH,
                          backgroundColor: isHighlighted ? colors.primary : colors.muted,
                          opacity: isHighlighted ? 1 : 0.7,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      s.dayLabel,
                      {
                        color: isHighlighted ? colors.primary : colors.mutedForeground,
                        fontFamily: isHighlighted ? "Inter_700Bold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
