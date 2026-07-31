---
title: "Le bug qui revenait tous les trois mois"
date: 2026-06-19
numero: "06"
tag: "domaine-metier"
description: "Quatre correctifs, une page de doc, des tests bout en bout et une checklist de revue plus tard, il revenait quand même. Parce que ce n'était pas un bug de code — c'était un désaccord que personne n'avait jamais tranché."
draft: false
---

Il y avait un ticket, dans cette équipe, qui avait une réputation.

Toutes les dix à douze semaines, il revenait sous un numéro différent, avec le même intitulé à deux mots près : *une commande annulée est facturée quand même*. Pas souvent. Quelques dizaines de cas par trimestre. Assez pour que le service client le connaisse par cœur et le corrige à la main, assez peu pour ne jamais devenir la priorité du sprint.

Quand je suis arrivé, ils en étaient au quatrième correctif en un an. Le plus ancien développeur de l'équipe m'a dit une phrase que je garde depuis :

« On l'a déjà réglé trois fois. À chaque fois, on a réglé le bon truc. »

Il avait raison. C'est exactement ça qui est intéressant.

## Ce qu'ils avaient essayé

### Tentative 1 : corriger là où ça casse

Le premier réflexe, et le plus légitime. Le bug remonte depuis la facturation ? On ajoute une garde dans la facturation.

```php
if ($commande->getStatut() !== 'annulee') {
    $this->facturer($commande);
}
```

Ça marche. Le bug disparaît. Pendant onze semaines.

Puis il revient — par un autre chemin. Parce que la facturation n'était qu'un des cinq endroits qui décident de facturer quelque chose : le batch nocturne, l'export comptable, le webhook du prestataire de paiement, la relance automatique, et l'interface d'administration où un opérateur peut forcer une facture.

Corriger à l'endroit où ça casse, c'est mettre un seau sous la fuite. Le seau fonctionne. La fuite reste.

### Tentative 2 : écrire la règle quelque part

Deuxième étape logique : si le problème est que personne ne sait, on documente.

Une belle page dans le wiki. « Cycle de vie d'une commande ». Un diagramme d'états, sept statuts, les transitions autorisées, la liste des cas où on ne facture pas.

Six mois plus tard, cette page est fausse. Pas par négligence — parce que le code a bougé quatre fois et la page zéro. Et maintenant, c'est pire qu'avant : il existe une documentation officielle à laquelle les nouveaux font confiance, et qui ment.

Une règle métier qui vit dans un wiki est une règle métier qui ne s'exécute pas. Le seul document qui ne peut pas mentir sur le comportement du système, c'est celui qui le produit.

### Tentative 3 : couvrir avec des tests bout en bout

Alors on teste. Massivement, et par le haut : des scénarios complets, navigateur compris, qui rejouent le parcours d'une commande annulée.

Le résultat est classique. La suite prend vingt-huit minutes. Elle échoue une fois sur cinq pour des raisons qui n'ont rien à voir avec le métier — un timing, un état de base pas nettoyé, un sélecteur qui a bougé. Au bout de deux mois, l'équipe relance les jobs rouges par réflexe au lieu de les lire.

Et surtout : ces tests couvrent les chemins qu'on a pensés. Le bug, lui, passe toujours par celui qu'on n'a pas pensé — sinon on l'aurait corrigé.

Un test qui passe ne prouve pas grand-chose. Le seul test qui a de la valeur est celui qui échoue au bon moment. Une suite qui rougit au hasard n'échoue jamais au bon moment : elle échoue tout le temps, ce qui revient à ne jamais rien dire.

### Tentative 4 : la vigilance

Dernière étape avant de vivre avec : on demande aux gens de faire attention.

Une ligne ajoutée à la checklist de revue : *« vérifier l'impact sur le statut des commandes »*. Un rappel en daily. Un dev senior désigné comme relecteur obligatoire sur ce périmètre.

Ça tient six semaines. Puis le senior part en vacances, un nouveau arrive, la checklist devient un décor qu'on coche.

On ne compense pas un défaut de conception par de la discipline individuelle. Ça, c'est demander à des humains d'être des garde-fous à vie. Ça marche jusqu'à la première mauvaise journée de quelqu'un.

## Le vrai problème : trois personnes, trois définitions

Le déclic est arrivé dans une salle, avec le responsable du service client, un développeur et la contrôleuse de gestion. J'ai posé une question bête :

**« Une commande annulée, c'est quoi exactement ? »**

Trois réponses. Sincères. Incompatibles.

- Pour le service client : une commande dont le client a demandé l'annulation, quel que soit son état d'expédition.
- Pour la contrôleuse de gestion : une commande qui ne donnera lieu à aucun encaissement. Si elle est déjà partie et que le client la renvoie, ce n'est pas une annulation, c'est un retour — et un retour, ça se facture puis ça se rembourse.
- Pour le développeur : `statut === 'annulee'`, une chaîne de caractères en base.

Le bug n'était pas dans le code. Il était dans le fait qu'un seul mot, « annulée », désignait trois choses différentes selon qui le prononçait — et que le code avait tranché sans le savoir, en silence, quatre ans plus tôt.

Chaque correctif était juste. Chacun résolvait le problème dans la définition de celui qui l'avait signalé. Et chacun cassait doucement celle des deux autres.

Les bugs les plus chers ne viennent pas d'un mauvais code. Ils viennent d'un « ah, moi j'avais compris autre chose » que personne n'a jamais formulé à voix haute.

## La bascule : un langage, puis un domicile

C'est là que le craft cesse d'être une question de style de code et devient une question d'argent.

### Un seul vocabulaire, partagé par tout le monde

Le premier travail n'a pas été technique. On a passé une demi-journée à nommer les choses. Résultat : le mot « annulation » a disparu. Il en est sorti trois, distincts, que tout le monde emploie désormais — dans les réunions, dans les tickets, et dans le code :

- **Rétractation** : avant expédition. Aucune facture n'est émise.
- **Retour** : après expédition. La facture existe, un avoir la compense.
- **Litige** : encaissement contesté. Ni l'un ni l'autre, un processus à part.

Ça a l'air d'un exercice de sémantique. C'est la correction la plus rentable qu'on ait faite cette année-là. À partir du moment où le développeur, le service client et la comptabilité utilisent le même mot pour la même chose, la moitié des malentendus n'a plus de support pour exister.

### Les exemples avant le code

Ensuite, avant d'écrire quoi que ce soit, on a écrit des exemples. Ensemble. En français.

```gherkin
Étant donné une commande expédiée de 200 $
Quand le client la renvoie
Alors la facture reste émise
Et un avoir de 200 $ est créé
```

Ce n'est pas du Gherkin pour faire du Gherkin, et l'outillage n'a aucune importance ici. Le BDD, ce ne sont pas des tests : c'est une conversation que l'équipe n'avait jamais eue, dont on garde la trace écrite. Le bénéfice, c'est l'accord. Le test n'est que le reçu.

En deux heures d'écriture d'exemples, on a découvert quatre cas dont personne ne connaissait le comportement attendu — dont deux qui étaient en production depuis trois ans, traités différemment par deux services.

### La règle prend une adresse

Enfin, le code. La règle a cessé d'être une chaîne de caractères contrôlée à cinq endroits pour devenir un objet qui protège ses propres invariants.

```php
final class Commande
{
    public function retracter(): void
    {
        if ($this->estExpediee()) {
            throw new RetractationImpossible(
                'Une commande expédiée relève du retour, pas de la rétractation.'
            );
        }

        $this->etat = EtatCommande::Retractee;
    }

    public function estFacturable(): bool
    {
        return $this->etat->donneLieuAEncaissement();
    }
}
```

Le point important n'est pas la syntaxe. C'est que la question « est-ce qu'on facture ? » n'a plus le droit d'être posée ailleurs. Il n'y a plus cinq endroits qui décident : il y en a un, et les quatre autres l'interrogent.

Un état incohérent n'est plus « un bug qu'on corrigera ». Il devient impossible à construire.

Trois mois plus tard, le ticket n'est pas revenu. Neuf mois plus tard non plus.

## Ce que tu peux retenir

1. Un bug qui revient n'est pas un bug. C'est un symptôme de conception, et le traiter comme un bug garantit qu'il reviendra.
2. Si tu corriges à l'endroit où ça casse, tu apprends où sont tes seaux, pas où est ta fuite.
3. La documentation ne s'exécute pas. Une règle métier qui n'existe que dans un wiki n'existe pas.
4. Avant de chercher dans le code, pose la question bête : « ce mot-là, il veut dire quoi exactement ? » Fais-la poser à trois personnes de trois métiers différents. Compare.
5. Écrire les exemples avant le code coûte deux heures et révèle les désaccords pendant qu'ils sont encore gratuits.
6. Une règle métier doit avoir un seul propriétaire dans le code. Les autres l'interrogent, ils ne la redémontrent pas.
7. Le meilleur test n'est pas celui qui vérifie que ça marche. C'est celui qui rend un état incohérent impossible à écrire.

## Le test que tu peux faire cette semaine

Il prend dix minutes et il ne demande aucune permission.

Prends le mot le plus utilisé dans ton domaine — « client », « commande », « dossier », « contrat », « actif ». Demande sa définition exacte à trois personnes : un développeur, quelqu'un du métier, quelqu'un de la finance ou du juridique.

Si tu obtiens trois définitions différentes, tu viens de trouver l'endroit où tes prochains bugs vont naître. Ils ne sont pas encore écrits, mais ils sont déjà décidés.

## Pour aller plus loin

C'est exactement le genre de chantier qu'on ne mène pas seul, parce qu'il demande de faire s'asseoir dans la même pièce des gens qui n'ont pas l'habitude de parler ensemble — et quelqu'un dont le métier est de traduire.

Chez Arkonium, ça commence petit :

- **Le micro-audit** — où vivent vos règles métier aujourd'hui, et ce que ça vous coûte, chiffré. Trois constats, une porte d'entrée.
- **L'atelier** — une journée, développeurs et métier ensemble, à modéliser pour de vrai votre domaine et à voir le code changer sous vos yeux.
- **Le mentorat** — les pratiques qui s'installent dans la durée, jusqu'à ce que l'équipe n'ait plus besoin de nous pour les tenir.

Trente minutes pour en parler, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Et toi, c'est quoi le mot que ton équipe et ton métier prononcent pareil sans jamais parler de la même chose ?
