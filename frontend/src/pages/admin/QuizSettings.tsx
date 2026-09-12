import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card } from "@heroui/react";
import toast from "react-hot-toast";
import api from "../../services/api";
import labels from "../../config/labels.json";
import type { QuizConfig } from "../../types/quiz";
import { useAdminData, errorMessage } from "./adminData";
import { DataState } from "./AdminPage";

export default function QuizSettings({ onSaved }: { onSaved: (config: QuizConfig) => void }) {
  const request = useAdminData<QuizConfig>("quiz-config");
  return <DataState {...request}>{request.data && <SettingsForm initial={request.data} onSaved={onSaved} />}</DataState>;
}

function SettingsForm({ initial, onSaved }: { initial: QuizConfig; onSaved: (config: QuizConfig) => void }) {
  const [name, setName] = useState(initial.quiz_name);
  const [duration, setDuration] = useState(initial.duration_seconds?.toString() ?? "");
  const [subjects, setSubjects] = useState(initial.subjects);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const trimmed = subjects.map((subject) => ({ name: subject.name.trim() }));
    if (!name.trim() || !trimmed.length || trimmed.some((subject) => !subject.name)) { setError(labels.app.admin.quizSettings.required); return; }
    if (new Set(trimmed.map((subject) => subject.name.toLowerCase())).size !== trimmed.length) { setError(labels.app.admin.quizSettings.unique); return; }
    busy.current = true;
    setSaving(true); setError("");
    try {
      const { data } = await api.put<QuizConfig>("/admin/quiz-config", { quiz_name: name.trim(), duration_seconds: duration === "" ? null : Number(duration), subjects: trimmed });
      setSubjects(data.subjects);
      onSaved(data);
      toast.success(labels.app.admin.quizSettings.saved);
    } catch (error) { setError(errorMessage(error)); }
    finally { busy.current = false; setSaving(false); }
  }
  const input = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3";
  return <Card><Card.Content className="space-y-4 p-6">
    <h2 className="text-2xl font-bold">{labels.app.admin.quizSettings.title}</h2>
    <p className="text-slate-600">{labels.app.admin.quizSettings.description}</p>
    <form onSubmit={save}><fieldset disabled={saving} className="space-y-4">
      <label className="block">{labels.app.admin.quizSettings.quizName}<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={input} /></label>
      <label className="block">{labels.app.admin.quizSettings.duration}<input type="number" min={1} max={86400} step={1} value={duration} onChange={(event) => setDuration(event.target.value)} className={input} placeholder={labels.app.admin.quizSettings.durationPlaceholder} /></label>
      <p className="text-sm text-slate-500">{labels.app.admin.quizSettings.durationHelp}</p>
      <div className="space-y-3">
        <h3 className="font-semibold">{labels.app.admin.quizSettings.subjects}</h3>
        {subjects.length === 0 && <p className="text-sm text-slate-500">{labels.app.admin.quizSettings.empty}</p>}
        {subjects.map((subject, index) => <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
          <label className="min-w-48 flex-1">{labels.app.admin.quizSettings.subjectName}<input required maxLength={100} value={subject.name} onChange={(event) => setSubjects((items) => items.map((item, position) => position === index ? { ...item, name: event.target.value } : item))} className={input} /></label>
          <Button type="button" isDisabled={saving} aria-label={labels.app.admin.quizSettings.removeSubject.replace("{number}", String(index + 1))} onPress={() => setSubjects((items) => items.filter((_, position) => position !== index))}>{labels.app.buttons.remove}</Button>
        </div>)}
        <Button type="button" isDisabled={saving || subjects.length >= 4} onPress={() => setSubjects((items) => [...items, { name: "" }])}>{labels.app.admin.quizSettings.addSubject}</Button>
        <p className="text-sm text-slate-500">{labels.app.admin.quizSettings.subjectHelp}</p>
      </div>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <Button type="submit" isDisabled={saving} className="bg-blue-600 text-white">{saving ? labels.app.admin.quizSettings.saving : labels.app.admin.quizSettings.save}</Button>
    </fieldset></form>
  </Card.Content></Card>;
}
