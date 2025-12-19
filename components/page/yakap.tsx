"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createYakap, getYakaps, updateYakap } from "@/lib/yakapClient";
import type { YakapRow, CreateYakapRequest } from "@/lib/yakapSchemas";

import {
  Card,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* -----------------------------
   STATIC BARANGAY LIST
-------------------------------- */
const BRGIES = [
  "BARANGAY 1","BARANGAY 2","BARANGAY 3","BARANGAY 4","BARANGAY 5",
  "BARANGAY 6","BARANGAY 7","BARANGAY 8","BARANGAY 9","BARANGAY 10",
  "BARANGAY 11","BARRA","BOCOHAN","COTTA","DALAHICAN","DOMOIT",
  "GULANG-GULANG","IBABANG DUPAY","IBABANG IYAM","IBABANG TALIM",
  "ILAYANG DUPAY","ILAYANG IYAM","ILAYANG TALIM","ISABANG",
  "MARKETVIEW","MAYAO CROSSING","MAYAO CASTILLO","MAYAO KANLURAN",
  "MAYAO PARADA","MAYAO SILANGAN","RANSOHAN","SALINAS","TALAO-TALAO",
];

/* -----------------------------
   DATE HELPER
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

  /* -----------------------------
     EDIT MODAL STATE
  -------------------------------- */
  const [editing, setEditing] = useState<YakapRow | null>(null);
  const [editFullname, setEditFullname] = useState("");
  const [editBrgy, setEditBrgy] = useState("");

  /* -----------------------------
     LOAD DATA
  -------------------------------- */
  useEffect(() => {
    reloadYakaps();
  }, []);

  const reloadYakaps = async () => {
    try {
      const data = await getYakaps();
      setYakaps(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* -----------------------------
     FILTER BY TODAY + USER
  -------------------------------- */
  const filteredYakaps = React.useMemo(() => {
    if (!form.user_id) return [];
    return yakaps
      .filter((y) => y.user_id === form.user_id && isToday(y.createdAt))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [yakaps, form.user_id]);

  /* -----------------------------
     FORM CHANGE
  -------------------------------- */
  const handleChange =
    (field: keyof CreateYakapRequest) =>
    (e: React.ChangeEvent<any>) => {
      let value = e.target.value;
      if (field === "fullname" || field === "user_id") {
        value = value.toUpperCase();
      }
      setForm((p) => ({ ...p, [field]: value }));
    };

  /* -----------------------------
     CREATE NEW
  -------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullname || !form.brgy_id || !form.user_id) return;

    setLoading(true);
    try {
      await createYakap(form);
      setForm((p) => ({ ...p, fullname: "" }));
      await reloadYakaps();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     OPEN EDIT MODAL
     (Pass the full Yakap object including yakap_id)
  -------------------------------- */
  const openEdit = (y: YakapRow) => {
    setEditing(y);
    setEditFullname(y.fullname);
    setEditBrgy(y.brgy_id);
  };

  /* -----------------------------
     SAVE EDIT
     (Use yakap_id from editing object)
  -------------------------------- */
  const saveEdit = async () => {
    if (!editing?.yakap_id) return;

    try {
      await updateYakap(editing.yakap_id, {
        fullname: editFullname,
        brgy_id: editBrgy,
      });
      setEditing(null);
      await reloadYakaps();
    } catch (err) {
      console.error("Failed to update Yakap:", err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Yakap Registry</h1>

        <div className="flex gap-6">
          {/* FORM */}
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>New Yakap</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Fullname"
                  value={form.fullname}
                  onChange={handleChange("fullname")}
                />

                <select
                  value={form.brgy_id}
                  onChange={handleChange("brgy_id")}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select barangay</option>
                  {BRGIES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="User"
                  value={form.user_id}
                  onChange={handleChange("user_id")}
                />

                <Button className="w-full" disabled={loading}>
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TABLE */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Today's Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-105 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fullname</TableHead>
                      <TableHead>Barangay</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredYakaps.map((y) => (
                      <TableRow key={y.yakap_id}>
                        <TableCell>{y.fullname}</TableCell>
                        <TableCell>{y.brgy_id}</TableCell>
                        <TableCell>{y.user_id}</TableCell>
                        <TableCell>
                          {new Date(y.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(y)}
                          >
                            Edit
                          </Button>
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

      {/* EDIT MODAL */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Yakap</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fullname</Label>
              <Input
                value={editFullname}
                onChange={(e) =>
                  setEditFullname(e.target.value.toUpperCase())
                }
              />
            </div>

            <div>
              <Label>Barangay</Label>
              <select
                value={editBrgy}
                onChange={(e) => setEditBrgy(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                {BRGIES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={saveEdit} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YakapEncode;
