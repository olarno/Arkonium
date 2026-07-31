---
title: "Le coup de feu : pourquoi ta page met huit secondes"
date: 2026-03-30
numero: "03"
tag: "performance"
description: "Un service, c'est soixante couverts en quatre-vingt-dix minutes. Rien ne se prépare pendant. Le jour où ta page rame, la question n'est pas combien de serveurs ajouter — c'est ce que tu es en train de préparer à la commande."
draft: false
---

Un service de restaurant, c'est soixante couverts en quatre-vingt-dix minutes. Une brigade de six. Et une règle qui explique tout le reste : **pendant le coup de feu, on assemble, on ne prépare pas.**

Le fond a mijoté six heures ce matin. La purée est en bain-marie. Les portions sont pesées, filmées, empilées dans l'ordre des cuissons. Quand la commande tombe, il ne reste que des gestes courts et connus.

Le jour où un cuisinier décide d'émincer ses échalotes à la commande, le service ne ralentit pas un peu. Il s'effondre. Pas parce que le geste est long — il prend quarante secondes — mais parce qu'il est répété soixante fois, en série, pendant que tout le monde attend derrière.

C'est très exactement ce qui se passe dans ta page à huit secondes.

## Le problème : la page qui rame le lundi matin

La scène est banale. Une liste de commandes, une centaine de lignes par écran. Rapide en local, correcte en recette, et le lundi matin en production : huit à douze secondes.

Tout le monde a une théorie. La base est trop petite, il y a trop de monde connecté, PHP est lent, il faudrait passer à autre chose.

Personne n'a de mesure.

## Ce qu'on essaie avant de mesurer

### Tentative 1 : mettre un cache devant

C'est le réflexe numéro un, et c'est souvent le plus coûteux à long terme.

On pose Redis devant la page. Cinq minutes de TTL. Le lundi matin, l'utilisateur qui arrive en premier attend toujours douze secondes ; les suivants ont leur page instantanément. Le tableau de bord passe au vert.

Deux semaines plus tard, un premier ticket : « les nouvelles commandes n'apparaissent pas tout de suite ». Puis un autre : « j'ai modifié le statut, l'écran affiche encore l'ancien ». Alors on ajoute de l'invalidation. L'invalidation devient un sujet à elle seule, avec ses propres bugs, plus difficiles à reproduire que le problème d'origine.

**Le cache, c'est la lampe chauffante.** Elle sert à quelque chose, et à sa place elle est indispensable. Mais elle garde au chaud un plat déjà fait — elle ne le cuisine pas mieux, et elle ne dit rien du fait que ta cuisson prend dix minutes de trop. Le cache posé avant la mesure ne résout pas la lenteur : il l'emballe, et il ajoute par-dessus un problème de cohérence.

### Tentative 2 : ajouter de la machine

Deuxième réponse : plus de RAM, plus de CPU, une instance de base plus grosse. Parfois trois fois le budget d'infrastructure.

Le gain est réel et décevant : douze secondes passent à huit. Parce que le problème n'était pas un manque de puissance, c'était un nombre d'allers-retours. Un livreur deux fois plus rapide ne compense pas sept cents allers-retours au frigo.

Cette tentative a un mérite quand même : elle donne le diagnostic à l'envers. Si tripler la machine ne divise pas le temps, ce n'est pas la machine.

### Tentative 3 : paginer plus fin

On réduit de cent lignes à vingt-cinq. La page passe à trois secondes.

Sauf que l'utilisateur qui devait voir cent lignes clique maintenant quatre fois. Le temps total de son travail n'a pas bougé, il est juste découpé. Et surtout : la lenteur au ligne près est toujours là, on l'a simplement mise sous le seuil de la plainte.

Diviser le symptôme par quatre n'est pas une correction. C'est un déguisement.

### Tentative 4 : tout passer en asynchrone

Dernière tentative, la plus ambitieuse : on sort le calcul de la requête, on le met dans une file, et l'écran s'actualise quand c'est prêt.

C'est parfois la bonne réponse. Souvent, c'est une manière très élaborée de déplacer le problème : le calcul lent est toujours lent, il occupe maintenant un worker, et tu as ajouté une file, un état intermédiaire, une gestion d'échec, et une interface qui doit afficher « en cours de traitement ».

Tu n'as pas raccourci la préparation. Tu l'as envoyée dans une autre pièce.

## Le vrai diagnostic : sept cent quarante-trois requêtes

Le profileur, lui, met dix secondes à répondre. Sur cette page :

**743 requêtes SQL. 6,9 secondes cumulées.**

Une pour récupérer les commandes. Et 742 pour aller chercher, une par une, ligne par ligne, le client de chaque commande et les articles de chaque commande.

C'est le N+1. Le nom est technique, le geste ne l'est pas : c'est le commis qui retourne au frigo pour chaque assiette, au lieu de sortir son bac une fois.

```php
$commandes = $repository->findBy(['statut' => 'en_cours']); // 1 requête

foreach ($commandes as $commande) {
    echo $commande->getClient()->getNom();        // +1 requête, à chaque tour
    echo count($commande->getLignes());           // +1 requête, à chaque tour
}
```

Rien dans ce code ne ressemble à une erreur. C'est même du code élégant : l'ORM fait son travail, il va chercher ce dont tu as besoin quand tu en as besoin. C'est ça, le piège du chargement paresseux — il rend invisible le coût de chaque accès.

En local, avec douze commandes de test, ça fait vingt-cinq requêtes et personne ne voit rien. En production, avec trois cent soixante commandes en cours un lundi matin, ça fait sept cent quarante-trois.

**La lenteur n'apparaît pas en production. Elle y devient visible.**

## La bascule : mesurer, puis préparer avant le service

### 1. Mesurer d'abord. Toujours.

La règle qui n'a pas d'exception : **aucune optimisation sans mesure préalable.**

Sans mesure, tu optimises ce que tu crois. Or l'intuition d'un développeur sur la performance a un taux de réussite comparable au hasard — j'ai vu des équipes passer une semaine à réécrire un algorithme de tri qui pesait quatre millisecondes, pendant qu'un index manquant en pesait deux mille.

Ce dont tu as besoin tient en trois chiffres : combien de requêtes, quelle durée cumulée, combien de temps dans PHP. Le profileur de ton framework les donne en local. Un profileur de production les donne là où ça compte. Et pour une requête suspecte, `EXPLAIN` te dit en une ligne si ta base lit un index ou toute la table.

Dix minutes de mesure valent trois jours de refonte à l'aveugle.

### 2. Sortir ses bacs une fois

La correction du N+1 ne demande pas d'architecture. Elle demande de dire ce qu'on veut, en une fois.

```php
$commandes = $repository->createQueryBuilder('c')
    ->select('c', 'client', 'lignes')
    ->leftJoin('c.client', 'client')
    ->leftJoin('c.lignes', 'lignes')
    ->where('c.statut = :statut')
    ->setParameter('statut', StatutCommande::EnCours)
    ->getQuery()
    ->getResult();
```

743 requêtes deviennent 1. Le temps passe de 6,9 secondes à environ 80 millisecondes.

Aucun serveur ajouté. Aucun cache. Six lignes.

C'est la mise en place : tu as regardé la commande entière avant de partir au frigo, et tu as tout sorti d'un coup.

### 3. Séparer ce qu'on lit de ce qu'on écrit

Le geste précédent règle la page. Le geste suivant règle la catégorie.

Un modèle métier riche — avec ses règles, ses invariants, ses objets qui se protègent — est fait pour **décider**. Il est excellent pour ça et médiocre pour afficher un tableau de trois cents lignes, parce qu'il charge des objets complets là où l'écran veut quatre colonnes.

Alors pour les écrans de lecture, on arrête de passer par lui :

```php
// Ce que l'écran demande, exactement, et rien d'autre.
$lignes = $connection->fetchAllAssociative(<<<'SQL'
    SELECT c.reference, cl.nom, c.total_cents, c.cree_le
    FROM commande c
    JOIN client cl ON cl.id = c.client_id
    WHERE c.statut = :statut
    ORDER BY c.cree_le DESC
SQL, ['statut' => 'en_cours']);
```

Ce n'est pas un retour en arrière, et ce n'est pas « du sale ». C'est la reconnaissance qu'écrire et lire sont deux métiers différents. En cuisine, le chaud et le froid ne partagent pas le même poste, les mêmes outils ni les mêmes gestes — non pas par tradition, mais parce que les contraintes ne sont pas les mêmes.

Le jour où cette séparation existe, l'écriture peut rester rigoureuse et protégée, et la lecture peut être directe et rapide, sans que l'une abîme l'autre.

### 4. Et alors, seulement, le cache

Une fois qu'une page fait 1 requête et 80 millisecondes, la question du cache redevient saine : on ne l'utilise plus pour masquer un défaut, mais pour éviter un travail légitime déjà fait.

La lampe chauffante après la cuisson. Jamais à la place.

## Ce que tu peux retenir

1. Une page lente est presque toujours un problème de nombre d'allers-retours, pas de puissance.
2. Aucune optimisation sans mesure. L'intuition d'un développeur sur la performance vaut à peu près un tirage à pile ou face.
3. Le chargement paresseux ne coûte rien à écrire et beaucoup à exécuter. C'est ce qui le rend invisible en revue de code.
4. Le cache posé avant la mesure emballe le problème et en ajoute un deuxième : la cohérence.
5. Trois chiffres suffisent à démarrer : nombre de requêtes, temps SQL cumulé, temps PHP. Et `EXPLAIN` pour la requête suspecte.
6. Lire et écrire sont deux métiers. Le modèle riche décide ; la lecture d'écran peut être directe.
7. La production ne crée pas la lenteur. Elle la révèle, avec un volume que ton jeu de données de test n'a jamais.

## Le test de dix minutes

Ouvre ta page la plus consultée. Regarde le compteur de requêtes de ton profileur.

Puis pose-toi la seule question qui compte : **est-ce que ce nombre augmente quand il y a plus de lignes à l'écran ?**

Si oui, tu as un N+1. Peu importe la taille de la page aujourd'hui : tu as une lenteur qui grandit avec ton succès.

## Pour aller plus loin

Corriger un N+1 prend une heure. Faire en sorte qu'une équipe les voie avant la production — en revue, en local, dans le geste quotidien — c'est autre chose, et ça ne s'obtient pas en envoyant un lien vers la documentation.

- **Le micro-audit** — vos pages les plus coûteuses, mesurées, chiffrées, avec les trois corrections qui rendent le plus. Pas quarante pages de rapport.
- **L'atelier** — une journée à profiler et refactorer en direct, sur une vraie base. L'équipe voit le compteur passer de 743 à 1, et comprend pourquoi.
- **Le mentorat** — les réflexes qui s'installent et restent quand on n'est plus là.

Trente minutes pour en parler, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Et chez toi, la dernière fois qu'une page a été jugée lente, quelqu'un a-t-il mesuré avant de proposer une solution ?
