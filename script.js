let debounceTimer;

async function getSuggestions(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const query = e.target.value.trim();
        const movieGrid = document.getElementById("movieGrid");
        const noData = document.getElementById("nodata");

        if (!query || query.length < 3) {
            movieGrid.innerHTML = "";
            noData.style.display = "none";
            return;
        }

        const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "+");
        const apiKey = "b9b2061f"; // Replace with your IMDB API key
        const url = `https://www.omdbapi.com/?s=${sanitizedQuery}&apiKey=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();

            movieGrid.innerHTML = "";

            if (!data.Search || data.Search.length === 0) {
                noData.style.display = "block";
                return;
            } else {
                noData.style.display = "none";
            }

            // Separate and sort movies and TV shows by release year
            const movies = data.Search.filter(item => item.Type === "movie").sort((a, b) => b.Year - a.Year);
            const series = data.Search.filter(item => item.Type === "series").sort((a, b) => b.Year - a.Year);

            if (movies.length > 0) {
                createSeparator("Movies", movies.length, movieGrid);
                movies.forEach(movie => createCard(movie, movieGrid));
            }

            if (series.length > 0) {
                createSeparator("TV Shows", series.length, movieGrid);
                series.forEach(show => createCard(show, movieGrid));
            }
        } catch (error) {
            console.error("Error fetching movie data:", error);
            noData.style.display = "block";
        }
    }, 300);
}

function createCard(item, container) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.onclick = () => loadMovie(item.imdbID, item.Type);

    const img = document.createElement("img");
    img.src = item.Poster !== "N/A" ? item.Poster : "./assets/images/dummy.jpg";
    img.alt = `Poster for ${item.Title}`;

    const titleElement = document.createElement("p");
    titleElement.textContent = item.Title;

    const yearElement = document.createElement("p");
    yearElement.classList.add("year");
    yearElement.textContent = item.Year;

    card.appendChild(img);
    card.appendChild(titleElement);
    card.appendChild(yearElement);
    container.appendChild(card);
}

function createSeparator(text, count, container) {
    const separator = document.createElement("div");
    separator.classList.add("separator");
    separator.textContent = `${text} (${count})`;
    container.appendChild(separator);
}

function loadMovie(imdbID, type) {
    const url = type === "series" ? `https://vidsrc.xyz/embed/tv/${imdbID}` : `https://vidsrc.xyz/embed/movie/${imdbID}`;
    window.open(url, "_blank");
}

// Theme Toggle
document.getElementById("toggleTheme").addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
    const isLightMode = document.body.classList.contains("light-mode");
    this.textContent = isLightMode ? "☀️" : "🌙";
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
});

// Load saved theme on page load
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        document.getElementById("toggleTheme").textContent = "☀️";
    }
});
