# Préparer le projet pour la mise en prod

## 1. Configuration de l'environnement
Créer un fichier `/server/.env` identique à `/server/.env.example`.

Remplacer `JWT_SECRET` par une chaîne de caractères aléatoire de 128 caractères.

Commande pour générer le secret :
```bash
node -e "console.log(require('crypto').randomBytes(128).toString('hex'))"
```

## 2. Initialisation de la Base de Données
Créer la base de données `/server/database/appAbsences.db` en exécutant la commande suivante à la racine :

```bash
sqlite3 server/database/appAbsences.db < server/database/schema.sql
```

## 3. Lancement du projet
Lancer le projet avec la commande suivante à la racine :

```bash
npm run prod
```

## 4. Intégration Continue (CI)
En CI, il suffit de relancer `npm run prod` pour que tout soit mis à jour (installation des dépendances, build client, etc.).