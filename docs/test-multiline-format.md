# Test avec Format Multi-Lignes

## Format Testé (Données Réelles)

```
Digital Reveil 7h
Gagnants :
38
78
52
12
39
Machine :
45
84
75
4
59

Digital Reveil 8h
Gagnants :
47
74
36
65
9
Machine :
82
78
90
8
2

Digital 21h
Gagnants :
52
59
19
43
81
Machine :
56
32
79
15
87

Digital 22h
Gagnants :
62
76
79
89
75
Machine :
19
32
12
20
84

Digital 23h
Gagnants :
47
88
85
4
53
Machine :
37
26
60
80
45

Reveil
Gagnants :
70
41
16
28
53
Machine :
31
67
51
61
3

Etoile
Gagnants :
75
25
24
9
42
Machine :
39
8
7
71
90

Akwaba
Gagnants :
39
73
45
8
14
Machine :
77
3
16
44
38

Monday Special
Gagnants :
11
9
27
55
32
```

## Résultat Attendu

**9 tirages** devraient être enregistrés:

1. ✅ Digital Reveil 7h - 5 gagnants, 5 machine
2. ✅ Digital Reveil 8h - 5 gagnants, 5 machine
3. ✅ Digital 21h - 5 gagnants, 5 machine
4. ✅ Digital 22h - 5 gagnants, 5 machine
5. ✅ Digital 23h - 5 gagnants, 5 machine
6. ✅ Reveil - 5 gagnants, 5 machine
7. ✅ Etoile - 5 gagnants, 5 machine
8. ✅ Akwaba - 5 gagnants, 5 machine
9. ❌ Monday Special - **INCOMPLET** (seulement 5 gagnants, pas de machine)

**Note**: Monday Special n'a pas de numéros machine. Le parser acceptera cela SEULEMENT si:

- C'est intentionnel (comme pour National)
- Sinon, il faudra ajouter les 5 numéros machine

## Logique du Parser Amélioré

### Mode 1: Nombres sur Même Ligne

```
Room Name
Gagnants : 1 2 3 4 5
Machine : 6 7 8 9 10
```

→ Parse immédiatement les 5 nombres

### Mode 2: Nombres sur Lignes Séparées

```
Room Name
Gagnants :
1
2
3
4
5
Machine :
6
7
8
9
10
```

→ Collecte les 5 lignes suivantes

### Mode Mixte (aussi supporté)

```
Room Name
Gagnants : 1 2
3
4
5
Machine : 6 7 8 9 10
```

→ Combine les nombres sur même ligne + lignes suivantes

## Avantages

✅ Flexibilité maximale
✅ Gère copier-coller depuis différentes sources
✅ Toujours **gratuit et instantané**
✅ Pas besoin de reformater manuellement
