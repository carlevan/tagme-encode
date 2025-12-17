"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createYakap, getYakaps } from "@/lib/yakapClient";
import type { YakapRow, CreateYakapRequest } from "@/lib/yakapSchemas";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const YakapEncode: React.FC = () => {
  const [form, setForm] = useState<CreateYakapRequest>({
    fullname: "",
    address: "",
    brgy_id: "",
    user_id: "",
  });

  const [yakaps, setYakaps] = useState<YakapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* -----------------------------
     LOAD ALL DATA ONCE
  -------------------------------- */
  useEffect(() => {
    reloadYakaps();
  }, []);

  const reloadYakaps = async () => {
    setLoadingTable(true);
    try {
      const data = await getYakaps();
      setYakaps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTable(false);
    }
  };

  /* -----------------------------
     FILTERED + SORTED VIEW
  -------------------------------- */
  const filteredYakaps = React.useMemo(() => {
    if (!form.user_id) return [];

    return yakaps
      .filter(
        (y) =>
          y.user_id === form.user_id &&
          isToday(y.createdAt),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [yakaps, form.user_id]);

  const handleChange =
  (field: keyof CreateYakapRequest) =>
  (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    let value = e.target.value;

    // Automatically uppercase fullname and user_id
    if (field === "fullname" || field === "user_id") {
      value = value.toUpperCase();
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };
  /* -----------------------------
     SUBMIT
  -------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      await createYakap({
        fullname: form.fullname,
        address: form.address || undefined,
        brgy_id: form.brgy_id,
        user_id: form.user_id,
      });

      setSuccess("Yakap saved");

      // Clear all EXCEPT user_id
      setForm((prev) => ({
        fullname: "",
        address: "",
        brgy_id: prev.brgy_id,
        user_id: prev.user_id,
      }));

      await reloadYakaps();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save Yakap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="container mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Yakap Registry</h1>
          <p className="text-sm text-muted-foreground">
            Manual encoding • Today only • Per user
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* FORM */}
          <Card className="w-full md:w-2/5">
            <CardHeader>
              <CardTitle>New Yakap</CardTitle>
              <CardDescription>Encode a new Yakap record</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Fullname</Label>
                  <Input
                    value={form.fullname}
                    onChange={handleChange("fullname")}
                  />
                </div>

                {/* <div>
                  <Label>Address</Label>
                  <textarea
                    value={form.address ?? ""}
                    onChange={handleChange("address")}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div> */}

                <div>
                  <Label>Barangay</Label>
                  <select
                    value={form.brgy_id}
                    onChange={handleChange("brgy_id")}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Select barangay…</option>
                    {BRGIES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* USER FIELD */}
                <div>
                  <Label>User</Label>
                  <Input
                    placeholder="Encoder / User ID"
                    value={form.user_id}
                    onChange={handleChange("user_id")}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && (
                  <p className="text-sm text-emerald-500">{success}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Yakap"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TABLE */}
          <Card className="w-full md:flex-1">
            <CardHeader>
              <CardTitle>Yakap List</CardTitle>
              <CardDescription>
                Today&apos;s records for selected user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-105 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fullname</TableHead>
                      {/* <TableHead>Address</TableHead> */}
                      <TableHead>Barangay</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredYakaps.length === 0 && !loadingTable ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredYakaps.map((y) => (
                        <TableRow key={y.yakap_id}>
                          <TableCell>{y.fullname}</TableCell>
                          {/* <TableCell>{y.address ?? "-"}</TableCell> */}
                          <TableCell>{y.brgy_id}</TableCell>
                          <TableCell>{y.user_id}</TableCell>
                          <TableCell>
                            {new Date(y.createdAt).toLocaleString()}
                          </TableCell>
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
    </div>
  );
};

export default YakapEncode;
