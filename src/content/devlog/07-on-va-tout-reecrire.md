---
title: "« On va tout réécrire » : la phrase la plus chère de ton équipe"
date: 2026-07-02
numero: "07"
tag: "legacy"
description: "Onze mois de réécriture, zéro ligne en production, et le vieux système toujours debout. Pourquoi le grand soir échoue presque toujours — et la méthode qui permet de sortir d'un legacy sans jamais l'arrêter."
draft: false
---

Le projet devait durer quatorze mois. Il a été arrêté au onzième.

Une réécriture complète : nouveau socle, nouvelle architecture, nouvelle base. L'ancien système avait neuf ans, plus personne ne voulait l'ouvrir, et la décision avait été prise avec les meilleures intentions du monde par des gens compétents.

Au moment de l'arrêt, le bilan tenait en trois lignes. Le nouveau système couvrait environ 60 % du métier. L'ancien tournait toujours en production, avait reçu vingt-trois nouvelles fonctionnalités pendant ces onze mois, et l'écart entre les deux se creusait plus vite que l'équipe ne le comblait.

Personne n'avait mal travaillé. Le plan était mauvais dès le départ, et il l'était pour une raison qu'on peut nommer précisément.

## Ce qui pousse à la réécriture

Avant les tentatives, il faut nommer honnêtement le point de départ, parce qu'il est parfaitement rationnel.

L'équipe avait peur du code. Pas au sens figuré : chaque modification était une roulette russe. Tu changes une ligne, trois choses cassent ailleurs, tu ne le découvres qu'en recette, parfois en production.

Face à ça, « on repart de zéro » n'est pas un caprice de développeur. C'est la seule réponse qui semble adresser la cause plutôt que le symptôme. Sauf qu'elle repose sur un pari énorme, rarement formulé : que tout le savoir enfermé dans neuf ans de code est reproductible ailleurs, de mémoire, en parallèle du quotidien.

Voici les quatre routes que j'ai vues prendre pour sortir de là. Trois mènent au mur.

### Tentative 1 : le gel

« On ne touche plus à l'ancien. Tout le nouveau se fait à côté. »

C'est séduisant : plus de risque de casse, une zone propre où travailler. En pratique, tu viens de créer deux systèmes qui doivent se parler, se synchroniser, et rester cohérents. Le coût d'intégration entre les deux dépasse rapidement le coût qu'il y avait à modifier l'ancien.

Et le gel n'existe pas vraiment. Il y aura toujours une urgence client, une obligation légale, une faille à corriger. Alors on touche quand même à l'ancien, mais cette fois sans assumer, en vitesse, en s'excusant. Le code gelé devient le code qu'on modifie mal.

### Tentative 2 : le grand soir

La réécriture complète, donc.

Elle échoue pour trois raisons mécaniques, indépendantes de la qualité de l'équipe :

**La cible bouge.** L'ancien système continue de vivre. Chaque mois, il gagne des fonctionnalités que le nouveau doit rattraper. Tu cours après un train qui accélère.

**Le vrai cahier des charges, c'est le code lui-même.** Neuf ans de correctifs, ce sont neuf ans de décisions métier prises en réponse à des cas réels. Ce `if` incompréhensible ligne 340 n'est pas de la saleté : c'est un client important, en 2021, avec un cas particulier que personne n'a documenté. Réécrire de zéro, c'est réapprendre tout ça — en production, sur les clients.

**Rien ne se livre avant la fin.** Donc rien n'est validé avant la fin. Donc l'erreur commise au mois deux est découverte au mois neuf. Et un projet qui ne livre pas devient politiquement fragile : le jour où le budget se tend, c'est le premier à sauter. C'est exactement ce qui est arrivé au onzième mois.

### Tentative 3 : imposer un taux de couverture

Autre variante, plus modeste : « on ne repart pas de zéro, mais on impose 80 % de couverture de tests avant de refactorer ».

L'intention est juste : construire le filet avant de marcher sur le fil. L'exécution se retourne presque toujours.

Parce qu'un objectif chiffré de couverture produit des tests écrits pour le chiffre. On teste ce qui est facile à tester — les accesseurs, les cas passants, le code sans dépendances — et pas ce qui fait mal. On atteint 80 % avec une suite qui ne protège rien de ce qui casse vraiment.

Pire : ces tests-là sont écrits *après*, en lisant l'implémentation. Ils vérifient que le code fait ce que le code fait. Le jour où tu refactores, ils rougissent tous — non pas parce que le comportement a changé, mais parce que la structure a bougé. Tu as construit un filet qui t'empêche de bouger au lieu de te protéger quand tu bouges.

Le vrai critère d'un test n'est pas la couverture. C'est celui-ci : casse volontairement une règle métier dans ton code. Combien de tests rougissent ? S'il n'y en a aucun, ta couverture ne vaut rien, quel que soit le pourcentage.

### Tentative 4 : compenser par la recette manuelle

Enfin, la solution par la sueur : puisqu'on ne peut pas faire confiance au code, on multiplie les vérifications humaines. Recette plus longue, scénarios manuels, deuxième relecteur obligatoire.

Ça fonctionne. À un coût qui augmente à chaque livraison, avec un délai qui s'allonge, et une équipe qui s'épuise. C'est l'option qui ne casse rien tout de suite et qui rend la livraison de plus en plus rare — jusqu'à ce que « on livre une fois par trimestre » devienne la culture maison.

## Le vrai problème : ce n'est pas l'âge, c'est l'absence de filet

Un mot d'abord, parce qu'il fausse tous les raisonnements : **legacy ne veut pas dire vieux.**

J'ai vu du code de six mois déjà pourri et du code de dix ans impeccable. Le legacy, ce n'est pas une date de naissance. C'est du code que plus personne ne comprend et que tout le monde a peur de modifier.

Et la peur n'est pas un problème de courage. Elle est parfaitement rationnelle : quand tu n'as aucun moyen de savoir si tu viens de casser quelque chose, la seule stratégie raisonnable est de ne pas toucher.

Donc le problème à résoudre n'est pas « ce code est moche ». C'est : **l'équipe n'a aucun signal fiable quand elle se trompe.**

Formulé comme ça, la solution change complètement de nature. Tu n'as pas besoin d'un nouveau système. Tu as besoin d'un filet — puis d'apprendre à marcher dessus.

## La bascule : caractériser, encercler, puis tester d'abord

Voilà la méthode qui tient, dans l'ordre.

### 1. Caractériser l'existant, sans le juger

Un test de caractérisation ne dit pas ce que le code *devrait* faire. Il constate ce qu'il *fait*, aujourd'hui, y compris ses bizarreries.

```php
public function test_calcul_du_prix_client_grand_compte_2021(): void
{
    // On ne juge pas cette règle. On la fige.
    // Elle vient d'un cas client réel : voir facture n°8842.
    $resultat = $this->calculateur->calculer(
        client: 'grand-compte',
        montant: 1500.00,
        codePromo: 'ETE21'
    );

    self::assertSame(1327.50, $resultat);
}
```

Tu n'as pas besoin de comprendre pourquoi la remise donne ce résultat. Tu as besoin de savoir que si elle change, quelqu'un te prévient. C'est tout. Et c'est énorme : à partir de cet instant, ce bout de code n'est plus une roulette russe.

On ne caractérise pas toute la base. On caractérise ce sur quoi on s'apprête à travailler, et ce qui fait le plus mal quand ça casse. Une demi-journée bien placée couvre souvent les trois zones responsables de 80 % des incidents.

### 2. Encercler plutôt que remplacer

Ensuite, on n'attaque pas le monolithe de face. On l'encercle.

Le principe : chaque nouvelle fonctionnalité, chaque correctif, s'écrit proprement à côté — bien conçu, bien testé — et l'ancien chemin est redirigé vers lui, un morceau à la fois. L'ancien système ne meurt jamais d'un coup. Il se vide.

Ce qui change tout, par rapport au grand soir :

- **Ça livre en continu.** Chaque semaine produit de la valeur en production, donc le projet ne peut pas être annulé pour cause d'invisibilité.
- **Ça s'arrête proprement.** Si les priorités changent au mois quatre, tu gardes tout ce qui a été fait. Ce n'est pas un chantier abandonné, c'est un chantier en pause avec des murs debout.
- **Ça règle d'abord ce qui coûte.** On range les pièces dans lesquelles l'équipe entre tous les jours. Les zones que personne ne touche depuis quatre ans peuvent rester telles quelles — elles ne coûtent rien.

### 3. Tester d'abord sur tout ce qui est neuf

Sur le code nouveau, la règle devient simple : le test avant l'implémentation.

Je connais l'objection, je l'entends chaque semaine : « je n'ai pas le temps de faire du TDD ». La réponse tient en une phrase : tu n'as pas le temps *parce que* tu n'en fais pas. Le temps que tu crois gagner en sautant le test, tu le rends au triple — en débogage, en régressions, en « pourquoi ça ne marche plus », en peur d'ouvrir un fichier.

Le TDD n'ajoute pas une étape. Il déplace le moment où tu réfléchis. Au lieu de comprendre ton problème après le bug, tu le comprends avant d'écrire la première ligne. Écrire le test d'abord, c'est te forcer à définir « fini » avant de commencer — et la majorité des dérives de projet viennent précisément de là.

Ce n'est pas une religion. Il y a des endroits où ça n'apporte rien. Mais sur une règle métier, sur un calcul, sur une machine à états : ça sauve la mise, à chaque fois.

## Ce que ça a donné

Sur ce projet-là, après l'arrêt de la réécriture, on a repris dans l'autre sens. Sept mois plus tard :

- l'ancien système tournait toujours — et ce n'était plus un problème ;
- environ 40 % du métier était passé dans du code neuf, testé, livré au fil de l'eau ;
- le délai entre deux mises en production était passé de six semaines à trois jours ;
- et la phrase « on préfère ne pas y toucher » avait disparu du vocabulaire des dailies.

Aucun grand soir. Aucune annonce. Juste une équipe qui a récupéré le droit de modifier son propre code.

## Ce que tu peux retenir

1. « Legacy » ne veut pas dire vieux. Ça veut dire : plus personne ne comprend, et tout le monde a peur.
2. La peur de toucher au code est rationnelle. Ne la traite pas comme un manque de courage — traite-la comme une absence de signal.
3. La réécriture complète échoue pour trois raisons mécaniques : la cible bouge, le cahier des charges est dans l'ancien code, et rien ne se livre avant la fin.
4. Un objectif de couverture produit des tests écrits pour le chiffre. Le bon critère : casse une règle métier et regarde ce qui rougit.
5. Le test de caractérisation ne juge pas le code existant. Il le fige, et il transforme un champ de mines en terrain praticable.
6. On encercle, on ne remplace pas. Chaque semaine doit produire quelque chose en production.
7. Le test d'abord sur tout ce qui est neuf. C'est le seul moyen d'arrêter de fabriquer du legacy en temps réel pendant qu'on nettoie l'ancien.

## Pour aller plus loin

La partie difficile de tout ça n'est presque jamais technique. Elle est humaine : convaincre une direction que sept mois de progression continue valent mieux qu'un grand projet qui promet tout, et donner à une équipe les gestes qui font que le filet existe pour de bon plutôt que sur un tableau de suivi.

C'est ce qu'on fait chez Arkonium :

- **Le micro-audit** — quelles zones font vraiment mal, ce que la peur vous coûte en délai, et par où commencer. Trois constats, pas quarante pages.
- **L'atelier** — une journée à refactorer en direct une vraie base legacy, la vôtre si un audit a été fait. On repart avec des gestes, pas avec des slides.
- **Le mentorat** — les pratiques qui s'installent dans l'équipe et qui restent après nous. On ne répare pas votre code : on apprend à vos équipes à le faire tenir.

Trente minutes pour en parler, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Et avant de partir : si tu devais chiffrer ce que la phrase « on préfère ne pas y toucher » coûte à ton équipe chaque mois, tu commencerais par quoi ?
