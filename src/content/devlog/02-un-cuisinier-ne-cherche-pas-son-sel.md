---
title: "Un cuisinier ne cherche pas son sel pendant le service"
date: 2026-02-16
numero: "02"
tag: "clean-code"
description: "La mise en place, c'est le contrat le plus dur de la cuisine : tout est prêt avant que ça commence. Ton code, lui, part chercher ses ingrédients en pleine exécution — et c'est de là que viennent tes null."
draft: false
---

En cuisine, il y a une règle qui ne se négocie pas : **quand le service commence, on ne prépare plus rien.**

Tout est fait avant. Les fonds sont tirés, les légumes taillés, les sauces montées, les portions pesées, les bacs à leur place exacte — la même place tous les jours, pour que la main y aille sans que l'œil regarde. Ça s'appelle la mise en place, et ça occupe l'essentiel de la journée d'un cuisinier. Le service, lui, c'est deux heures où plus personne ne réfléchit.

Un commis qui part chercher son sel à 19h40 ne ralentit pas seulement son plat. Il bloque le passe, décale les trois tables suivantes, et fait sortir en retard le travail de quatre autres personnes. C'est pour ça qu'on ne le juge pas sur son coup de feu. On le juge sur sa mise en place.

Il y a exactement le même contrat dans le code. Presque personne ne le tient.

## Le problème : l'objet qui naît à moitié

Le point de départ, dans cette équipe-là, c'était une erreur en production. Une seule, mais tenace :

```
Call to a member function getEmail() on null
```

Une réservation, quelque part dans le système, existait sans client. Pas beaucoup : une sur mille peut-être. Assez pour tomber la nuit, réveiller quelqu'un, et repartir avant qu'on ait compris.

En remontant, on tombe sur ceci — et c'est du code parfaitement ordinaire, écrit par des gens sérieux :

```php
$reservation = new Reservation();
$reservation->setClient($client);
$reservation->setDate($date);
$reservation->setNombreCouverts($couverts);
$reservation->setStatut('en_attente');

$this->em->persist($reservation);
```

Entre la première ligne et la dernière, il existe un objet `Reservation` qui n'est pas une réservation. C'est une coquille. Elle a un type, elle a une adresse mémoire, elle n'a aucun sens métier.

Et cinq lignes, c'est cinq occasions : un `return` anticipé, une exception levée par un validateur au milieu, un branchement `if` qui saute le troisième setter, un développeur qui copie le bloc ailleurs et en oublie deux.

C'est un commis qui commence son plat et part chercher le sel au milieu.

## Ce qu'on essaie pour colmater

### Tentative 1 : vérifier partout

Le premier réflexe est défensif. Puisqu'un objet peut être incomplet, on se protège à chaque usage.

```php
if ($reservation->getClient() !== null) {
    $email = $reservation->getClient()->getEmail();
}
```

Multiplie ça par les quarante endroits qui manipulent une réservation. Tu viens de payer un impôt permanent sur une erreur commise une fois, à la construction. Et le pire, c'est le silence : le `if` ne corrige rien, il cache. La réservation sans client existe toujours, mais maintenant elle ne crie plus. Elle produit juste un mail qui ne part pas.

Corriger un problème de construction par de la vérification à l'usage, c'est goûter chaque assiette pour vérifier qu'on a bien salé, au lieu de saler.

### Tentative 2 : la méthode `init()`

Deuxième idée, plus structurée : puisque l'objet a besoin de plusieurs choses, on regroupe.

```php
$reservation = new Reservation();
$reservation->init($client, $date, $couverts);
```

C'est mieux rangé. Ça ne change rien au fond : il existe toujours une fenêtre pendant laquelle l'objet est invalide, et rien dans le langage n'oblige qui que ce soit à appeler `init()`. Tu as écrit une règle. Tu n'as pas donné au compilateur les moyens de la faire respecter.

Une règle que seule la discipline fait tenir tiendra jusqu'à la première mauvaise journée de quelqu'un.

### Tentative 3 : le conteneur injecté partout

Variante côté services, celle-là. Un service a besoin d'une dépendance de temps en temps, alors plutôt que de la déclarer, on lui donne les clés du garde-manger entier :

```php
public function __construct(private ContainerInterface $container) {}

public function traiter(Reservation $r): void
{
    $mailer = $this->container->get('mailer');
    // ...
}
```

Ça marche. Et ça détruit une information capitale : **la signature ne dit plus de quoi cette classe a besoin.** Pour le savoir, il faut lire tout le corps. Pour la tester, il faut simuler un conteneur. Pour comprendre l'impact d'un changement, il faut chercher à la main.

C'est un poste de travail sans bacs, avec une porte vers la réserve. Chaque geste devient un déplacement.

### Tentative 4 : valider à la fin

Dernière tentative, la plus courante en Symfony : on laisse construire n'importe comment, et on met un validateur en bout de chaîne.

```php
#[Assert\NotNull]
private ?Client $client = null;
```

C'est utile — pour ce que c'est. La validation de formulaire protège la frontière du système contre les saisies humaines. Elle ne protège pas ton métier contre ton propre code : le batch nocturne, l'import CSV, le webhook, la commande console et le test d'intégration ne passent pas par le validateur. Ils passent par le constructeur.

Tu as mis un contrôle à l'entrée de la salle. La cuisine a cinq autres portes.

## La bascule : le constructeur est ta mise en place

Le principe tient en une phrase, et c'est la traduction exacte de la règle du service :

**Un objet naît valide, ou il ne naît pas.**

Pas d'état intermédiaire, pas de fenêtre, pas de « on complètera après ». Ce qui est nécessaire est exigé à la construction. Ce qui est exigé est vérifié une fois, à un seul endroit.

```php
final class Reservation
{
    private function __construct(
        private readonly Client $client,
        private readonly Creneau $creneau,
        private readonly NombreCouverts $couverts,
        private StatutReservation $statut,
    ) {}

    public static function demander(
        Client $client,
        Creneau $creneau,
        NombreCouverts $couverts,
    ): self {
        if ($creneau->estPasse()) {
            throw new CreneauInvalide('On ne réserve pas dans le passé.');
        }

        return new self($client, $creneau, $couverts, StatutReservation::EnAttente);
    }
}
```

Trois choses ont changé, et chacune vaut le détour.

**Le type fait le travail.** `Client` n'est pas `?Client`. Il n'y a plus de branche à écrire, plus de `if ($client !== null)` dans les quarante appelants. Le langage garantit ce que la discipline garantissait mal.

**Le constructeur nommé raconte l'intention.** `Reservation::demander(...)` dit ce qui se passe. `new Reservation()` ne dit rien. Et quand une deuxième façon de créer une réservation apparaît — `Reservation::importerDepuisAncienSysteme(...)` — elle a son propre nom, ses propres règles, et on ne les confond pas.

**L'erreur arrive tôt.** Un créneau passé lève une exception à la construction, pas trois couches plus loin. La cuisine refuse à la porte l'ingrédient qui n'est pas bon. Elle ne le met pas de côté « au cas où ».

### Le même geste sur les valeurs

`NombreCouverts` et `Creneau` ne sont pas de la décoration. C'est le même principe, un cran plus bas.

```php
final class NombreCouverts
{
    private function __construct(public readonly int $valeur) {}

    public static function de(int $valeur): self
    {
        if ($valeur < 1 || $valeur > 12) {
            throw new NombreCouvertsInvalide(
                "Une réservation va de 1 à 12 couverts, reçu : $valeur."
            );
        }

        return new self($valeur);
    }
}
```

Avec un `int`, la règle « entre 1 et 12 » vit dans chaque endroit qui manipule un nombre de couverts. Il y en a sept, tu en connais quatre. Avec ce type, elle vit dans un fichier et il devient **impossible** de fabriquer une valeur invalide ailleurs dans l'application.

C'est la différence entre écrire « ne pas dépasser 4°C » sur une affiche et acheter un frigo qui ne monte pas au-dessus de 4.

### Et pour les services : tout par le constructeur

Même règle, appliquée aux dépendances.

```php
public function __construct(
    private readonly ReservationRepository $reservations,
    private readonly NotificateurClient $notificateur,
) {}
```

La signature devient la fiche technique de la classe. Elle t'apprend en trois secondes ce dont ce code a besoin pour fonctionner. Elle rend le test possible sans infrastructure. Et elle te donne un signal d'alerte gratuit : le jour où ton constructeur demande neuf dépendances, ce n'est pas un problème d'injection — c'est que ta classe fait neuf métiers.

Un poste avec trop de bacs n'est pas un poste bien équipé. C'est deux postes.

## Ce que ça change concrètement

Sur cette base, une fois le geste installé sur les cinq objets centraux du domaine :

- la classe d'erreurs `Call to a member function ... on null` a disparu des logs de production ;
- les tests de ces objets ne demandent plus ni base de données ni conteneur — ils s'écrivent en trois lignes et tournent en millisecondes ;
- et une chose plus discrète, mais que l'équipe a remarquée en premier : les revues de code ont cessé de parler de cas limites. Les cas limites ne pouvaient plus être écrits.

Le service se passe bien quand la mise en place a été faite. Ce n'est pas une jolie phrase, c'est de la mécanique.

## Ce que tu peux retenir

1. Un objet à moitié construit est une bombe à retardement avec une amorce aléatoire. Le temps entre le `new` et le dernier setter, c'est la durée de l'amorce.
2. Vérifier partout à l'usage, c'est payer chaque jour une erreur commise une fois. Corrige à la construction.
3. Une règle que seule la discipline fait respecter n'est pas une règle. Fais-la porter par le type.
4. Nomme tes constructeurs. `Reservation::demander()` porte une intention ; `new Reservation()` porte un vide.
5. La validation de formulaire protège la frontière humaine du système. Elle ne protège pas ton métier de ton propre code.
6. Un constructeur qui demande neuf dépendances ne te dit pas d'ajouter un conteneur. Il te dit que la classe fait trop de choses.
7. Le geste à installer tient en une phrase : ce qui est nécessaire est exigé à la naissance.

## Le test de cinq minutes

Ouvre ta classe métier la plus importante — celle qui coûte le plus cher quand elle se trompe.

Compte ses setters publics. Puis compte combien de combinaisons d'appels produisent un objet qui n'a aucun sens métier.

Si tu ne peux pas répondre, c'est déjà la réponse.

## Pour aller plus loin

Ce geste-là ne s'apprend pas en lisant un article. Il s'apprend en le faisant sur son propre code, avec quelqu'un à côté qui dit « là, tu viens de rouvrir la fenêtre ».

C'est précisément le format de **l'atelier Arkonium** : une journée, l'équipe et les décideurs ensemble, à refactorer une vraie base — la vôtre si un micro-audit a été fait. On repart avec des gestes, pas avec des slides. Et si l'objectif est que ça tienne après notre départ, c'est **le mentorat** : on ne répare pas votre code, on apprend à vos équipes à le faire tenir.

Trente minutes pour en parler, sans jargon et sans engagement : [planifier un appel](https://cal.com/arnaud-oltra-7js2wv/15min).

Une dernière question avant de fermer l'onglet : dans ton code, combien d'objets peuvent exister aujourd'hui dans un état que personne n'a jamais voulu ?
