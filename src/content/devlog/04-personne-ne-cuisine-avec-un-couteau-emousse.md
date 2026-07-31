---
title: "Personne ne cuisine avec un couteau émoussé"
date: 2026-04-14
numero: "04"
tag: "outillage"
description: "Un couteau mal affûté ne coupe pas moins bien : il glisse, il écrase, et c'est lui qui vous entaille la main. Vos revues de code passent quarante minutes sur des espaces pendant que les vrais problèmes traversent. Voilà comment on affûte."
draft: false
---

Un cuisinier affûte ses couteaux tous les jours. Deux minutes, avant le service, sur le fusil. Ce n'est pas de la coquetterie de collectionneur.

Un couteau émoussé ne coupe pas « un peu moins bien ». Il glisse au lieu de mordre, il écrase la chair au lieu de la trancher, il oblige à forcer — et le jour où il dérape, c'est la main qui prend. Statistiquement, en cuisine, on se blesse avec les couteaux mal entretenus, pas avec les bien affûtés.

L'outil négligé ne ralentit pas seulement. Il devient dangereux.

Maintenant regarde ta dernière revue de code.

## Le problème : la revue qui parle de tout sauf de l'essentiel

Quarante-cinq minutes sur une pull request de deux cents lignes. Le fil de commentaires :

- « il manque une ligne vide avant le `return` »
- « on utilise `camelCase` ici, pas `snake_case` »
- « tu peux renommer `$data` ? »
- « il y a un `use` inutilisé en haut »
- « pourquoi une virgule finale ici et pas là ? »

Trois relecteurs, une journée de latence, deux allers-retours. La PR est fusionnée.

Deux semaines plus tard, elle produit une erreur en production : une méthode qui pouvait renvoyer `null` dans un cas sur cent, appelée sans vérification. Personne ne l'avait vue.

Ce n'est pas que les relecteurs étaient distraits. C'est qu'ils avaient dépensé toute leur attention sur ce qu'une machine aurait dû traiter en quatre-vingts millisecondes, et qu'il n'en restait plus pour ce que seul un humain pouvait voir.

## Ce qu'on essaie

### Tentative 1 : écrire une charte

On rédige une page « conventions de code ». Indentation, nommage, ordre des méthodes, tout y est. Elle est bien faite, et sincèrement discutée en équipe.

Deux mois plus tard, elle est appliquée à 60 %. Pas par mauvaise volonté : parce qu'un développeur concentré sur un problème métier ne se souvient pas de la section 4.2 d'un document lu une fois. Et parce qu'aucun mécanisme ne relie la charte au code.

Une convention qui n'est pas exécutable est un vœu. Elle ne devient une règle qu'au moment où quelque chose la fait respecter automatiquement.

### Tentative 2 : ajouter des relecteurs

Puisque des choses passent, on met deux approbations obligatoires. Puis trois sur les zones sensibles.

Le résultat est mécanique : le délai de fusion passe de un à trois jours, les branches divergent, les conflits augmentent, et la responsabilité se dilue. Quand trois personnes ont approuvé, personne n'a vraiment relu — chacun a supposé que les autres l'avaient fait sérieusement.

On appelle ça la diffusion de responsabilité, et ce n'est pas un défaut moral. C'est le comportement normal d'un humain dans ce dispositif.

### Tentative 3 : le gardien

Autre voie : un développeur senior relit tout. C'est efficace, il attrape beaucoup de choses.

Et ça crée trois problèmes en un. Il devient un goulot d'étranglement — rien ne passe pendant ses vacances. Il devient un point de tension — corriger les autres à longueur de journée est le meilleur moyen de finir détesté, ou épuisé, souvent les deux. Et surtout, il empêche l'équipe d'apprendre : quand quelqu'un derrière toi rattrape systématiquement tes erreurs, tu ne développes pas le réflexe de les voir.

### Tentative 4 : « on nettoiera plus tard »

Enfin, la voie de la lucidité fatiguée : on note les remarques, on ouvre un ticket « dette technique », on fusionne.

Ce ticket, tu connais son destin. Il a un numéro, un label violet, et il est toujours ouvert dix-huit mois plus tard, sous quatre-vingts autres.

Ce qui n'est pas corrigé au moment où on l'écrit ne sera pas corrigé.

## La bascule : la machine fait le travail de la machine

Le principe qui change tout est d'une simplicité désarmante :

**Tout ce qu'un outil peut vérifier ne doit jamais arriver jusqu'à un humain.**

Ni en revue, ni en discussion, ni dans une charte. La machine le vérifie, à chaque commit, sans négociation possible et sans que personne ait à le dire à quelqu'un d'autre. Et l'attention humaine — qui est la ressource la plus rare et la plus chère de ton équipe — se libère pour ce que seul un humain sait faire.

### 1. Le style cesse d'être un sujet

Un formateur automatique, une configuration versionnée, une exécution avant chaque commit.

```yaml
# .php-cs-fixer.dist.php, en une ligne d'intention :
# le style n'est plus une opinion, c'est un fichier.
```

Ce n'est pas que le style n'a pas d'importance. C'est qu'il n'a plus le droit de coûter du temps de cerveau. Le jour où le formateur tourne automatiquement, les débats sur les accolades s'arrêtent — non pas parce que quelqu'un a gagné, mais parce que la question a été retirée du plateau.

C'est le fusil à couteaux : deux minutes par jour, et on n'en parle plus.

### 2. L'analyse statique attrape ce que l'œil ne voit pas

C'est là que se trouve le vrai gain, et c'est là que la plupart des équipes s'arrêtent trop tôt.

Un analyseur statique lit ton code sans l'exécuter et te dit, avant tout test : cette méthode peut renvoyer `null` et tu l'utilises sans vérifier ; ce tableau ne contient pas ce que tu crois ; cette branche est inatteignable ; ce paramètre n'a pas le type annoncé.

Exactement l'erreur qui est passée dans la revue de quarante-cinq minutes plus haut.

**Le point clé, c'est la manière de l'installer.** Ne commence pas au niveau maximal sur une base existante : tu obtiendras quatre mille erreurs, l'équipe fermera l'onglet, et l'outil sera classé « inutilisable » pour deux ans.

La bonne méthode est un cliquet. On mesure le niveau que la base tient déjà. On gèle tout l'existant dans une baseline — un fichier qui dit « ces erreurs-là sont connues, on ne les compte pas aujourd'hui ». Et on met la barrière en CI.

```neon
# phpstan.neon
parameters:
    level: 6
    paths: [src]
    baseline: phpstan-baseline.neon
```

À partir de cet instant, il se passe deux choses. Aucune nouvelle erreur ne peut entrer : la CI refuse. Et la baseline ne fait que décroître, parce que chaque fichier touché est mis à niveau au passage.

Six mois plus tard, on monte d'un niveau. Puis encore. Sans jamais bloquer personne, sans jamais négocier, sans jamais faire de grand chantier.

En cuisine, c'est la règle du poste : tu ne laisses pas ton plan de travail plus sale que tu l'as trouvé. Aucune journée de grand nettoyage n'est nécessaire si personne ne salit plus.

### 3. La CI est la barrière, pas le tableau de bord

Une intégration continue qui affiche un statut sans rien empêcher n'est pas une barrière. C'est une décoration.

Le pipeline minimal qui tient :

- le formateur vérifie le style — échec bloquant ;
- l'analyse statique tourne — échec bloquant ;
- les tests s'exécutent — échec bloquant ;
- rien ne fusionne si l'un des trois est rouge.

Et une règle d'hygiène non négociable : **une CI rouge se répare tout de suite, avant toute autre chose.** Une équipe qui tolère le rouge pendant trois jours vient d'apprendre à ne plus regarder le rouge. À partir de là, tu as tous les coûts de l'outillage et aucun de ses bénéfices.

Un feu rouge qu'on grille est pire que pas de feu du tout : les autres ont cessé de se méfier.

### 4. Ce qui reste pour les humains

Une fois le style, les types et les régressions traités par la machine, la revue de code change de nature. Elle ne dure plus quarante-cinq minutes et elle porte enfin sur les seules questions qu'aucun outil ne saura poser :

- Est-ce qu'on résout le bon problème ?
- Est-ce que ce nom dit ce que le métier appelle vraiment comme ça ?
- Est-ce que cette règle a le droit de vivre ici, ou est-ce qu'elle appartient au domaine ?
- Est-ce que quelqu'un qui arrive dans six mois comprendra pourquoi cette décision a été prise ?

Ces questions valent le temps de trois personnes. « Il manque une ligne vide » ne l'a jamais valu.

## Ce que tu peux retenir

1. Un outil négligé ne ralentit pas seulement : il blesse. Le couteau émoussé dérape.
2. Tout ce qu'une machine peut vérifier ne doit jamais atteindre un humain.
3. Une convention non exécutable est un vœu. Elle devient une règle le jour où la CI la fait respecter.
4. Ajouter des relecteurs dilue la responsabilité au lieu de l'augmenter.
5. Le gardien senior attrape les erreurs et empêche l'équipe d'apprendre à les voir.
6. Sur une base existante : baseline, barrière en CI, montée par cliquet. Jamais le niveau maximal du premier coup.
7. Une CI rouge tolérée est une CI morte. Elle se répare avant tout le reste.
8. L'attention humaine est ta ressource la plus chère. Dépense-la sur le sens, pas sur la syntaxe.

## Le test de la semaine prochaine

Reprends tes cinq dernières pull requests et classe chaque commentaire en deux tas : ce qu'une machine aurait pu dire, et ce que seul un humain pouvait dire.

Fais le ratio.

C'est le pourcentage exact de l'attention de ton équipe que tu peux récupérer cette semaine, avec deux fichiers de configuration.

## Pour aller plus loin

L'outillage se met en place en une journée. Le faire adopter sans que l'équipe le vive comme une surveillance, choisir le bon niveau de départ, tenir le cliquet dans la durée : c'est là que ça se joue, et c'est rarement une question technique.

- **Le micro-audit** — où en est réellement votre base, quel niveau elle tient déjà, et la première marche à poser.
- **L'atelier** — une journée pour installer la chaîne complète sur votre code et voir ce qu'elle attrape immédiatement.
- **Le mentorat** — l'accompagnement dans la durée, jusqu'à ce que le geste soit à vous.

Trente minutes pour en parler, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Et sur ta dernière revue de code : combien de minutes ont porté sur quelque chose qu'un ordinateur aurait pu dire à ta place ?
