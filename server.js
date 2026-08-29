const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

const TMDB_TOKEN = process.env.TMDB_TOKEN;

if (!TMDB_TOKEN) {
    console.error("❌ TMDB_TOKEN est introuvable dans le fichier .env");
    process.exit(1);
}

// Permet de servir index.html, style.css et script.js
app.use(express.static(path.join(__dirname)));

// =========================================================
// ROUTE DE TEST
// =========================================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Serveur CINÉMATEK opérationnel"
    });
});

// =========================================================
// ROUTE POUR RÉCUPÉRER LES FILMS
// =========================================================

// =========================================================
// ROUTE POUR RÉCUPÉRER LES FILMS
// =========================================================

app.get("/api/movies", async (req, res) => {

    try {

        const page = req.query.page || 1;
        const year = req.query.year;

        // URL de base TMDB
        let tmdbUrl =
            `https://api.themoviedb.org/3/discover/movie` +
            `?include_adult=false` +
            `&include_video=false` +
            `&language=fr-FR` +
            `&page=${page}` +
            `&sort_by=popularity.desc`;

        // -------------------------------------------------
        // FILTRE PAR ANNÉE
        // -------------------------------------------------

        if (year && /^\d{4}$/.test(year)) {

            tmdbUrl +=
                `&primary_release_date.gte=${year}-01-01` +
                `&primary_release_date.lte=${year}-12-31`;

        }

        console.log("🎬 Requête TMDB :", tmdbUrl);

        const response = await fetch(
            tmdbUrl,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `TMDB a répondu avec le statut ${response.status}`
            );

        }

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(
            "❌ Erreur TMDB :",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Impossible de récupérer les films."
        });

    }

});

// =========================================================
// ROUTE POUR RÉCUPÉRER LES GENRES
// =========================================================

app.get("/api/genres", async (req, res) => {

    try {

        const response = await fetch(
            "https://api.themoviedb.org/3/genre/movie/list?language=fr-FR",
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `TMDB a répondu avec le statut ${response.status}`
            );

        }

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(
            "❌ Erreur TMDB genres :",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Impossible de récupérer les genres."
        });

    }

});

// =========================================================
// DÉMARRAGE DU SERVEUR
// =========================================================

app.listen(PORT, () => {

    console.log("🎬 CINÉMATEK démarré !");
    console.log(`🌐 http://localhost:${PORT}`);

});