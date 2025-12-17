"use client";

import * as React from "react";
import { useState } from "react";
import { registerUser } from "@/lib/yakapClient";
import type { RegisterRequest } from "@/lib/yakapSchemas";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

const RegisterUser: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    password: "",
    name: "",
    role: "ENCODER",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleChange =
    (field: keyof RegisterRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleRoleChange = (value: "ENCODER" | "ADMIN") => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!form.role) {
      setError("Role is required");
      return;
    }

    try {
      setLoading(true);

      const payload: RegisterRequest = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role, // guaranteed ENCODER/ADMIN
      };

      const user = await registerUser(payload);
      setInfo(`User ${user.username} (${user.role}) created successfully`);

      // clear password only
      setForm({
        username: "",
        password: "",
        name: "",
        role: "ENCODER",
  });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create a Yakap user account. Password will be securely hashed on the server.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={handleChange("username")}
                autoComplete="username"
              />
            </div>

            {/* Name (optional) */}
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>

            {/* Role (required) */}
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) =>
                  handleRoleChange(val as "ENCODER" | "ADMIN")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENCODER">ENCODER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password with eye icon */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
            {info && (
              <p className="text-sm text-emerald-500 mt-1">{info}</p>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            Already have an account? Go to /login.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterUser;
