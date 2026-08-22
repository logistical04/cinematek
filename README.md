\# 🎬 CINÉMATEK



Application web de découverte et de consultation de films.



CINÉMATEK permet d'explorer un catalogue de films, de rechercher des titres, de filtrer les résultats et de consulter les informations détaillées des films grâce aux données fournies par l'API TMDB.



\---



\## 📌 Présentation



CINÉMATEK est une application web développée pour permettre aux utilisateurs de découvrir facilement des films à partir d'un catalogue dynamique.



L'application récupère les données depuis l'API TMDB à travers un serveur Express afin de ne pas exposer directement le token d'authentification dans le navigateur.



\---



\## ✨ Fonctionnalités



\- 🎬 Affichage des films à l'affiche

\- 🔎 Recherche de films

\- 🏷️ Filtrage par genre

\- 📅 Filtrage par année

\- ↕️ Tri des films

\- 📄 Consultation des détails d'un film

\- ⭐ Affichage des notes et du nombre de votes

\- 📊 Statistiques du catalogue

\- 🔄 Actualisation du catalogue

\- 📑 Pagination des résultats

\- 🎨 Interface moderne et responsive



\---



\## 🛠️ Technologies utilisées



\### Front-end



\- HTML5

\- CSS3

\- JavaScript

\- Font Awesome



\### Back-end



\- Node.js

\- Express.js

\- dotenv



\### API



\- TMDB (The Movie Database)



\### Gestion de versions



\- Git

\- GitHub



\---



\## 🏗️ Architecture



L'application utilise une architecture simple en trois parties :



```text

&#x20;                ┌──────────────────────┐

&#x20;                │      Navigateur      │

&#x20;                │   HTML / CSS / JS    │

&#x20;                └──────────┬───────────┘

&#x20;                           │

&#x20;                           │ Requêtes HTTP

&#x20;                           ▼

&#x20;                ┌──────────────────────┐

&#x20;                │    Serveur Express   │

&#x20;                │      server.js       │

&#x20;                └──────────┬───────────┘

&#x20;                           │

&#x20;                           │ API TMDB

&#x20;                           ▼

&#x20;                ┌──────────────────────┐

&#x20;                │         TMDB         │

&#x20;                │  The Movie Database  │

&#x20;                └──────────────────────┘

