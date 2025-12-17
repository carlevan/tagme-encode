// app/yakap/page.tsx (or wherever your Yakap page lives)
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  createYakap,
  getYakaps,
  getCurrentUser,
  getBrgies,
} from "@/lib/yakapClient";
import type {
  YakapRow,
  CreateYakapRequest,
  LoginUser,
  BrgyRow,
} from "@/lib/yakapSchemas";
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

const YakapEncode: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateYakapRequest>({
    fullname: "",
    address: "",
    brgy_id: "",
  });

  const [brgies, setBrgies] = useState<BrgyRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [yakaps, setYakaps] = useState<YakapRow[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // load current user + brgy list on mount
  useEffect(() => {
    const init = async () => {
      try {
        setAuthLoading(true);
        const user = await getCurrentUser();
        setCurrentUser(user);

        const brgyData = await getBrgies();
        setBrgies(brgyData);

        await loadYakaps();
      } catch (err: any) {
        console.error(err);
        setAuthError(err.message || "Not authenticated");
      } finally {
        setAuthLoading(false);
      }
    };

    const loadYakaps = async () => {
      setTableError(null);
      setLoadingTable(true);
      try {
        const data = await getYakaps(); // already filtered server-side
        setYakaps(data);
      } catch (err: any) {
        console.error(err);
        setTableError(err.message || "Failed to load Yakap list");
      } finally {
        setLoadingTable(false);
      }
    };

    init().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // separate so we can call again after create
  const reloadYakaps = async () => {
    setTableError(null);
    setLoadingTable(true);
    try {
      const data = await getYakaps();
      setYakaps(data);
    } catch (err: any) {
      console.error(err);
      setTableError(err.message || "Failed to load Yakap list");
    } finally {
      setLoadingTable(false);
    }
  };

  const handleChange =
    (field: keyof CreateYakapRequest) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const payload: CreateYakapRequest = {
        fullname: form.fullname,
        address: form.address || undefined,
        brgy_id: form.brgy_id,
        // user_id is NOT sent; derived from cookie on server
      };

      await createYakap(payload);

      setSuccess("Yakap saved");
      setForm({
        fullname: "",
        address: "",
        brgy_id: "",
      });

      await reloadYakaps();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save Yakap");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (authError || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-500">
          {authError || "You must log in to access this page."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="container mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Yakap Registry
          </h1>
          <p className="text-sm text-muted-foreground">
            Logged in as{" "}
            <span className="font-medium">
              {currentUser.name || currentUser.username} ({currentUser.role})
            </span>
            . Showing today&apos;s entries encoded by you.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Form card */}
          <Card className="w-full md:w-2/5 border border-border/60">
            <CardHeader>
              <CardTitle>New Yakap</CardTitle>
              <CardDescription>
                Fill in the details and save a new entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="fullname">Fullname</Label>
                  <Input
                    id="fullname"
                    value={form.fullname}
                    onChange={handleChange("fullname")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    value={form.address ?? ""}
                    onChange={handleChange("address")}
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="brgy_id">Barangay</Label>
                  <select
                    id="brgy_id"
                    value={form.brgy_id}
                    onChange={handleChange("brgy_id")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select barangay…</option>
                    {brgies.map((b) => (
                      <option key={b.brgy_id} value={b.brgy_id}>
                        {b.brgy_name}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && (
                  <p className="text-sm text-emerald-500">{success}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Yakap"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Table card */}
          <Card className="w-full md:flex-1 border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Yakap List</CardTitle>
                <CardDescription>
                  Today&apos;s Yakap records encoded by you.
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground">
                {loadingTable ? "Loading..." : `Rows: ${yakaps.length}`}
              </span>
            </CardHeader>
            <CardContent>
              {tableError && (
                <p className="text-sm text-red-500 mb-2">{tableError}</p>
              )}

              <ScrollArea className="h-105 w-full rounded-md border border-border/40 bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fullname</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Brgy</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Encoder</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yakaps.length === 0 && !loadingTable ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-sm text-muted-foreground"
                        >
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      yakaps.map((y) => (
                        <TableRow key={y.yakap_id}>
                          <TableCell>{y.fullname}</TableCell>
                          <TableCell>{y.address ?? "-"}</TableCell>
                          <TableCell>{y.brgy?.brgy_name ?? "-"}</TableCell>
                          <TableCell>{y.brgy?.city?.city_name ?? "-"}</TableCell>
                          <TableCell>
                            {y.brgy?.city?.province?.prov_name ?? "-"}
                          </TableCell>
                          <TableCell>
                            {y.user?.name || y.user?.username || "-"}
                          </TableCell>
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
