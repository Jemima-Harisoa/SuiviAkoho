# 3. Incubation (extension)

*(Référence : section 3 + section 8)*

### Gestion des œufs dans le système

Les **œufs** sont des entités suivies avant la création d’un lot (voir section 1 et 8).

#### États possibles d’un œuf :

Un œuf peut être dans l’un des états suivants :

* En incubation
* Éclos
* Perdu (non viable, cassé, mortalité embryonnaire)
* Vendu (uniquement si non éclos et non perdu)

> Tant qu’un œuf n’a **ni éclos ni été perdu**, il reste **vendable** (cohérent avec section 8 : vente directe).

---

### Automatisation du cycle

Tout le processus est **automatisé** dans le système :

* Début incubation → **Jour 0**
* Début phase alimentation → **Jour 0 (après éclosion)** (voir section 5)
* Temps d’éclosion : calculé automatiquement (21 jours – section 3)
* Temps de ponte : calculé automatiquement (voir section 2)

---

### Résultat d’incubation

À la fin des 21 jours :

* Les œufs sont automatiquement répartis en :

  * Œufs éclos → création d’un **nouveau lot (Semaine 0)** (section 1)
  * Œufs perdus → enregistrés comme pertes

---

## 8. Traitement des œufs (extension)

### Paramétrage par race

*(Référence : section 2 et logique métier globale)*

Chaque **race** contient désormais des paramètres spécifiques liés aux œufs :

* Taux d’éclosion (%) (cohérent avec section 3 : 70–90 %)
* Taux de perte (%)
* Répartition sexe :

  * % mâle
  * % femelle

Ces paramètres sont utilisés lors de l’éclosion automatique.

---

### Gestion des pertes

Les pertes d’œufs sont :

* Calculées automatiquement selon :

  * Taux de perte (race)
  * Conditions d’incubation (section 3)

* Valorisation :

  * Les pertes sont **enregistrées financièrement**
  * Basées sur le **prix unitaire de l’œuf** (section 8 : 500–800 Ar)

---

### Vente des œufs

Un œuf peut être vendu uniquement s’il est :

* Non éclos
* Non perdu

*(Respect de la logique de section 8 : vente directe)*

---

## 2. Cycle général d’élevage (extension – ponte)

### Capacité de production par race

Chaque **race** possède :

* Une **capacité totale de pondaison sur sa durée de vie**

  * (cohérent avec : 100 à 250 œufs/an – section 2)

Cette capacité permet :

* De limiter la production totale d’un lot
* De prévoir la performance globale

---

### Automatisation de la ponte

Le système gère automatiquement :

* Début de ponte (20–24 semaines – section 2)
* Fréquence de ponte
* Production journalière estimée

Le calcul est basé sur :

* L’âge du lot
* Les caractéristiques de la race

---

## Synthèse des ajouts structurels

### Entité Race (mise à jour)

Ajouts :

* taux_eclosion
* taux_perte_oeuf
* pourcentage_male
* pourcentage_femelle
* capacite_ponte_vie

---

### Entité Œuf (nouvelle logique implicite)

Attributs :

* statut (incubation / éclos / perdu / vendu)
* date_debut_incubation (Jour 0)
* date_eclosion_prevue
* valeur (prix unitaire)
* race (référence)

---

### Cohérence avec le README

* Section 1 : création de lot après éclosion respectée
* Section 2 : intégration des performances par race
* Section 3 : incubation enrichie (automatisation + pertes)
* Section 5 : lien avec début alimentation (Jour 0)
* Section 8 : vente et incubation cohérentes et complétées

