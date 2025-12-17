"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/yakapClient";
import type { LoginRequest } from "@/lib/yakapSchemas";
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

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange =
    (field: keyof LoginRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    try {
      setLoading(true);

      const user = await loginUser(form);
      setInfo(`Welcome ${user.name || user.username} (${user.role})`);

      // 🔁 redirect after successful login
      // Try SPA navigation first
      router.push("/yakap");
      router.refresh();

      // Hard fallback in case router.push is being weird
      if (typeof window !== "undefined") {
        window.location.href = "/yakap";
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Yakap Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the Yakap registry.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={form.username}
                onChange={handleChange("username")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange("password")}
              />
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by Prisma + Zod + shadcn/ui
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
