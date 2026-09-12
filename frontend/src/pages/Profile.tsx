import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { Button, Card } from "@heroui/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../hooks/useAuth";
import { changePassword } from "../services/user";
import { adminNavigation, userNavigation } from "../utils/navigation";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("New password must be at most 72 UTF-8 bytes.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await changePassword(currentPassword, newPassword);
      const wasFirstLogin = user?.is_first_login;
      await refreshUser();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
      if (wasFirstLogin) navigate(user?.role === "admin" ? "/admin" : "/home", { replace: true });
    } catch (error) {
      const detail = isAxiosError(error) ? error.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Unable to change your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600";
  return <>
    <Navbar links={user?.is_first_login ? [] : user?.role === "admin" ? adminNavigation : userNavigation} />
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
          <p className="mt-2 text-slate-600">View your account details and update your password.</p>
        </header>
        {user?.is_first_login && <div role="alert" className="rounded-xl bg-amber-50 p-5 text-amber-900">
          You are using a default password. Change it before continuing to the quiz system.
        </div>}
        <Card><Card.Content className="space-y-4 p-6">
          <div><p className="text-sm text-slate-500">Name</p><p className="font-semibold">{user?.name}</p></div>
          <div><p className="text-sm text-slate-500">Email</p><p className="break-all font-semibold">{user?.email}</p></div>
        </Card.Content></Card>
        <Card><Card.Content className="p-6">
          <h2 className="mb-5 text-2xl font-bold">Change Password</h2>
          <form onSubmit={handleSubmit}><fieldset disabled={saving} className="space-y-5">
            <label className="block">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} /></label>
            <label className="block">New password<input required type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} /></label>
            <label className="block">Confirm new password<input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} /></label>
            {error && <p role="alert" className="text-red-700">{error}</p>}
            <Button type="submit" isDisabled={saving} className="bg-blue-600 text-white">{saving ? "Changing password..." : "Change password"}</Button>
          </fieldset></form>
        </Card.Content></Card>
      </div>
    </main>
  </>;
}
