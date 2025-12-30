# 🗄️ Nouvelle Architecture Base de Données - Par Jour

## 🎯 Problème Résolu

**Avant**: Une ligne par room → Difficile à gérer, doublons possibles
**Maintenant**: Une ligne par jour → Facile à supprimer, pas de doublons

---

## 📊 Nouveau Schéma

### Structure de la Table `lotto_draws`

```sql
CREATE TABLE lotto_draws (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  draw_date DATE NOT NULL UNIQUE,  -- ⭐ Une seule date par ligne
  rooms JSONB NOT NULL             -- ⭐ Toutes les rooms en JSON
);
```

### Exemple de Données

```json
{
  "draw_date": "2025-12-25",
  "rooms": {
    "Digital Reveil 7h": {
      "winning_numbers": [38, 78, 52, 12, 39],
      "machine_numbers": [45, 84, 75, 4, 59]
    },
    "Awale": {
      "winning_numbers": [12, 45, 67, 23, 89],
      "machine_numbers": [34, 56, 78, 90, 12]
    },
    "National": {
      "winning_numbers": [5, 15, 25, 35, 45],
      "machine_numbers": []
    }
  }
}
```

---

## ✨ Nouvelles Fonctionnalités

### 1️⃣ Insertion Intelligente (Upsert)

**Si la date n'existe pas**: Crée une nouvelle entrée
**Si la date existe déjà**:

- Affiche une notification avec le nombre de rooms existantes
- Demande confirmation à l'utilisateur
- Bouton "Écraser" dans le toast

```typescript
// Code simplifié
const result = await importDraws(drawDate, rawText, overwrite);

if (result.needsConfirmation) {
  toast.error(`La date contient déjà ${result.existingRoomCount} rooms`, {
    action: {
      label: "Écraser",
      onClick: () => handleSubmit(e, true),
    },
  });
}
```

---

### 2️⃣ Suppression par Date

✅ Un seul clic pour supprimer toute une journée
✅ Confirmation avec le nom de la date en français
✅ Bouton trash sur chaque accordion header

```typescript
const handleDeleteDate = async (date: string) => {
  const confirmed = confirm(`Supprimer tous les tirages du ${date} ?`);
  if (confirmed) {
    await deleteDrawsByDate(date);
  }
};
```

---

### 3️⃣ Ordre Chronologique Automatique

✅ Les données s'insèrent automatiquement au bon endroit
✅ Même si vous ajoutez du 02/12/25 après du 25/12/25
✅ SQL ORDER BY draw_date DESC garantit l'ordre

**Exemple**:

- Aujourd'hui: Ajout du 25/12/25
- Demain: Ajout du 02/12/25
- **Résultat**: 25/12 apparaît AVANT 02/12 (ordre décroissant)

---

## 🔄 Flux de Travail

### Import Normal

```
1. Utilisateur colle les données
2. Parser extrait les rooms
3. Check si la date existe
   ❌ Non → INSERT direct
   ✅ Oui → Demande confirmation
4. Utilisateur clique "Écraser"
5. UPSERT (UPDATE les rooms)
6. Notification de succès
```

### Suppression

```
1. Utilisateur clique sur 🗑️
2. Confirmation dialog
3. DELETE WHERE draw_date = ?
4. Toutes les rooms du jour disparaissent
5. Refresh automatique
```

---

## 💾 Migration de l'Ancienne Base

**⚠️ IMPORTANT**: L'ancienne structure (une ligne par room) n'est PAS compatible!

### Option 1: Nouvelle Base (Recommandé)

```sql
-- Créer une nouvelle table
-- Copier le contenu de docs/new-database-schema.sql
```

### Option 2: Migrer les Données

```sql
-- Scripter la conversion des anciennes données
-- Grouper par date + Convertir en JSON
-- Insérer dans nouvelle structure
```

---

## 🎨 Changements UI

### Accordion Headers

```
📅 Lundi 25 décembre 2025  [9 rooms]  🗑️
```

- Calendrier icon
- Date formatée en français
- Badge avec compte de rooms
- Bouton supprimer

### Cards Grid

- 3 colonnes (desktop)
- 2 colonnes (mobile)
- Badges compacts (gap 2px)
- Triées par hiérarchie

### Pagination

- 10 jours par page
- Navigation Précédent/Suivant
- Indicateur "Page X sur Y"

---

## 📈 Avantages de la Nouvelle Structure

| Aspect          | Ancienne           | Nouvelle            |
| --------------- | ------------------ | ------------------- |
| **Lignes DB**   | 9 rooms = 9 lignes | 9 rooms = 1 ligne   |
| **Suppression** | DELETE x9          | DELETE x1           |
| **Doublons**    | Possibles          | Impossible (UNIQUE) |
| **Performance** | Scan multiple      | Scan unique         |
| **Gestion**     | Complexe           | Simple              |
| **Ordre**       | Manuel             | Automatique         |

---

## 🚀 Prochaines Étapes

1. ✅ Exécuter `docs/new-database-schema.sql` dans Supabase
2. ✅ Tester l'import avec plusieurs rooms
3. ✅ Tester l'écrasement d'une date existante
4. ✅ Tester la suppression d'une date
5. ✅ Vérifier l'ordre chronologique

---

## 🐛 Troubleshooting

### "Export DrawsHistory doesn't exist"

**Cause**: Cache Next.js
**Solution**:

```bash
# Nettoyer et redémarrer
rm -rf .next
npm run dev
```

### "UNIQUE constraint violation"

**Cause**: Tentative d'insérer une date déjà existante sans overwrite=true
**Solution**: C'est normal! Le toast propose "Écraser"

### Les dates ne s'affichent pas dans l'ordre

**Cause**: Problème de ORDER BY
**Solution**: Vérifier la requête SQL (ORDER BY draw_date DESC)

---

**Architecture complète et prête!** 🎉
