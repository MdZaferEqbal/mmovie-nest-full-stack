const APILINK = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=46ab4985448518009fe1f1d360eda44d&page=1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?sort_by=popularity.desc&api_key=46ab4985448518009fe1f1d360eda44d&query=";

const form = document.getElementById('form');
const query = document.getElementById('query');
const movieList = document.getElementById('movie-list');

const currentUrl = location.href;

returnMovies(APILINK);

function returnMovies(url) {
    fetch(url).then(res => res.json()).then(function(data) {
        if ( data.results.length != 0 ) {
            data.results.forEach(result => {

                movieList.innerHTML += `
                <div class="card" id="movie_card-${result.id}">
                    <a class="movie-link" href="../../movie-details.html?id=${result.id}&title=${result.title}">
                        <img class="thumbnail" alt="Movie Poster" src="${IMG_PATH + result.poster_path}"/>

                        <h3 class="movie-title">${result.title}</h3>

                        <div class="movie-details">
                            <h5 class="movie-release-date">${result.release_date}</h5>
                            <p class="movie-avg-vote" id="movie-avg-vote-${result.id}"></p>
                        </div>
                    </a>
                </div>`;

                const div_card = document.getElementById(`movie_card-${result.id}`);
    
                if ( window.matchMedia("(pointer: coarse)").matches ) {
                    div_card.classList.remove("card--hover");
                } else {
                    div_card.classList.add("card--hover");
                }

                const movieAvgVote = document.getElementById(`movie-avg-vote-${result.id}`);
                const avgVote = Math.round((result.vote_average * 10) * 100) / 100;
    
                if ( avgVote > 80 ) {
                    movieAvgVote.classList.add("high-avg-vote");
                    movieAvgVote.classList.remove("medium-avg-vote");
                    movieAvgVote.classList.remove("low-avg-vote");
                    movieAvgVote.classList.remove("no-vote");
                } else if ( avgVote > 60 && avgVote < 80 ) {
                    movieAvgVote.classList.remove("high-avg-vote");
                    movieAvgVote.classList.add("medium-avg-vote");
                    movieAvgVote.classList.remove("low-avg-vote");
                    movieAvgVote.classList.remove("no-vote");
                } else if ( avgVote < 60 ){
                    movieAvgVote.classList.remove("high-avg-vote");
                    movieAvgVote.classList.remove("medium-avg-vote");
                    movieAvgVote.classList.add("low-avg-vote");
                    movieAvgVote.classList.remove("no-vote");
                } else {
                    movieAvgVote.classList.remove("high-avg-vote");
                    movieAvgVote.classList.remove("medium-avg-vote");
                    movieAvgVote.classList.remove("low-avg-vote");
                    movieAvgVote.classList.add("no-vote");
                }
    
                if( result.vote_count > 0 ) {
                    movieAvgVote.innerHTML = avgVote + "%<span class='movie-total-vote'> (" + result.vote_count + ")</span>";
                } else {
                    movieAvgVote.innerHTML = "";
                }
            });
        } else {
            movieList.innerHTML = "<h1 class='no-movies-found'>No Movies Found!</h1>"; 
        }
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    movieList.innerHTML = "";

    if ( query.value ) {
        const queryUrl = SEARCHAPI + query.value;
        returnMovies(queryUrl);
    } else {
        returnMovies(APILINK);
    }
});
