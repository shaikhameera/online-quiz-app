import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card } from "@heroui/react";
import toast from "react-hot-toast";
import api from "../../services/api";
import QuizSettings from "./QuizSettings";
import type { QuizConfig } from "../../types/quiz";
import AdminPage, { DataState } from "./AdminPage";
import { errorMessage, useAdminData } from "./adminData";
import type { AdminQuestion } from "./adminData";

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600";

export default function Questions() {
  const request = useAdminData<AdminQuestion[]>("questions");
  const config = useAdminData<QuizConfig>("quiz-config");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const questionInput = useRef<HTMLTextAreaElement>(null);
  const mutationInFlight = useRef(false);
  const busy = saving || deletingId !== null;
  const questions = (request.data ?? []).filter((item) => item.question.toLowerCase().includes(search.trim().toLowerCase()));

  function resetForm() {
    setEditingId(null);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setFormError("");
  }

  function editQuestion(item: AdminQuestion) {
    setEditingId(item.id);
    setQuestion(item.question);
    setSubject(item.subject ?? "");
    setOptions([...item.options]);
    setCorrectIndex(item.options.indexOf(item.correct_answer));
    setFormError("");
    setPendingDelete(null);
    questionInput.current?.focus();
    questionInput.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationInFlight.current) return;
    const trimmedOptions = options.map((option) => option.trim());
    if (!question.trim() || trimmedOptions.length < 2 || trimmedOptions.some((option) => !option)) {
      setFormError("Enter a question and at least two non-empty options.");
      return;
    }
    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      setFormError("Each option must be different.");
      return;
    }
    if (!trimmedOptions[correctIndex]) {
      setFormError("Select the correct answer.");
      return;
    }
    const payload = { subject: subject || null, question: question.trim(), options: trimmedOptions, correct_answer: trimmedOptions[correctIndex] };
    mutationInFlight.current = true;
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/admin/questions/${editingId}`, payload);
        request.setData((items) => (items ?? []).map((item) => item.id === editingId ? { id: editingId, ...payload } : item));
      } else {
        const { data } = await api.post<{ id: string }>("/admin/questions", payload);
        request.setData((items) => [...(items ?? []), { id: data.id, ...payload }]);
      }
      toast.success(editingId ? "Question updated." : "Question added.");
      resetForm();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      mutationInFlight.current = false;
      setSaving(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    setDeletingId(id);
    try {
      await api.delete(`/admin/questions/${id}`);
      request.setData((items) => (items ?? []).filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setPendingDelete(null);
      toast.success("Question deleted.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      mutationInFlight.current = false;
      setDeletingId(null);
    }
  }

  return <AdminPage title="Questions" description="Manage the question bank used by the quiz. Choose one correct answer for each question.">
    <QuizSettings onSaved={(data) => config.setData(data)} />
    <DataState {...request}>
      <Card><Card.Content className="p-6">
        <h2 className="mb-5 text-2xl font-bold">{editingId ? "Edit Question" : "Add Question"}</h2>
        <form onSubmit={saveQuestion}>
          <fieldset disabled={busy} className="space-y-5">
            <div>
              <label htmlFor="question-subject" className="mb-2 block font-medium">Subject</label>
              <select id="question-subject" className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option value="">Unassigned (legacy quiz)</option>
                {subject && !config.data?.available_subjects.includes(subject) && <option value={subject}>{subject} (not in current batch)</option>}
                {config.data?.available_subjects.map((name) => <option key={name}>{name}</option>)}
              </select>
              {config.error && <p role="alert">{config.error} <button type="button" onClick={config.reload}>Retry subjects</button></p>}
            </div>
            <div>
              <label htmlFor="question-text" className="mb-2 block font-medium">Question</label>
              <textarea ref={questionInput} id="question-text" required rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} className={inputClass} />
            </div>
            <fieldset className="space-y-3">
              <legend className="mb-2 font-medium">Options and correct answer</legend>
              {options.map((option, index) => <div key={index} className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="correct-answer" checked={correctIndex === index} onChange={() => setCorrectIndex(index)} />
                  Correct {index + 1}
                </label>
                <div className="min-w-40 flex-1">
                  <label htmlFor={`option-${index}`} className="sr-only">Option {index + 1}</label>
                  <input id={`option-${index}`} required value={option} onChange={(event) => setOptions((items) => items.map((item, position) => position === index ? event.target.value : item))} className={inputClass} placeholder={`Option ${index + 1}`} />
                </div>
                <Button type="button" isDisabled={busy || options.length <= 2} aria-label={`Remove option ${index + 1}`} onPress={() => {
                  setOptions((items) => items.filter((_, position) => position !== index));
                  setCorrectIndex((current) => current === index ? -1 : current > index ? current - 1 : current);
                }}>Remove</Button>
              </div>)}
              <Button type="button" isDisabled={busy} onPress={() => setOptions((items) => [...items, ""])}>Add option</Button>
            </fieldset>
            {formError && <p role="alert" className="text-red-700">{formError}</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" isDisabled={busy} className="bg-blue-600 text-white">{saving ? "Saving..." : editingId ? "Save changes" : "Add question"}</Button>
              <Button type="button" isDisabled={busy} onPress={resetForm}>{editingId ? "Cancel editing" : "Clear form"}</Button>
            </div>
          </fieldset>
        </form>
      </Card.Content></Card>
      <section className="mt-8 space-y-5">
        <h2 className="text-2xl font-bold">Question Bank ({request.data?.length ?? 0})</h2>
        <div>
          <label htmlFor="question-search" className="mb-2 block font-medium">Search questions</label>
          <input id="question-search" value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass} placeholder="Search question text" />
        </div>
        {questions.length === 0 && <p className="py-8 text-center text-gray-500">{request.data?.length ? "No questions match your search." : "No questions yet. Add your first question above."}</p>}
        {questions.map((item) => <Card key={item.id}><Card.Content className="space-y-4 p-6">
          <p className="text-sm text-blue-600">{item.subject || "Unassigned"}</p>
          <h3 className="whitespace-pre-wrap break-words text-lg font-semibold">{item.question}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">{item.options.map((option, index) => <li key={index} className={`break-words rounded-lg p-3 ${option === item.correct_answer ? "bg-green-50 text-green-800" : "bg-slate-50"}`}>
            {option}{option === item.correct_answer && <span className="ml-2 text-sm font-semibold">(Correct)</span>}
          </li>)}</ul>
          <div className="flex gap-3">
            <Button isDisabled={busy} onPress={() => editQuestion(item)}>Edit</Button>
            <Button isDisabled={busy} onPress={() => setPendingDelete(item.id)} className="text-red-600">Delete</Button>
          </div>
          {pendingDelete === item.id && <div className="space-y-3 rounded-xl bg-red-50 p-4" role="group" aria-label="Confirm question deletion">
            <p>Delete this question from the quiz? This cannot be undone.</p>
            <div className="flex gap-3">
              <Button isDisabled={busy} className="bg-red-600 text-white" onPress={() => deleteQuestion(item.id)}>{deletingId === item.id ? "Deleting..." : "Confirm delete"}</Button>
              <Button isDisabled={busy} onPress={() => setPendingDelete(null)}>Cancel</Button>
            </div>
          </div>}
        </Card.Content></Card>)}
      </section>
    </DataState>
  </AdminPage>;
}
