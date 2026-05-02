import { Platform } from "react-native";
import type { Sale } from "@/context/StoreContext";

function padDate(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateStr(dateStr: string) {
  const d = new Date(dateStr);
  return `${padDate(d.getDate())}-${padDate(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function formatTimeStr(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function escapeCell(val: string | number): string {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildWeeklyCSV(sales: Sale[]): string {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const weeklySales = sales.filter((s) => {
    const d = new Date(s.date);
    return d >= weekAgo && d <= today;
  });

  const rows: string[] = [
    [
      "Date",
      "Time",
      "Bill No",
      "Customer Name",
      "Customer Phone",
      "Item",
      "Qty",
      "Unit",
      "Rate (₹)",
      "Amount (₹)",
    ]
      .map(escapeCell)
      .join(","),
  ];

  weeklySales.forEach((sale, billIdx) => {
    const dateStr = formatDateStr(sale.date);
    const timeStr = formatTimeStr(sale.date);
    const billNo = (billIdx + 1).toString();
    const custName = sale.customerName ?? "";
    const custPhone = sale.customerPhone ?? "";
    sale.items.forEach((item) => {
      rows.push(
        [
          dateStr,
          timeStr,
          billNo,
          custName,
          custPhone,
          item.label,
          item.quantity,
          item.unit,
          item.rate,
          item.total,
        ]
          .map(escapeCell)
          .join(",")
      );
    });
  });

  return rows.join("\n");
}

export async function downloadWeeklyCSV(sales: Sale[]): Promise<void> {
  const csv = buildWeeklyCSV(sales);
  const today = new Date();
  const filename = `dukaan-sales-${today.getFullYear()}${padDate(today.getMonth() + 1)}${padDate(today.getDate())}.csv`;

  if (Platform.OS === "web") {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const FileSystem = await import("expo-file-system");
  const Sharing = await import("expo-sharing");

  const path = FileSystem.default.cacheDirectory + filename;
  await FileSystem.default.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.default.isAvailableAsync();
  if (canShare) {
    await Sharing.default.shareAsync(path, {
      mimeType: "text/csv",
      dialogTitle: "Save weekly sales report",
      UTI: "public.comma-separated-values-text",
    });
  }
}
