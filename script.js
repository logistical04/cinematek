// =========================================================
// CINÉMATEK — CONFIGURATION API
// =========================================================

// Le navigateur communique uniquement avec notre serveur.
// Le token TMDB reste côté serveur et n'est jamais exposé ici.
const API_URL = "/api";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


// =========================================================
// VARIABLES DE L'APPLICATION
// =========================================================

let movies = [];

let genres = {};

let selectedGenre = "all";

// Page courante de résultats TMDB.
let currentPage = 1;
let totalPages = 1;


// =========================================================
// ÉLÉMENTS HTML
// =========================================================

const movieList = document.getElementById("movieList");
const loader = document.getElementById("loader");
const message = document.getElementById("message");

const searchInput = document.getElementById("searchInput");
const genreList = document.getElementById("genreList");
const yearSelect = document.getElementById("yearSelect");
const sortSelect = document.getElementById("sortSelect");
const reloadBtn = document.getElementById("reloadBtn");

const totalMovies = document.getElementById("totalMovies");
const averageRating = document.getElementById("averageRating");
const bestMovie = document.getElementById("bestMovie");
const mostPopular = document.getElementById("mostPopular");


// =========================================================
// RÉCUPÉRATION DES GENRES
// =========================================================

async function loadGenres() {

    try {

        console.log("🎭 Récupération des genres...");

        const response = await fetch(
            `${API_URL}/genres`,
            {
                headers: {
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Le serveur renvoie : { genres: [...] }
        const genreListFromApi = Array.isArray(data.genres)
            ? data.genres
            : [];

        genreListFromApi.forEach(genre => {
            genres[genre.id] = genre.name;
        });

        console.log("✅ Genres récupérés :", genres);

    } catch (error) {

        console.error(
            "❌ Impossible de récupérer les genres :",
            error
        );

    }
}



// =========================================================
// CRÉER LES BOUTONS DE GENRES
// =========================================================

function renderGenres() {

    genreList.innerHTML = "";

    // Bouton "Tous"
    const allButton = document.createElement("button");

    allButton.textContent = "Tous";

    allButton.dataset.genre = "all";

    allButton.className =
        "genre-btn whitespace-nowrap rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black";

    genreList.appendChild(allButton);


    // Autres genres
    Object.entries(genres).forEach(([id, name]) => {

        const button = document.createElement("button");

        button.textContent = name;

        button.dataset.genre = id;

        button.className =
            "genre-btn whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400";

        genreList.appendChild(button);

    });


    console.log("🎭 Boutons de genres créés.");

}


// =========================================================
// RÉCUPÉRATION DES FILMS
// =========================================================

async function loadMovies(page = 1) {

    try {

        const selectedYear = yearSelect.value;

        console.log(
            `🎬 Récupération des films — page ${page} — année : ${selectedYear}`
        );

        let url =
            `${API_URL}/movies?page=${page}&sort_by=popularity.desc`;

        // Ajouter l'année sélectionnée à la requête
        if (selectedYear && selectedYear !== "all") {
            url += `&year=${selectedYear}`;
        }

        console.log("🌐 URL API :", url);

        const response = await fetch(
            url,
            {
                headers: {
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Erreur HTTP : ${response.status}`
            );
        }

        const data = await response.json();

        movies = Array.isArray(data.results)
            ? data.results
            : [];

        currentPage = data.page || page;
        totalPages = data.total_pages || 1;

        console.log(
            "✅ Films récupérés :",
            movies
        );

        console.log(
            `🎬 Nombre de films reçus : ${movies.length}`
        );

        console.log(
            `📄 Page ${currentPage} / ${totalPages}`
        );

    } catch (error) {

        console.error(
            "❌ Erreur récupération des films :",
            error
        );

        if (message) {
            message.textContent =
                "Impossible de récupérer les films.";
        }
    }
}



// =========================================================
// OBTENIR LES NOMS DES GENRES
// =========================================================

function getGenreNames(genreIds) {

    return genreIds
        .map(id => genres[id])
        .filter(Boolean);

}


// =========================================================
// AFFICHER UN MESSAGE
// =========================================================

function showMessage(text) {

    message.textContent = text;

    message.className =
        "py-20 text-center text-zinc-400";

}


// =========================================================
// LOADER
// =========================================================

function showLoader() {

    loader.classList.remove("hidden");

}


function hideLoader() {

    loader.classList.add("hidden");

}


// =========================================================
// RÉCUPÉRER L'ANNÉE
// =========================================================

function getYear(movie) {

    if (!movie.release_date) {
        return 0;
    }

    return Number(
        movie.release_date.substring(0, 4)
    );

}


// =========================================================
// STATISTIQUES
// =========================================================

function updateStatistics(movieArray) {

    console.log("📊 Mise à jour des statistiques...");


    // Aucun film
    if (movieArray.length === 0) {

        totalMovies.textContent = "0";

        averageRating.textContent = "0 ⭐";

        bestMovie.textContent = "-";

        bestMovie.title = "";

        mostPopular.textContent = "-";

        mostPopular.title = "";

        return;

    }


    // Nombre de films
    totalMovies.textContent =
        movieArray.length;


    // Note moyenne
    const totalRating =
        movieArray.reduce(
            (sum, movie) =>
                sum + (movie.vote_average || 0),
            0
        );


    const average =
        totalRating / movieArray.length;


    averageRating.textContent =
        `${average.toFixed(1)} ⭐`;


    // Meilleur film
    const highestRated =
        movieArray.reduce(
            (best, movie) => {

                if (
                    !best ||
                    movie.vote_average > best.vote_average
                ) {
                    return movie;
                }

                return best;

            },
            null
        );


    if (highestRated) {

        bestMovie.textContent =
            highestRated.title;

        bestMovie.title =
            `${highestRated.title} — ${highestRated.vote_average.toFixed(1)} ⭐`;

    }


    // Film le plus populaire
    const mostPopularMovie =
        movieArray.reduce(
            (popular, movie) => {

                if (
                    !popular ||
                    movie.popularity > popular.popularity
                ) {
                    return movie;
                }

                return popular;

            },
            null
        );


    if (mostPopularMovie) {

        mostPopular.textContent =
            mostPopularMovie.title;

        mostPopular.title =
            `${mostPopularMovie.title} — Popularité : ${mostPopularMovie.popularity.toFixed(0)}`;

    }


    console.log("📊 Statistiques mises à jour.");

}


// =========================================================
// FILTRER ET TRIER
// =========================================================

function applyFilters() {

    let filteredMovies = [...movies];


    // -----------------------------------------------------
    // RECHERCHE
    // -----------------------------------------------------

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchTerm !== "") {

        filteredMovies =
            filteredMovies.filter(movie => {

                const title =
                    movie.title
                        ? movie.title.toLowerCase()
                        : "";

                const overview =
                    movie.overview
                        ? movie.overview.toLowerCase()
                        : "";

                return (
                    title.includes(searchTerm) ||
                    overview.includes(searchTerm)
                );

            });

    }


    // -----------------------------------------------------
    // GENRE
    // -----------------------------------------------------

    if (selectedGenre !== "all") {

        const genreId =
            Number(selectedGenre);

        filteredMovies =
            filteredMovies.filter(movie => {

                return movie.genre_ids &&
                    movie.genre_ids.includes(genreId);

            });

    }


    // -----------------------------------------------------
    // ANNÉE
    // -----------------------------------------------------

    const selectedYear =
        yearSelect.value;


    if (selectedYear !== "all") {

        const year =
            Number(selectedYear);

        filteredMovies =
            filteredMovies.filter(movie => {

                if (!movie.release_date) {
                    return false;
                }

                const movieYear =
                    Number(
                        movie.release_date.substring(0, 4)
                    );

                return movieYear >= year;

            });

    }


    // -----------------------------------------------------
    // TRI
    // -----------------------------------------------------

    const sortValue =
        sortSelect.value;


    switch (sortValue) {

        case "name-asc":

            filteredMovies.sort((a, b) =>
                a.title.localeCompare(
                    b.title,
                    "fr"
                )
            );

            break;


        case "rating-desc":

            filteredMovies.sort(
                (a, b) =>
                    b.vote_average - a.vote_average
            );

            break;


        case "year-desc":

            filteredMovies.sort(
                (a, b) =>
                    getYear(b) - getYear(a)
            );

            break;


        case "popularity-desc":

            filteredMovies.sort(
                (a, b) =>
                    b.popularity - a.popularity
            );

            break;

    }


    console.log(
        `🔎 ${filteredMovies.length} film(s) après filtrage.`
    );


    renderMovies(filteredMovies);

    updateStatistics(filteredMovies);

}


// =========================================================
// AFFICHER LES FILMS
// =========================================================

function renderMovies(movieArray = movies) {

    movieList.innerHTML = "";


    if (movieArray.length === 0) {

        movieList.classList.add("hidden");

        showMessage(
            "Aucun film ne correspond à vos critères."
        );

        return;

    }


    message.classList.add("hidden");

    movieList.classList.remove("hidden");


    movieArray.forEach(movie => {

        const movieGenres =
            getGenreNames(
                movie.genre_ids || []
            );


        const year =
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A";


        const rating =
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A";


        const poster =
            movie.poster_path
                ? `${IMAGE_URL}${movie.poster_path}`
                : null;


        const card =
            document.createElement("article");


        card.className =
            "movie-card";


        // IMPORTANT :
        // On mémorise l'identifiant du film
        card.dataset.movieId =
            movie.id;


        card.innerHTML = `

            <div class="movie-poster-container">

                ${
                    poster
                        ? `
                            <img
                                src="${poster}"
                                alt="Affiche de ${movie.title}"
                                class="movie-poster"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="movie-poster-placeholder">
                                🎬
                            </div>
                        `
                }

                <div class="movie-poster-overlay"></div>

                <div class="movie-rating">
                    ⭐ ${rating}
                </div>

            </div>


            <div class="movie-content">

                <h4
                    class="movie-title"
                    title="${movie.title}">
                    ${movie.title}
                </h4>


                <div class="movie-meta">

                    <span class="movie-year">
                        ${year}
                    </span>

                    <span>•</span>

                    <span>
                        ${
                            movie.original_language
                                ? movie.original_language.toUpperCase()
                                : "N/A"
                        }
                    </span>

                </div>


                <div class="movie-genres">

                    ${
                        movieGenres.length > 0
                            ? movieGenres
                                .slice(0, 3)
                                .map(genre => `
                                    <span class="movie-genre">
                                        ${genre}
                                    </span>
                                `)
                                .join("")
                            : `
                                <span class="movie-genre">
                                    Genre inconnu
                                </span>
                            `
                    }

                </div>


                <p class="movie-description">

                    ${
                        movie.overview ||
                        "Aucune description disponible."
                    }

                </p>


                <span class="movie-details">
                    Voir les informations →
                </span>

            </div>

        `;


        movieList.appendChild(card);

    });


    console.log(
        `🎬 ${movieArray.length} carte(s) affichée(s).`
    );

}


// =========================================================
// FICHE DÉTAILLÉE D'UN FILM
// =========================================================

function showMovieDetails(movie) {

    // Supprimer une éventuelle ancienne fenêtre
    const oldModal =
        document.getElementById("movieModal");

    if (oldModal) {
        oldModal.remove();
    }


    // Genres
    const movieGenres =
        getGenreNames(
            movie.genre_ids || []
        );


    // Année
    const year =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";


    // Note
    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";


    // Affiche
    const poster =
        movie.poster_path
            ? `${IMAGE_URL}${movie.poster_path}`
            : null;


    // Création de la fenêtre
    const modal =
        document.createElement("div");


    modal.id = "movieModal";

    modal.className = "movie-modal";


    modal.innerHTML = `

        <div class="movie-modal-backdrop"></div>


        <div class="movie-modal-content">

            <button
                class="movie-modal-close"
                id="closeMovieModal"
                aria-label="Fermer">
                ✕
            </button>


            <div class="movie-modal-body">

                <div class="movie-modal-poster">

                    ${
                        poster
                            ? `
                                <img
                                    src="${poster}"
                                    alt="Affiche de ${movie.title}"
                                >
                            `
                            : `
                                <div class="movie-modal-no-poster">
                                    🎬
                                </div>
                            `
                    }

                </div>


                <div class="movie-modal-info">

                    <span class="movie-modal-label">
                        DÉTAILS DU FILM
                    </span>


                    <h2>
                        ${movie.title}
                    </h2>


                    <div class="movie-modal-meta">

                        <span>
                            ${year}
                        </span>

                        <span>•</span>

                        <span>
                            ⭐ ${rating}
                        </span>

                        <span>•</span>

                        <span>
                            ${
                                movie.original_language
                                    ? movie.original_language.toUpperCase()
                                    : "N/A"
                            }
                        </span>

                    </div>


                    <div class="movie-modal-genres">

                        ${
                            movieGenres.length > 0
                                ? movieGenres
                                    .map(genre => `
                                        <span>
                                            ${genre}
                                        </span>
                                    `)
                                    .join("")
                                : `
                                    <span>
                                        Genre inconnu
                                    </span>
                                `
                        }

                    </div>


                    <h3>
                        Synopsis
                    </h3>


                    <p class="movie-modal-overview">

                        ${
                            movie.overview ||
                            "Aucun synopsis disponible pour ce film."
                        }

                    </p>


                    <div class="movie-modal-extra">

                        <div>

                            <strong>
                                Note
                            </strong>

                            <span>
                                ⭐ ${rating}/10
                            </span>

                        </div>


                        <div>

                            <strong>
                                Votes
                            </strong>

                            <span>
                                ${movie.vote_count || 0}
                            </span>

                        </div>


                        <div>

                            <strong>
                                Popularité
                            </strong>

                            <span>
                                ${
                                    movie.popularity
                                        ? movie.popularity.toFixed(0)
                                        : "N/A"
                                }
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // Animation
    setTimeout(() => {

        modal.classList.add("show");

    }, 10);


    // Bouton fermer
    const closeButton =
        document.getElementById(
            "closeMovieModal"
        );


    closeButton.addEventListener(
        "click",
        closeMovieModal
    );


    // Clic sur l'arrière-plan
    const backdrop =
        modal.querySelector(
            ".movie-modal-backdrop"
        );


    backdrop.addEventListener(
        "click",
        closeMovieModal
    );


    // Touche Échap
    document.addEventListener(
        "keydown",
        handleModalEscape
    );


    // Bloquer le défilement
    document.body.style.overflow =
        "hidden";

}


// =========================================================
// FERMER LA FICHE
// =========================================================

function closeMovieModal() {

    const modal =
        document.getElementById(
            "movieModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("show");


    setTimeout(() => {

        modal.remove();

    }, 250);


    document.body.style.overflow = "";


    document.removeEventListener(
        "keydown",
        handleModalEscape
    );

}


// =========================================================
// FERMER AVEC ÉCHAP
// =========================================================

function handleModalEscape(event) {

    if (event.key === "Escape") {

        closeMovieModal();

    }

}


// =========================================================
// CLIC SUR UNE CARTE
// =========================================================

movieList.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".movie-card"
            );


        if (!card) {
            return;
        }


        const movieId =
            Number(
                card.dataset.movieId
            );


        const movie =
            movies.find(
                movie =>
                    movie.id === movieId
            );


        if (!movie) {
            return;
        }


        showMovieDetails(movie);

    }
);


// =========================================================
// REMPLIR LE FILTRE DES ANNÉES
// =========================================================

function renderYears() {

    const currentYear =
        new Date().getFullYear();


    for (
        let year = currentYear;
        year >= 1950;
        year--
    ) {

        const option =
            document.createElement("option");


        option.value = year;

        option.textContent = year;

        option.className =
            "bg-[#15151b]";


        yearSelect.appendChild(option);

    }

}


// =========================================================
// GESTION DES GENRES
// =========================================================

genreList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".genre-btn"
            );


        if (!button) {
            return;
        }


        selectedGenre =
            button.dataset.genre;


        document
            .querySelectorAll(
                ".genre-btn"
            )
            .forEach(btn => {

                btn.className =
                    "genre-btn whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400";

            });


        button.className =
            "genre-btn whitespace-nowrap rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black";


        applyFilters();

    }
);


// =========================================================
// RECHERCHE
// =========================================================

searchInput.addEventListener(
    "input",
    () => {

        applyFilters();

    }
);


// =========================================================
// FILTRE PAR ANNÉE
// =========================================================

yearSelect.addEventListener(
    "change",
    async () => {

        console.log(
            `📅 Changement d'année : ${yearSelect.value}`
        );

        // Revenir à la première page
        currentPage = 1;

        // Récupérer les films correspondant à l'année
        // sélectionnée depuis le serveur / TMDB
        await loadMovies(1);

        // Conserver les autres filtres actifs
        applyFilters();

    }
);


// =========================================================
// TRI
// =========================================================

sortSelect.addEventListener(
    "change",
    () => {

        applyFilters();

    }
);


// =========================================================
// BOUTON ACTUALISER
// =========================================================

reloadBtn.addEventListener(
    "click",
    async () => {

        reloadBtn.disabled = true;

        reloadBtn.textContent =
            "↻ Chargement...";

        try {

            // Passer à la page suivante.
            // Une fois la dernière page atteinte, revenir à la page 1.
            const nextPage =
                currentPage >= totalPages
                    ? 1
                    : currentPage + 1;

            console.log(
                `🔄 Actualisation : passage à la page ${nextPage} / ${totalPages}`
            );

            await loadMovies(nextPage);
            applyFilters();

        } catch (error) {

            console.error(
                "❌ Erreur pendant l'actualisation :",
                error
            );

        } finally {

            reloadBtn.disabled = false;

            reloadBtn.textContent =
                "↻ Actualiser";
        }

    }
);


// =========================================================
// INITIALISATION
// =========================================================

async function init() {

    try {

        console.log(
            "🚀 Initialisation de CINÉMATEK..."
        );

        console.log(
            "🔐 Mode sécurisé : le token TMDB reste sur le serveur."
        );


        showLoader();


        // 1. Récupérer les genres
        await loadGenres();


        // 2. Créer les boutons de genres
        renderGenres();


        // 3. Créer les années
        renderYears();


        // 4. Récupérer les films — première page
        currentPage = 1;
        await loadMovies(currentPage);


        // 5. Afficher les films
        renderMovies();


        // 6. Calculer les statistiques
        updateStatistics(movies);


        hideLoader();


        console.log(
            "✅ Initialisation terminée."
        );


    } catch (error) {

        hideLoader();

        console.error(
            "❌ Erreur lors de l'initialisation :",
            error
        );

    }

}


// =========================================================
// LANCEMENT
// =========================================================

init();