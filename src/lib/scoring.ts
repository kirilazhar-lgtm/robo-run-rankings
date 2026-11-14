export const DNF = 180;
export type Team = { id: string; teamName: string; teamLeader: string; robotCode: string; times: number[]; bestTime: number; penalty: boolean; finalTime: number; remarks: string };
export const normalizeTime = (v: string | number) => { const n = Number(v); return !n || n <= 0 || isNaN(n) ? DNF : n; };
export const bestTimeOf = (t: (string | number)[]) => Math.min(...t.map(normalizeTime));
export const finalTimeOf = (best: number, penalty: boolean) => (penalty ? best * 1.2 : best);
export const rank = (teams: Team[]) => [...teams].sort((a, b) => a.finalTime - b.finalTime);
