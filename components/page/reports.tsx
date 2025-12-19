"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BRGIES = [
  "BARANGAY 1","BARANGAY 2","BARANGAY 3","BARANGAY 4","BARANGAY 5",
  "BARANGAY 6","BARANGAY 7","BARANGAY 8","BARANGAY 9","BARANGAY 10",
  "BARRA","BOCOHAN","COTTA","DALAHICAN","DOMOIT","GULANG-GULANG",
  "IBABANG DUPAY","IBABANG IYAM","IBABANG TALIM","ILAYANG DUPAY","ILAYANG IYAM",
  "ILAYANG TALIM","ISABANG","MARKETVIEW","MAYAO CROSSING","MAYAO CASTILLO",
  "MAYAO KANLURAN","MAYAO PARADA","MAYAO SILANGAN","RANSOHAN","SALINAS",
  "TALAO-TALAO",
];

interface YakapRow {
  yakap_id: string;
  fullname: string;
  address?: string | null;
  brgy_id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------
// Fetch Yakaps
// -------------------------
async function getYakaps(filter?: { brgy?: string; date?: string }) {
  let url = "/api/yakap";
  if (filter) {
    const params = new URLSearchParams();
    if (filter.brgy) params.append("brgy", filter.brgy);
    if (filter.date) params.append("date", filter.date);
    url += `?${params.toString()}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  return data.ok ? data.data : [];
}

// -------------------------
// Component
// -------------------------
const Reports: React.FC = () => {
  const [yakaps, setYakaps] = useState<YakapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [brgyFilter, setBrgyFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  // Load data
  const loadYakaps = async () => {
    setLoading(true);
    try {
      const filter = {
        brgy: brgyFilter === "ALL" ? undefined : brgyFilter,
        date: dateFilter,
      };
      const data = await getYakaps(filter);
      setYakaps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYakaps();
  }, [brgyFilter, dateFilter]);

  // Export CSV
  const exportCSV = () => {
  if (yakaps.length === 0) return;

  const header = ["No", "Fullname", "Barangay", "Created At"];
  const rows = yakaps.map((y, index) => [
    index + 1,
    y.fullname,
    y.brgy_id,
    new Date(y.createdAt).toLocaleString(),
  ]);

  // Use tab as delimiter
  const csvContent =
    [header, ...rows].map((r) => r.join("\t")).join("\n");

  const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `yakap_report_${dateFilter}.tsv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="container mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Yakap Reports</h1>
          <p className="text-sm text-muted-foreground">
            Filter records by Barangay and Date
          </p>
        </header>

        {/* Filters */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Adjust filters to view records</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col">
              <Label>Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <Label>Barangay</Label>
              <Select value={brgyFilter} onValueChange={setBrgyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Barangays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Barangays</SelectItem>
                  {BRGIES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={loadYakaps} className="mt-2 md:mt-0">
              {loading ? "Loading..." : "Apply"}
            </Button>

            <Button onClick={exportCSV} className="mt-2 md:mt-0">
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Yakap List</CardTitle>
            <CardDescription>
              Showing {yakaps.length} record{yakaps.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-105 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Fullname</TableHead>
                    <TableHead>Barangay</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yakaps.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No records
                      </TableCell>
                    </TableRow>
                  ) : (
                    yakaps.map((y, index) => (
                      <TableRow key={y.yakap_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{y.fullname}</TableCell>
                        <TableCell>{y.brgy_id}</TableCell>
                        <TableCell>{new Date(y.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
