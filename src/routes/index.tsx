import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bestTimeOf, finalTimeOf, normalizeTime, rank, type Team } from "@/lib/scoring";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Fiche d'évaluation – Compétition Robotique" },
    { name: "description", content: "Saisie jury et classement automatique d'une compétition de robotique." },
    { property: "og:title", content: "Fiche d'évaluation – Compétition Robotique" },
    { property: "og:description", content: "Saisie jury et classement automatique." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

const KEY = "robot-teams";
const empty = { teamName: "", teamLeader: "", robotCode: "", t1: "", t2: "", t3: "", penalty: false, remarks: "" };
const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const btn = "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const btn2 = "rounded-md border border-input px-4 py-2 text-sm hover:bg-accent";

function Index() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [step, setStep] = useState(1);
  const [f, setF] = useState(empty);
  useEffect(() => { try { setTeams(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const save = (t: Team[]) => { setTeams(t); localStorage.setItem(KEY, JSON.stringify(t)); };
  const set = (k: keyof typeof empty) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = () => {
    const times = [f.t1, f.t2, f.t3];
    const bestTime = bestTimeOf(times);
    save([...teams, { id: crypto.randomUUID(), teamName: f.teamName, teamLeader: f.teamLeader, robotCode: f.robotCode,
      times: times.map(normalizeTime), bestTime, penalty: f.penalty, finalTime: finalTimeOf(bestTime, f.penalty), remarks: f.remarks }]);
    setF(empty); setStep(1);
  };
  const sorted = rank(teams);
  const exportCsv = () => {
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Rank","Team Name","Team Leader","Robot Code","Best Time","Penalty","Final Time","Top 8","Remarks"],
      ...sorted.map((t, i) => [i + 1, t.teamName, t.teamLeader, t.robotCode, t.bestTime.toFixed(2), t.penalty ? "Oui" : "Non", t.finalTime.toFixed(2), i < 8 ? "✓" : "", t.remarks])];
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.map(esc).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "classement.csv"; a.click();
  };
  const reset = () => { if (confirm("Vider tout le classement ?")) { localStorage.removeItem(KEY); setTeams([]); } };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">🤖 Fiche d'évaluation – Compétition Robotique</h1>
      <section className="max-w-xl rounded-lg border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm text-muted-foreground">Étape {step} / 3</p>
        {step === 1 && <div className="space-y-3">
          <input className={input} placeholder="Team name" value={f.teamName} onChange={set("teamName")} />
          <input className={input} placeholder="Team leader" value={f.teamLeader} onChange={set("teamLeader")} />
          <input className={input} placeholder="Robot code" value={f.robotCode} onChange={set("robotCode")} />
          <button className={btn} disabled={!f.teamName.trim()} onClick={() => setStep(2)}>Suivant</button>
        </div>}
        {step === 2 && <div className="space-y-3">
          {(["t1","t2","t3"] as const).map((k, i) => (
            <label key={k} className="block text-sm">{["First","Second","Third"][i]} time (s)
              <input type="number" step="0.01" min="0" className={input} placeholder="vide = 180" value={f[k]} onChange={set(k)} /></label>))}
          <div className="flex gap-2"><button className={btn2} onClick={() => setStep(1)}>Retour</button><button className={btn} onClick={() => setStep(3)}>Suivant</button></div>
        </div>}
        {step === 3 && <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.penalty} onChange={set("penalty")} /> Penalty 20%</label>
          <textarea className={input} placeholder="Remarks" value={f.remarks} onChange={set("remarks")} />
          <p className="text-sm text-muted-foreground">Best : {bestTimeOf([f.t1,f.t2,f.t3]).toFixed(2)}s → Final : {finalTimeOf(bestTimeOf([f.t1,f.t2,f.t3]), f.penalty).toFixed(2)}s</p>
          <div className="flex gap-2"><button className={btn2} onClick={() => setStep(2)}>Retour</button><button className={btn} onClick={submit}>Enregistrer l'équipe</button></div>
        </div>}
      </section>
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-lg font-semibold">Classement</h2><p className="text-xs text-muted-foreground">Lignes surlignées = Top 8</p></div>
          <div className="flex gap-2"><button className={btn} onClick={exportCsv} disabled={!teams.length}>Exporter CSV</button><button className={btn2} onClick={reset}>Réinitialiser</button></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b text-left">{["Rank","Team Name","Robot Code","Best Time","Penalty","Final Time","Top 8","Remarks"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>{sorted.map((t, i) => (
            <tr key={t.id} className={`border-b last:border-0 ${i < 8 ? "bg-secondary/60" : ""} ${i === 7 && sorted.length > 8 ? "border-b-2 border-b-primary" : ""}`}>
              <td className="p-2 font-medium whitespace-nowrap">{i + 1}{i < 8 && <span className="ml-1 text-xs text-primary">✓</span>}</td>
              <td className="p-2">{t.teamName} {i === 0 && <span className="ml-1 whitespace-nowrap rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">🏆 Gagnant</span>}</td>
              <td className="p-2">{t.robotCode}</td><td className="p-2">{t.bestTime.toFixed(2)}s</td>
              <td className="p-2">{t.penalty ? "Oui" : "Non"}</td><td className="p-2 font-semibold">{t.finalTime.toFixed(2)}s</td>
              <td className="p-2 font-semibold text-primary">{i < 8 ? "✓" : ""}</td><td className="p-2 text-muted-foreground">{t.remarks}</td>
            </tr>))}
            {!teams.length && <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Aucune équipe enregistrée.</td></tr>}
          </tbody></table></div>
      </section>
    </main>
  );
}
