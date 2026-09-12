import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card } from "@heroui/react";
import toast from "react-hot-toast";
import api from "../../services/api";
import AdminPage, { DataState } from "./AdminPage";
import { errorMessage, useAdminData } from "./adminData";
import type { AdminUser } from "./adminData";

export default function Users() {
  const request = useAdminData<AdminUser[]>("users");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const submitting = useRef(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [accessUpdatingId, setAccessUpdatingId] = useState<string | null>(null);
  const busy = saving || deletingId !== null || accessUpdatingId !== null;

  async function updateAccess(
    user: AdminUser,
    field: "can_take_test" | "can_retake_test",
    value: boolean
  ) {
    if (submitting.current) return;
    submitting.current = true;
    setAccessUpdatingId(user.id);
    try {
      const access = {
        can_take_test: field === "can_take_test" ? value : user.can_take_test,
        can_retake_test: field === "can_retake_test" ? value : user.can_retake_test,
      };
      await api.patch(`/admin/users/${user.id}/access`, access);
      request.setData((items) => (items ?? []).map((item) =>
        item.id === user.id ? { ...item, ...access } : item
      ));
      toast.success("Test access updated.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      submitting.current = false;
      setAccessUpdatingId(null);
    }
  }

  async function removeUser(id: string) {
    if (submitting.current) return;
    submitting.current = true;
    setDeletingId(id);
    setDeleteError("");
    try {
      await api.delete(`/admin/users/${id}`);
      request.setData((items) => (items ?? []).filter((user) => user.id !== id));
      setPendingDelete(null);
      toast.success("User removed successfully.");
    } catch (error) {
      setDeleteError(errorMessage(error));
    } finally {
      submitting.current = false;
      setDeletingId(null);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setFormError("Default password must contain at least 8 characters.");
      return;
    }
    // bcrypt, used by registration, accepts at most 72 password bytes.
    if (new TextEncoder().encode(password).length > 72) {
      setFormError("Password is too long. Please use a shorter password (maximum 72 UTF-8 bytes).");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setFormError("");
    try {
      const { data: createdUser } = await api.post<AdminUser>("/admin/users", {
        name: name.trim(), email: email.trim(), password,
      });
      setName("");
      setEmail("");
      setPassword("");
      setSearch("");
      toast.success("User created successfully.");
      request.setData((items) => [...(items ?? []), createdUser]);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  const users = (request.data ?? []).filter((user) =>
    `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <AdminPage title="Users" description="Create user accounts and view registered users and administrators.">
    <Card><Card.Content className="p-6">
      <h2 className="text-2xl font-bold">Create User</h2>
      <p className="mb-5 mt-2 text-slate-600">New accounts must change their default password. Test and retake access start disabled.</p>
      <form onSubmit={createUser}>
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="new-user-name" className="mb-2 block font-medium">Name</label>
              <input id="new-user-name" required autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600" />
            </div>
            <div>
              <label htmlFor="new-user-email" className="mb-2 block font-medium">Email</label>
              <input id="new-user-email" type="email" required autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600" />
            </div>
            <div>
              <label htmlFor="new-user-password" className="mb-2 block font-medium">Password</label>
              <input id="new-user-password" type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600" />
            </div>
          </div>
          {formError && <p role="alert" className="text-red-700">{formError}</p>}
          <Button type="submit" isDisabled={busy} className="bg-blue-600 text-white">{saving ? "Creating user..." : "Create user"}</Button>
        </fieldset>
      </form>
    </Card.Content></Card>
    <div>
      <label htmlFor="user-search" className="mb-2 block font-medium">Search users</label>
      <input id="user-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or role" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:max-w-md" />
    </div>
    <DataState {...request}>
      <Card><Card.Content className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="p-4 text-left text-slate-600">{users.length} users</caption>
          <thead><tr className="border-b"><th scope="col" className="p-4">Name</th><th scope="col" className="p-4">Email</th><th scope="col" className="p-4">Role</th><th scope="col" className="p-4">Test Access</th><th scope="col" className="p-4">Password Status</th><th scope="col" className="p-4">Actions</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-b last:border-none">
            <td className="p-4">{user.name}</td><td className="p-4">{user.email}</td><td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">{user.role}</span></td>
            <td className="min-w-52 p-4">
              {user.role === "admin" ? <span className="text-sm text-slate-500">Not applicable</span> : <fieldset disabled={busy} className="space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={user.can_take_test} onChange={(event) => updateAccess(user, "can_take_test", event.target.checked)} /> Initial test</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={user.can_retake_test} onChange={(event) => updateAccess(user, "can_retake_test", event.target.checked)} /> Retakes</label>
                {accessUpdatingId === user.id && <span role="status" className="text-sm text-slate-500">Saving...</span>}
              </fieldset>}
            </td>
            <td className="p-4">{user.is_first_login ? <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800">Change required</span> : <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-800">Completed</span>}</td>
            <td className="p-4">
              {user.role === "admin" ? <span className="text-sm text-slate-500">Protected account</span> : pendingDelete === user.id ? (
                <div role="group" aria-label={`Confirm removal of ${user.email}`} className="min-w-64 space-y-3 rounded-xl bg-red-50 p-4">
                  <p>Remove {user.name} ({user.email})? This cannot be undone. Existing quiz results will be kept.</p>
                  {deleteError && <p role="alert" className="text-red-700">{deleteError}</p>}
                  <div className="flex gap-3">
                    <Button isDisabled={busy || request.loading} onPress={() => removeUser(user.id)} className="bg-red-600 text-white">{deletingId === user.id ? "Removing..." : "Confirm remove"}</Button>
                    <Button isDisabled={busy} onPress={() => { setPendingDelete(null); setDeleteError(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : <Button isDisabled={busy || request.loading} aria-label={`Remove ${user.email}`} onPress={() => { setPendingDelete(user.id); setDeleteError(""); }} className="text-red-600">Remove</Button>}
            </td>
          </tr>)}
          {users.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{request.data?.length ? "No users match your search." : "No users registered yet."}</td></tr>}</tbody>
        </table>
      </Card.Content></Card>
    </DataState>
  </AdminPage>;
}
