# test

text

Crée une application React POC (mono-page) pour automatiser une fiche d'évaluation de compétition de robotique. 
CONTRAINTE STRICTE : Pas de base de données, pas de Supabase, pas de backend. Utilise uniquement le localStorage et l'état React (useState). Utilise Tailwind CSS. Ne crée pas de multiples pages, tout doit tenir sur une seule page (un formulaire à gauche/haut, un tableau de classement à droite/bas).

**PARTIE 1 : Le Formulaire (Wizard pour le Jury)**
Un formulaire simple en 3 étapes (utilise un state `step` de 1 à 3) :
- **Étape 1 (Infos)** : Champs "Team name", "Team leader", "Robot code". Bouton "Suivant".
- **Étape 2 (Temps)** : 3 champs numériques (en secondes, ex: 90.5) pour "First time", "Second time", "Third time". 
  *Règle* : Si un champ est vide ou 0, considérer la valeur comme 180 secondes (DNF/Échec).
  Bouton "Suivant".
- **Étape 3 (Pénalité)** : Case à cocher "Penalty 20%". Champ texte "Remarks". Bouton "Enregistrer l'équipe".

**PARTIE 2 : Logique de calcul (à faire en JS)**
- `bestTime` = MIN des 3 temps (en appliquant la règle des 180s pour les vides).
- `finalTime` = Si Penalty cochée, alors `bestTime * 1.2`. Sinon `bestTime`.
- Lors de l'enregistrement, ajoute l'objet équipe au `localStorage` et mets à jour le tableau.

**PARTIE 3 : Le Classement (Leaderboard)**
Affiche un tableau sous le formulaire avec les colonnes : Rank, Team Name, Robot Code, Best Time, Penalty (Oui/Non), Final Time, Top 8, Remarks.
- Trie le tableau par `finalTime` croissant.
- Le 1er est le gagnant : affiche un badge "🏆 Gagnant" à côté de son nom.
- Ajoute une colonne "Top 8" qui affiche un "✓" si l'équipe est dans les 8 premières lignes du tableau trié.
- Ajoute un bouton "Exporter CSV" qui télécharge les données du tableau.
- Ajoute un bouton "Réinitialiser" pour vider le localStorage.

Génère tout le code nécessaire. Fais simple et fonctionnel pour un POC.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://robo-run-rankings.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8252faf-1627-485d-aa95-783290d83154).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
