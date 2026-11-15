import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { Bot, Eraser, MessageSquare, Timer, User, Users } from "lucide-react";
import { bestTimeOf, finalTimeOf, normalizeTime, rank, type Team } from "@/lib/scoring";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Fiche d'évaluation – Compétition Robotique" },
    { name: "description", content: "Saisie jury et classement automatique d'une compétition de robotique." },
    { property: "og:title", content: "Fiche d'évaluation – Compétition Robotique" },
    { property: "og:description", content: "Saisie jury et classement automatique." },
    { property: "og:type", content: "website" }, { property: "og:locale", content: "fr_FR" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

const KEY = "robot-teams";
const empty = { teamName: "", teamLeader: "", robotCode: "", t1: "", t2: "", t3: "", penalty: false, remarks: "" };
const input = "w-full rounded-lg border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring";
const btn = "flex-1 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const btn2 = "flex-1 rounded-lg border border-input px-4 py-3 text-base hover:bg-accent";

function Field({ icon, top, children }: { icon: ReactNode; top?: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <span className={`pointer-events-none absolute left-3 text-muted-foreground ${top ? "top-3.5" : "top-1/2 -translate-y-1/2"}`}>{icon}</span>
      {children}
    </div>
  );
}

function Index() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [step, setStep] = useState(1);
  const [f, setF] = useState(empty);
  const pad = useRef<SignaturePadHandle>(null);
  const [sigEmpty, setSigEmpty] = useState(true);
  useEffect(() => { try { setTeams(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const save = (t: Team[]) => { setTeams(t); localStorage.setItem(KEY, JSON.stringify(t)); };
  const set = (k: keyof typeof empty) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = () => {
    if (!pad.current || pad.current.isEmpty()) return;
    const times = [f.t1, f.t2, f.t3];
    const bestTime = bestTimeOf(times);
    save([...teams, { id: crypto.randomUUID(), teamName: f.teamName, teamLeader: f.teamLeader, robotCode: f.robotCode,
      times: times.map(normalizeTime), bestTime, penalty: f.penalty, finalTime: finalTimeOf(bestTime, f.penalty), remarks: f.remarks, signature: pad.current?.toDataURL() }]);
    setF(empty); setStep(1);
  };
  const sorted = rank(teams);
  const exportCsv = () => {
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Rank","Team Name","Team Leader","Robot Code","First Time","Second Time","Third Time","Best Time","Penalty","Final Time","Top 8","Remarks"],
      ...sorted.map((t, i) => [i + 1, t.teamName, t.teamLeader, t.robotCode, t.times[0].toFixed(2), t.times[1].toFixed(2), t.times[2].toFixed(2), t.bestTime.toFixed(2), t.penalty ? "Oui" : "Non", t.finalTime.toFixed(2), i < 8 ? "✓" : "", t.remarks])];
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.map(esc).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "classement.csv"; a.click();
  };
  const reset = () => { if (confirm("Vider tout le classement ?")) { localStorage.removeItem(KEY); setTeams([]); } };

  const steps = ["Infos", "Temps", "Pénalité", "Signature"];
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4 pb-10 lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0 lg:p-8">
      <h1 className="text-xl font-bold leading-tight lg:col-span-2 lg:text-2xl">🤖 Fiche d'évaluation<span className="block text-sm font-normal text-muted-foreground">Compétition Robotique</span></h1>
      <section className="rounded-xl border bg-card p-4 shadow-sm lg:sticky lg:top-6">
        <ol className="mb-4 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="text-center text-xs">
              <div className={`mb-1 h-1.5 rounded-full ${step > i ? "bg-primary" : "bg-muted"}`} />
              <span className={step === i + 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>{i + 1}. {s}</span>
            </li>))}
        </ol>
        {step === 1 && <div className="space-y-3">
          <Field icon={<Users size={18} />}><input className={`${input} pl-10`} placeholder="Team name" value={f.teamName} onChange={set("teamName")} /></Field>
          <Field icon={<User size={18} />}><input className={`${input} pl-10`} placeholder="Team leader" value={f.teamLeader} onChange={set("teamLeader")} /></Field>
          <Field icon={<Bot size={18} />}><input className={`${input} pl-10`} placeholder="Robot code" value={f.robotCode} onChange={set("robotCode")} /></Field>
          <div className="flex"><button className={btn} disabled={!f.teamName.trim()} onClick={() => setStep(2)}>Suivant</button></div>
        </div>}
        {step === 2 && <div className="space-y-3">
          {(["t1","t2","t3"] as const).map((k, i) => (
            <label key={k} className="block text-sm font-medium">{["First","Second","Third"][i]} time (s)
              <div className="mt-1"><Field icon={<Timer size={18} />}><input type="number" inputMode="decimal" step="0.01" min="0" className={`${input} pl-10`} placeholder="vide = 180" value={f[k]} onChange={set(k)} /></Field></div></label>))}
          <div className="flex gap-2"><button className={btn2} onClick={() => setStep(1)}>Retour</button><button className={btn} onClick={() => setStep(3)}>Suivant</button></div>
        </div>}
        {step === 3 && <div className="space-y-3">
          <label className="flex items-center gap-3 rounded-lg border border-input p-3 text-base"><input type="checkbox" className="h-5 w-5" checked={f.penalty} onChange={set("penalty")} /> Penalty 20%</label>
          <Field top icon={<MessageSquare size={18} />}><textarea className={`${input} pl-10`} rows={3} placeholder="Remarks" value={f.remarks} onChange={set("remarks")} /></Field>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Best</p><p className="font-semibold">{bestTimeOf([f.t1,f.t2,f.t3]).toFixed(2)}s</p></div>
            <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Final</p><p className="font-semibold">{finalTimeOf(bestTimeOf([f.t1,f.t2,f.t3]), f.penalty).toFixed(2)}s</p></div>
          </div>
          <div className="flex gap-2"><button className={btn2} onClick={() => setStep(2)}>Retour</button><button className={btn} onClick={() => setStep(4)}>Suivant</button></div>
        </div>}
        {step === 4 && <div className="space-y-3">
          <h3 className="text-base font-semibold">Validation du participant</h3>
          <p className="text-xs text-muted-foreground">Signature de {f.teamLeader || "chef d'équipe"} ({f.teamName})</p>
          <SignaturePad ref={pad} onChange={setSigEmpty} />
          <button className={`${btn2} flex w-full items-center justify-center gap-2`} onClick={() => pad.current?.clear()}><Eraser size={18} /> Effacer</button>
          <div className="flex gap-2"><button className={btn2} onClick={() => setStep(3)}>Retour</button><button className={btn} disabled={sigEmpty} onClick={submit}>Valider et Enregistrer</button></div>
        </div>}
      </section>
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Classement <span className="text-sm font-normal text-muted-foreground">({teams.length})</span></h2>
          <p className="text-xs text-muted-foreground">Surligné = Top 8</p>
          <div className="mt-3 flex gap-2"><button className={btn} onClick={exportCsv} disabled={!teams.length}>Exporter CSV</button><button className={btn2} onClick={reset}>Réinitialiser</button></div>
        </div>
        {!teams.length && <p className="p-4 text-center text-sm text-muted-foreground">Aucune équipe enregistrée.</p>}
        <ul className="space-y-2 md:hidden">
          {sorted.map((t, i) => (
            <li key={t.id} className={`rounded-lg border p-3 ${i < 8 ? "bg-secondary/60" : ""} ${i === 7 && sorted.length > 8 ? "border-b-4 border-b-primary" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.teamName}</p>
                  <p className="text-xs text-muted-foreground">{t.robotCode || "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold">{t.finalTime.toFixed(2)}s</p>
                  {i === 0 && <span className="whitespace-nowrap rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">🏆 Gagnant</span>}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>T1 : {t.times[0].toFixed(2)}s</span><span>T2 : {t.times[1].toFixed(2)}s</span><span>T3 : {t.times[2].toFixed(2)}s</span>
                <span>Best : {t.bestTime.toFixed(2)}s</span><span>Pénalité : {t.penalty ? "Oui" : "Non"}</span>
                {i < 8 && <span className="font-semibold text-primary">✓ Top 8</span>}
              </div>
              {t.remarks && <p className="mt-1 text-xs italic text-muted-foreground">{t.remarks}</p>}
              {t.signature && <img src={t.signature} alt={`Signature ${t.teamName}`} className="mt-2 h-10 rounded border bg-card" />}
            </li>))}
        </ul>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm">
          <thead><tr className="border-b text-left">{["Rank","Team Name","Robot Code","First Time","Second Time","Third Time","Best Time","Penalty","Final Time","Top 8","Remarks","Signature"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>{sorted.map((t, i) => (
            <tr key={t.id} className={`border-b last:border-0 ${i < 8 ? "bg-secondary/60" : ""} ${i === 7 && sorted.length > 8 ? "border-b-2 border-b-primary" : ""}`}>
              <td className="p-2 font-medium">{i + 1}</td>
              <td className="p-2">{t.teamName} {i === 0 && <span className="ml-1 whitespace-nowrap rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">🏆 Gagnant</span>}</td>
              <td className="p-2">{t.robotCode}</td>
              <td className="p-2">{t.times[0].toFixed(2)}s</td><td className="p-2">{t.times[1].toFixed(2)}s</td><td className="p-2">{t.times[2].toFixed(2)}s</td>
              <td className="p-2">{t.bestTime.toFixed(2)}s</td>
              <td className="p-2">{t.penalty ? "Oui" : "Non"}</td><td className="p-2 font-semibold">{t.finalTime.toFixed(2)}s</td>
              <td className="p-2 font-semibold text-primary">{i < 8 ? "✓" : ""}</td><td className="p-2 text-muted-foreground">{t.remarks}</td>
              <td className="p-2">{t.signature ? <img src={t.signature} alt={`Signature ${t.teamName}`} className="h-8 w-20 rounded border bg-card object-contain" /> : <span className="text-muted-foreground">—</span>}</td>
            </tr>))}
          </tbody></table></div>
      </section>
    </main>
  );
}
