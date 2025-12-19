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
   STATIC BARANGAY LIST
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

type BrgyCountRow = { brgy: string; total: number };
type UserCountRow = { user: string; total: number };
type DateCountRow = { date: string; total: number };

const YakapDashboard: React.FC = () => {
  const [yakaps, setYakaps] = useState<YakapRow[]>([]);
  const [selectedBrgy, setSelectedBrgy] = useState("");

  /* -----------------------------
     LOAD DATA
  -------------------------------- */
  useEffect(() => {
    getYakaps().then(setYakaps).catch(console.error);
  }, []);

  /* -----------------------------
     BARANGAY COUNTS (ALL)
  -------------------------------- */
  const brgyCounts = useMemo<BrgyCountRow[]>(() => {
    const counts = yakaps.reduce<Record<string, number>>((acc, y) => {
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
     USER COUNTS (ALL)
  -------------------------------- */
  const userCounts = useMemo<UserCountRow[]>(() => {
    const counts = yakaps.reduce<Record<string, number>>((acc, y) => {
      acc[y.user_id] = (acc[y.user_id] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([user, total]) => ({ user, total }))
      .sort((a, b) => b.total - a.total);
  }, [yakaps]);

  /* -----------------------------
     DATE COUNTS (ALL)
  -------------------------------- */
  const dateCounts = useMemo<DateCountRow[]>(() => {
    const counts = yakaps.reduce<Record<string, number>>((acc, y) => {
      const date = new Date(y.createdAt).toISOString().slice(0, 10);
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [yakaps]);

  /* -----------------------------
     OVERALL TOTAL
  -------------------------------- */
  const overallTotal = yakaps.length;

  /* -----------------------------
     CSV EXPORT (BARANGAY)
  -------------------------------- */
  const exportCSV = () => {
    const csv = [
      ["Barangay", "Total"],
      ...brgyCounts.map((r) => [r.brgy, r.total.toString()]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "barangay-overall.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Yakap Dashboard</h1>

        {/* OVERALL */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Total</CardTitle>
            <CardDescription>All Yakap records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{overallTotal}</p>
          </CardContent>
        </Card>

        {/* BARANGAY */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay Breakdown (Overall)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Filter Barangay</Label>
            <select
              className="border rounded-md px-3 py-2 w-full md:w-1/3"
              value={selectedBrgy}
              onChange={(e) => setSelectedBrgy(e.target.value)}
            >
              <option value="">All</option>
              {BRGIES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <Button variant="outline" onClick={exportCSV}>
              Export CSV
            </Button>

            <ScrollArea className="h-80 border rounded-md">
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
                      <TableCell className="text-right font-medium">
                        {r.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* DATE */}
        <Card>
          <CardHeader>
            <CardTitle>Date Breakdown (Overall)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateCounts.map((d) => (
                    <TableRow key={d.date}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-right font-medium">
                        {d.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* USER */}
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown (Overall)</CardTitle>
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
                      <TableCell className="text-right font-medium">
                        {u.total}
                      </TableCell>
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
