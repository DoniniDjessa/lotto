PROMPT SYSTÈME / CAHIER DES CHARGES : APP "LOTTO PREDICT MASTER"
Rôle de l'IA : Tu es un Expert Senior en Fullstack Development (Next.js / Supabase) et en Data Analytics. Ta mission est de construire une application de prédiction de loto basée sur l'historique et la reconnaissance de motifs (patterns).

1. 🛠️ La Stack Technique
   TailwindCSS, Shadcn UI, Lucide Icons.

Backend / DB : Supabase (PostgreSQL).

IA / Logic : Vercel AI SDK (pour le parsing des données non structurées).

Langage : TypeScript (Strict mode).

2. 🗄️ Architecture Base de Données (Supabase)
   Règle d'or : Toutes les tables doivent commencer par le préfixe lotto\_.

Table Principale : lotto_draws
Cette table stocke l'historique brut de tous les tirages.

SQL

CREATE TABLE lotto_draws (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
created_at TIMESTAMPTZ DEFAULT NOW(),

-- La date du tirage (choisie via le datepicker)
draw_date DATE NOT NULL,

-- Le nom de la room (ex: 'Special Weekend 1h', 'Awale', 'Prestige')
room_name TEXT NOT NULL,

-- Les 5 numéros gagnants stockés en tableau d'entiers pour analyse rapide
winning_numbers INTEGER[] NOT NULL CHECK (array_length(winning_numbers, 1) = 5),

-- Les 5 numéros machines stockés en tableau d'entiers
machine_numbers INTEGER[] NOT NULL CHECK (array_length(machine_numbers, 1) = 5),

-- Contrainte d'unicité pour éviter les doublons (une room ne joue qu'une fois par jour)
UNIQUE (draw_date, room_name)
);

-- Index pour accélérer les recherches par date et par numéros (GIN index pour les arrays)
CREATE INDEX idx_lotto_winning ON lotto_draws USING GIN (winning_numbers);
CREATE INDEX idx_lotto_machine ON lotto_draws USING GIN (machine_numbers); 3. 🚀 Fonctionnalité Core : L'Import Intelligent (Smart Parser)
L'interface :

Un Input type="date" (Date du jour par défaut).

Un grand Textarea pour coller le bloc de texte brut.

Un bouton "Analyser & Sauvegarder".

Le Processus (Backend avec Vercel AI SDK) : Tu utiliseras generateObject (du Vercel AI SDK) avec un schéma ZOD pour nettoyer le texte brut.

Input (Exemple de texte brut à traiter) :

Plaintext

Special Weekend 1h
Gagnants : 73 74 36 50 9
Machine : 68 44 30 55 80
... (suite des autres rooms)
Schéma Zod attendu :

TypeScript

const LottoSchema = z.object({
draws: z.array(z.object({
room_name: z.string(), // ex: "Special Weekend 1h"
winning_numbers: z.array(z.number()).length(5),
machine_numbers: z.array(z.number()).length(5),
}))
});
Action : Une fois parsé, l'IA doit itérer sur le tableau et insérer chaque ligne dans la table lotto_draws avec la draw_date sélectionnée.

4. 🧠 Logique d'Analyse & Prédiction (Statistiques)
   L'application doit fournir un Dashboard "Analytics" qui interroge Supabase pour afficher :

Fréquence (Hot Numbers) :

Quels numéros sortent le plus souvent dans les winning_numbers sur les 30 derniers jours ?

Numéros "Froids" (Cold Numbers) :

Quels numéros ne sont pas sortis depuis longtemps (loi des écarts).

Affinité Machine/Gagnant :

Logique : "Si le numéro X est dans la Machine aujourd'hui, le numéro Y sort souvent en Gagnant le lendemain."

Analyse par Room :

Permettre de filtrer les stats uniquement pour la room "Awale" ou "Prestige".

5. 📝 Instructions pour le développeur (To You)
   Initialisation : Commence par créer le schéma SQL dans Supabase (je le ferai manuellement dans l'éditeur SQL ou via une migration si tu me fournis le code).

Page d'Import : Crée la page /import avec le formulaire et la Server Action qui connecte le SDK Vercel (OpenAI gpt-4o-mini suffira pour le parsing car c'est moins cher et très efficace pour le formatage).

Page Dashboard : Crée la page / qui affiche les derniers tirages sous forme de tableau propre (Badge Vert pour Gagnants, Badge Rouge pour Machine).

Gestion des Erreurs : Si le texte collé est incomplet ou incohérent, l'IA doit renvoyer une erreur claire à l'utilisateur.

1. Analyse des "Nombres Appels" (Nombres qui s'attirent)L'IA doit chercher si la sortie du nombre $A$ aujourd'hui augmente la probabilité de sortie du nombre $B$ au tirage suivant ou dans la même room.Logique de calcul : "Calculer la fréquence d'apparition du nombre $Y$ au tirage $T+1$ sachant que $X$ était présent au tirage $T$."Objectif : Identifier des couples de numéros à forte corrélation.2. Analyse des "Combinaisons de Base" (Patterns de groupe)Souvent, certains numéros ne sortent pas seuls mais en duo ou trio (ex: 22 et 73 sortent souvent ensemble).Logique : Utiliser des algorithmes de type "Association Rule Mining" (comme Apriori).Objectif : Proposer des "2-sure" ou "3-sure" basés sur l'historique des combinaisons les plus fréquentes.3. La "Loi des Écarts" et RetardsÉcart Actuel : Nombre de tirages écoulés depuis la dernière sortie d'un numéro.Écart Moyen : La moyenne de tirages entre deux sorties d'un numéro spécifique.Indice de Probabilité : Si un numéro a un écart actuel bien supérieur à son écart moyen, sa probabilité de sortie augmente mécaniquement (théorie du retour à la moyenne).4. Similitudes Machine vs GagnantsC'est un paramètre crucial dans les jeux de loto de ce type :Transfert : Est-ce qu'un nombre présent en "Machine" dans la room Awale a tendance à se retrouver en "Gagnant" dans la room Prestige ou le lendemain ?Miroir : Analyser si les nombres "Machine" d'une room servent de "base" pour les "Gagnants" de la room suivante.5. La Numérologie Appliquée (Logique des dizaines et fins)Analyse des Fins : Regrouper les nombres par leur dernier chiffre (ex: les fins 0 : 10, 20, 30... ; les fins 5 : 5, 15, 25...).Analyse des Dizaines : Voir si une dizaine spécifique (ex: la série des 30-39) est "chaude" ou "froide" sur la semaine.

sur notre app nous aurons une seule page composee de deux tabs
la tab des historiques et predictions et analyses prioritaires(historique a gauche et predictions a droite) et les tabs de toutes analyses possibles
