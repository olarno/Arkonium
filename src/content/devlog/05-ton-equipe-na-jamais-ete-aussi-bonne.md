---
title: "Ton équipe n'a jamais été aussi bonne. Et elle n'a jamais livré aussi lentement."
date: 2026-05-05
numero: "05"
tag: "architecture"
description: "Personne n'est parti, tout le monde a progressé, et chaque feature coûte plus cher que la précédente. Pourquoi embaucher, resserrer le process et sortir l'IA n'y changent rien — et ce qui marche vraiment."
draft: false
---

Il y a une conversation que j'ai eue tellement de fois qu'elle a fini par avoir un décor fixe dans ma tête. Une salle de réunion, un tableau de bord projeté, et un directeur technique qui dit à peu près ceci :

« Je ne comprends pas. L'équipe est meilleure qu'il y a deux ans. Personne n'est parti. On a même recruté deux seniors. Et on livre moins qu'avant. »

Le chiffre qu'il me montre ce jour-là : une feature qui aurait pris quatre jours il y a trois ans en prend maintenant onze. Pas une grosse feature. Un champ supplémentaire dans un formulaire, propagé jusqu'à la facturation.

Onze jours.

Et le pire, c'est que personne dans l'équipe n'a rien à se reprocher. Ils sont bons. Ils bossent. Ils font des revues. Ils ne sont pas lents.

C'est le système sous eux qui l'est devenu.

## Ce que tout le monde essaie d'abord (et pourquoi ça ne marche pas)

Quand la vélocité baisse, on ne reste pas les bras croisés. On essaie des trucs. Voici les quatre que je vois le plus souvent, dans cet ordre, presque toujours.

### Tentative 1 : ajouter des développeurs

C'est la réponse la plus intuitive. Ça va deux fois moins vite, donc il faut deux fois plus de monde.

Sauf que la nouvelle recrue va passer trois semaines à comprendre où vit la règle de calcul du prix. Et pour les comprendre, elle va monopoliser les deux personnes qui savent encore. Tu viens d'ajouter un producteur et de retirer deux experts du terrain.

Six mois plus tard, l'équipe a grossi de 30 % et livre autant. Parfois moins, parce que maintenant il faut coordonner.

Le vrai problème n'était pas un manque de bras. C'était un coût de compréhension.

### Tentative 2 : resserrer le process

Alors on serre. Des tickets mieux découpés, des estimations en points, un daily plus cadré, une définition de « fini » affichée au mur, une rétro toutes les deux semaines.

Ça a une vraie vertu : ça rend la lenteur visible. On voit enfin où le temps part.

Mais un process ne produit pas de vitesse. Il produit de la lisibilité sur la vitesse qu'on a. Tu peux mesurer très précisément que ta voiture roule à 30 km/h. Le compteur ne va pas la faire accélérer.

Et à la longue, le process ajouté sur un système douloureux devient de la charge mentale supplémentaire. On finit par avoir un rituel pour parler du problème plutôt qu'un moment pour le régler.

### Tentative 3 : les outils, et maintenant l'IA

Nouvel IDE, nouvelle CI, nouvel outil de suivi. Puis, depuis deux ans : les assistants de génération de code.

Là, il faut être précis, parce que c'est le sujet du moment et que je ne suis pas en train de dire que l'IA ne sert à rien. Elle m'a fait passer un cadrage de projet de trois jours à deux heures. Elle est redoutable.

Mais elle accélère l'écriture. Or dans une équipe qui ralentit, l'écriture n'a jamais été le goulot.

Décompose une journée de dev sur une base ancienne : comprendre le code existant, retrouver où la règle est implémentée, vérifier qu'on ne casse rien ailleurs, attendre la recette, corriger la régression qu'on n'avait pas vue. L'écriture, là-dedans, c'est peut-être 20 % du temps.

Générer du code plus vite dans un système que personne ne comprend, ça ne le rend pas plus rapide. Ça le rend plus gros. Sans culture d'ingénierie, le code généré, c'est de la dette technique à vitesse industrielle.

### Tentative 4 : la semaine de refactoring négociée

Celle-là, c'est la plus honnête des quatre. L'équipe monte au créneau, obtient une semaine « technique » avant la prochaine grosse livraison.

Cinq jours plus tard : quelques classes nettoyées, du code mort supprimé, un peu de couverture de tests en plus. Tout le monde est content. Et trois mois après, on est exactement au même point.

Pourquoi ? Parce qu'une semaine de refactoring, c'est un grand ménage de printemps dans une maison où personne ne fait la vaisselle le reste de l'année. Tu ne changes pas l'état de la maison. Tu changes son état pendant une semaine.

Le refactoring n'est pas une tâche qu'on négocie. C'est une hygiène qu'on installe.

## Le vrai diagnostic : le temps ne part pas dans le développement, il part dans la peur

Voilà ce que je trouve quand j'ouvre ces bases de code, presque à chaque fois.

La logique métier n'a pas de domicile.

Elle est partout : un bout dans le contrôleur, un bout dans l'entité, un bout dans un `Manager` de 900 lignes, un bout dans un `trait` que trois classes utilisent, un bout dans un `listener` Doctrine que personne n'a documenté, un bout dans une procédure stockée écrite en 2019.

Quand un développeur doit modifier la règle de calcul du prix, il ne modifie pas « la règle ». Il part en expédition. Il lit, il grep, il ouvre huit fichiers, il demande à un collègue, il finit par trouver quatre endroits, et il n'est jamais sûr qu'il n'y en a pas un cinquième.

Puis il change. Et il attend.

C'est ça, les onze jours. Ce n'est pas onze jours de développement. C'est un jour de développement et dix jours d'incertitude.

Tu ne verras jamais ça dans un tableau de bord. Mais tu l'entends, tous les jours, dans le vocabulaire de l'équipe :

- « on préfère ne pas y toucher »
- « c'est risqué, on verra au prochain sprint »
- « celui qui a écrit ça est parti »
- « ça marche, on ne sait pas trop pourquoi »

Ce vocabulaire, c'est ton vrai indicateur de vélocité.

## La bascule : rendre le métier visible et testable

Le moment où ça change, ce n'est pas un moment de motivation. C'est un moment de rangement.

Le principe tient en une phrase : **ton métier ne devrait pas savoir dans quel framework il tourne.**

Symfony, Laravel, Rails, Spring : c'est de la plomberie. Excellente plomberie. Mais la plomberie fait circuler l'eau, elle ne décide pas de ce qu'il y a dans le verre. Le jour où ta logique de facturation dépend d'une requête HTTP et d'un ORM pour exister, tu ne peux plus ni la lire, ni la tester, ni la faire évoluer sans monter tout l'immeuble.

Concrètement, sur cette base-là, on a commencé par une seule règle. La plus douloureuse. Celle du calcul de prix.

Avant, ça ressemblait à ça, éclaté sur quatre fichiers :

```php
// Dans le contrôleur
$prix = $commande->getTotal();
if ($client->getType() === 'pro' && $prix > 1000) {
    $prix = $prix * 0.9;
}
// ... et 60 lignes plus bas, un autre if sur le type de client
```

Après, la règle a une adresse, un nom, et elle se lit à voix haute :

```php
final class RemiseVolumeProfessionnel implements Remise
{
    public function estApplicable(Client $client, Montant $total): bool
    {
        return $client->estProfessionnel()
            && $total->estSuperieurA(Montant::euros(1000));
    }

    public function appliquer(Montant $total): Montant
    {
        return $total->moins($total->pourcentage(10));
    }
}
```

Ce n'est pas plus « joli ». Ce n'est pas de l'esthétique. C'est que maintenant :

- la règle est à un seul endroit, donc on la change une fois ;
- elle est testable en trois lignes, sans base de données ni requête HTTP ;
- elle porte un nom que le comptable comprend, donc on peut vérifier avec lui qu'elle est juste ;
- le jour où le marketing veut une remise différente, on ajoute une classe au lieu d'éventrer un `if`.

Et la conséquence, c'est celle qui compte : **le test devient possible, donc la peur baisse, donc la vitesse revient.**

Un test n'est pas un contrôle qualité. C'est un filet. Sans filet, personne ne refactore : on prie. Avec un filet, un développeur ose ouvrir un fichier qu'il ne connaît pas.

### Pas de grand soir

Le piège, à ce stade, c'est d'annoncer la réécriture complète. Ne le fais pas. J'y consacrerai un article entier, mais le résumé tient en une ligne : les grandes réécritures échouent parce qu'elles demandent de tout comprendre avant de rien livrer.

La méthode qui tient, c'est l'inverse : la prochaine feature sert de prétexte. On ne range pas la maison entière. On range la pièce dans laquelle on entre, à chaque fois qu'on y entre. Six mois plus tard, les pièces où l'équipe travaille vraiment sont propres — et ce sont les seules qui coûtaient cher.

En cuisine, on appelle ça la mise en place. Tu ne nettoies pas ton poste à la fin du service. Tu le nettoies pendant, sinon tu coules au coup de feu. Ce n'est pas de la coquetterie, c'est ce qui rend la vitesse possible.

## Ce que ça donne, en vrai

Sur les équipes que j'accompagne, les trois chiffres qui bougent en premier sont toujours les mêmes :

- **le temps de correction divisé par environ 3** — parce qu'on ne cherche plus où la règle vit ;
- **le taux de régression qui tombe autour de 1 %** — parce que le filet existe enfin là où ça compte ;
- **l'onboarding d'un nouveau sur une zone qui passe à une trentaine de minutes** — parce que le code raconte ce qu'il fait.

Aucun de ces gains ne vient d'un outil. Tous viennent d'une discipline installée dans l'équipe.

## Ce que tu peux retenir

1. Une équipe qui ralentit alors qu'elle progresse a un problème de système, pas de personnes. Cherche le système.
2. Embaucher, resserrer le process, changer d'outil : ces réponses traitent la douleur, jamais la cause.
3. Le coût réel n'est pas d'écrire du code. C'est de le comprendre et de ne pas casser autre chose.
4. La question à poser à ton équipe cette semaine : « si je vous demande où vit la règle X, en combien de temps vous me la montrez ? » La réponse te donne ton diagnostic.
5. Le métier doit avoir une adresse dans ton code. Le reste — framework, base, API — n'est que la plomberie autour.
6. On ne range pas tout. On range ce qu'on touche, à chaque fois qu'on le touche.

## Si tu dois convaincre quelqu'un qui ne code pas

C'est souvent là que ça bloque. Le développeur sait ce qui ne va pas, mais n'a pas les mots pour l'expliquer à un décideur.

Essaie celui-ci : *« Notre code, c'est une cuisine où les ingrédients ne sont pas rangés. Chaque plat est faisable, mais chaque plat demande de fouiller. On ne manque pas de cuisiniers. On manque de rangement. Et le rangement, ça ne se fait pas un samedi — ça se fait à chaque service. »*

Ça marche parce que c'est vrai, et parce que personne n'a besoin de comprendre ce qu'est une injection de dépendances pour le voir.

## Pour aller plus loin

Chez Arkonium, ça commence toujours petit, et dans cet ordre :

- **Le micro-audit** — un regard extérieur sur votre base, et l'écart entre ce qu'elle est et ce qu'elle pourrait être, noir sur blanc. Pas un rapport de 40 pages : les trois choses qui vous coûtent le plus, et par quoi commencer lundi.
- **L'atelier** — une journée, équipe et décideurs dans la même pièce, à refactorer une vraie base en direct. On repart avec une méthode, pas avec un show.
- **Le mentorat** — la culture d'ingénierie qui s'installe pour de bon : revues, architecture, pratiques, jusqu'à ce que vous n'ayez plus besoin de nous. On ne répare pas votre code. On apprend à vos équipes à le faire tenir.

Si ce que tu viens de lire ressemble à tes trois derniers sprints, on peut en parler trente minutes, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Et en attendant : chez toi, combien de zones du code sont dans la catégorie « on préfère ne pas y toucher » ?
