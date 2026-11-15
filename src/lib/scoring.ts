export const DNF = 180;
export type Team = { id: string; teamName: string; teamLeader: string; robotCode: string; times: [number, number, number]; bestTime: number; penalty: boolean; finalTime: number; remarks: string; signature?: string };
export const normalizeTime = (v: string | number) => { const n = Number(v); return !n || n <= 0 || isNaN(n) ? DNF : n; };
export const bestTimeOf = (t: (string | number)[]) => Math.min(...t.map(normalizeTime));
export const finalTimeOf = (best: number, penalty: boolean) => (penalty ? best * 1.2 : best);
export const rank = (teams: Team[]) => [...teams].sort((a, b) => a.finalTime - b.finalTime);
/** Nettoie une saisie de temps en secondes : chiffres et un seul point, 2 décimales max ("40.2" reste "40.2"). */
export const formatTimeInput = (raw: string) => {
  const clean = raw.replace(",", ".").replace(/[^\d.]/g, "");
  const [s = "", ...rest] = clean.split(".");
  const sec = s.slice(0, 3);
  return rest.length ? `${sec}.${rest.join("").slice(0, 2)}` : sec;
};
/** Complète à 2 décimales à la sortie du champ : "80.6" → "80.60", "80" → "80.00". */
export const padTime = (v: string) => {
  const n = Number(v);
  return v.trim() && !isNaN(n) && n > 0 ? n.toFixed(2) : v;
};
