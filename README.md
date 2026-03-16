# Projet L3 - Serveur + Client

## 1. Prérequis et Versions conseillées

Pour garantir le bon fonctionnement du projet, il est recommandé d'utiliser les versions suivantes. Ces versions correspondent à l'environnement de développement initial :

* **Node.js** : v23.11.0
* **npm** : v10.9.2
* **React** : v19.2.1

## 2. Commandes de lancement (Scripts)

À la racine du projet, plusieurs commandes sont configurées dans le `package.json` pour lancer l'application selon vos besoins :

### Mode Développement
* **`npm run dev`** : Lance simultanément le serveur (avec rechargement automatique via `nodemon`) et le client (en mode développement). C'est la commande principale à utiliser lors du développement. Les logs du serveur s'afficheront en jaune et ceux du client en bleu.

💡 **Note pour le développement :** Une fois l'application lancée via `dev`, elle est accessible par défaut sur le port `5173` (**http://localhost:5173**).

### Mode Production
* **`npm run quick-prod`** : Build l'application React côté client, puis lance le serveur Node.js. Utile en développement si vos dépendances sont déjà installées et que vous voulez tester le rendu final rapidement (avec optimisations).
* **`npm run prod`** : La commande complète pour un déploiement propre. Elle se charge d'installer toutes les dépendances (à la racine, dans le client et dans le serveur), de faire le build du client, puis de lancer le serveur en production.

💡 **Note pour la production :** Une fois l'application lancée via `quick-prod` ou `prod`, elle est accessible par défaut sur le port `3000` (**http://localhost:3000**).


## 3 - Préparer le projet pour la mise en prod

### 1. Configuration de l'environnement
Créer un fichier `/server/.env` identique à `/server/.env.example`.

Remplacer `JWT_SECRET` par une chaîne de caractères aléatoire de 128 caractères.

Commande pour générer le secret :
```bash
node -e "console.log(require('crypto').randomBytes(128).toString('hex'))"
```

Définir `CORS_ORIGIN` avec l'URL autorisée (ex: `https://mon-site.com`).
Si vous avez plusieurs domaines, séparez-les par une virgule (ex: `https://mon-site.com,https://api.mon-site.com`).

Pour le développement local **uniquement**, vous pouvez ajouter `ENABLE_DEV_AUTH=true` pour utiliser les comptes de test (etudiant, prof, admin) sans LDAP. **Ne jamais activer en production.**

### 2. Initialisation de la Base de Données
Créer la base de données `/server/database/appAbsences.db` en exécutant la commande suivante à la racine :

```bash
sqlite3 server/database/appAbsences.db < server/database/schema.sql
```

### 3. Lancement du projet
Lancer le projet avec la commande suivante à la racine :

```bash
npm run prod
```

### 4. Intégration Continue (CI)
En CI, il suffit de relancer `npm run prod` pour que tout soit mis à jour (installation des dépendances, build client, etc.).