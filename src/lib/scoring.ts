export const DNF = 180;
export type Team = { id: string; teamName: string; teamLeader: string; robotCode: string; times: [number, number, number]; bestTime: number; penalty: boolean; finalTime: number; remarks: string; signature?: string };
export const normalizeTime = (v: string | number) => { const n = Number(v); return !n || n <= 0 || isNaN(n) ? DNF : n; };
export const bestTimeOf = (t: (string | number)[]) => Math.min(...t.map(normalizeTime));
export const finalTimeOf = (best: number, penalty: boolean) => (penalty ? best * 1.2 : best);
export const rank = (teams: Team[]) => [...teams].sort((a, b) => a.finalTime - b.finalTime);
/** Formate une saisie en secondes.centisecondes : les chiffres tapés glissent vers la gauche ("12345" → "123.45"). */
export const formatTimeInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 5);
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  return `${Number(padded.slice(0, -2))}.${padded.slice(-2)}`;
};
