"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { getYakaps } from "@/lib/yakapClient";
import type { YakapRow } from "@/lib/yakapSchemas";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

/* -----------------------------
   STATIC BARANGAY LIST (ORDERED)
-------------------------------- */
const BRGIES = [
  "BARANGAY 1",
  "BARANGAY 2",
  "BARANGAY 3",
  "BARANGAY 4",
  "BARANGAY 5",
  "BARANGAY 6",
  "BARANGAY 7",
  "BARANGAY 8",
  "BARANGAY 9",
  "BARANGAY 10",
  "BARANGAY 11",
  "BARRA",
  "BOCOHAN",
  "COTTA",
  "DALAHICAN",
  "DOMOIT",
  "GULANG-GULANG",
  "IBABANG DUPAY",
  "IBABANG IYAM",
  "IBABANG TALIM",
  "ILAYANG DUPAY",
  "ILAYANG IYAM",
  "ILAYANG TALIM",
  "ISABANG",
  "MARKETVIEW",
  "MAYAO CROSSING",
  "MAYAO CASTILLO",
  "MAYAO KANLURAN",
  "MAYAO PARADA",
  "MAYAO SILANGAN",
  "RANSOHAN",
  "SALINAS",
  "TALAO-TALAO",
];

/* -----------------------------
   DATE HELPER (TODAY ONLY)
-------------------------------- */
function isToday(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

type BrgyCountRow = {
  brgy: string;
  total: number;
};

type UserCountRow = {
  user: string;
  total: number;
};

const YakapDashboard: React.FC = () => {
  const [yakaps, setYakaps] = useState<YakapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrgy, setSelectedBrgy] = useState<string>("");

  /* -----------------------------
     LOAD DATA
  -------------------------------- */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getYakaps();
      setYakaps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     BUILD BRGY COUNTS (FIXED ORDER)
  -------------------------------- */
  const brgyCounts = useMemo<BrgyCountRow[]>(() => {
    const counts = yakaps
      .filter((y) => isToday(y.createdAt))
      .reduce<Record<string, number>>((acc, y) => {
        acc[y.brgy_id] = (acc[y.brgy_id] ?? 0) + 1;
        return acc;
      }, {});

    let rows = BRGIES.map((brgy) => ({
      brgy,
      total: counts[brgy] ?? 0,
    }));

    if (selectedBrgy) {
      rows = rows.filter((r) => r.brgy === selectedBrgy);
    }

    return rows;
  }, [yakaps, selectedBrgy]);

  /* -----------------------------
     BUILD USER COUNTS
  -------------------------------- */
  const userCounts = useMemo<UserCountRow[]>(() => {
    const counts = yakaps
      .filter((y) => isToday(y.createdAt))
      .reduce<Record<string, number>>((acc, y) => {
        acc[y.user_id] = (acc[y.user_id] ?? 0) + 1;
        return acc;
      }, {});

    return Object.entries(counts).map(([user, total]) => ({ user, total }));
  }, [yakaps]);

  /* -----------------------------
     OVERALL TOTAL
  -------------------------------- */
  const overallTotal = useMemo(() => {
    return brgyCounts.reduce((sum, r) => sum + r.total, 0);
  }, [brgyCounts]);

  /* -----------------------------
     CSV EXPORT (BRGY ONLY)
  -------------------------------- */
  const exportCSV = () => {
    const header = ["Barangay", "Total"];
    const rows = brgyCounts.map((r) => [r.brgy, r.total.toString()]);

    const csv = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `yakap-dashboard-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="container mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Yakap Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Today&apos;s summary
          </p>
        </header>

        {/* OVERALL TOTAL */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Total (Today)</CardTitle>
            <CardDescription>
              Total Yakap entries across all barangays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{overallTotal}</p>
          </CardContent>
        </Card>

        {/* BRGY TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay Breakdown</CardTitle>
            <CardDescription>Ordered from Barangay 1 to Talao-Talao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <Label>Filter by Barangay</Label>
                <select
                  value={selectedBrgy}
                  onChange={(e) => setSelectedBrgy(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">All barangays</option>
                  {BRGIES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={exportCSV} variant="outline">
                Export CSV
              </Button>
            </div>

            <ScrollArea className="h-105 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barangay</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brgyCounts.map((r) => (
                    <TableRow key={r.brgy}>
                      <TableCell>{r.brgy}</TableCell>
                      <TableCell className="text-right font-medium">{r.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* USER TABLE (NOT EXPORTED) */}
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
            <CardDescription>
              Counts of entries per user (not included in CSV)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCounts.map((u) => (
                    <TableRow key={u.user}>
                      <TableCell>{u.user}</TableCell>
                      <TableCell className="text-right font-medium">{u.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YakapDashboard;
