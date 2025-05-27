const currentUrl = new URL(location.href);
const movieId = currentUrl.searchParams.get("id");
const movieTitle = currentUrl.searchParams.get("title");

const TMDBAPILINK = `https://api.themoviedb.org/3/movie/${movieId}?api_key=46ab4985448518009fe1f1d360eda44d`;
const REVIEWAPILINK = "http://127.0.0.1:8000/api/v1/reviews/";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

returnMovieDetails(TMDBAPILINK);
function returnMovieDetails(url) {
  fetch(url)
    .then((res) => res.json())
    .then(function (data) {
      const movieDetails = document.getElementById("movie-details");

      if (data.length != 0) {
        movieDetails.innerHTML = `
                <div class="movie-details">
                    <img class="movie-poster" id="movie-poster-id"/>
                    <canvas id="movie-poster-canvas"></canvas>
                    <div class="details" id="movie-details">
                        <h1 class="detail--heading"><span id="movie-title"></span></h1>
                        <h5 class="detail--sub-heading" id="sub-heading"></h4>
                        
                        <div class="movie-overview-container">
                            <h2>Overview</h2>
                            <h4>${data.tagline}</h4>
                            <p class="movie-overview">${data.overview}</p>
                        </div>

                        <div class="add-review-container">
                            <div class="edit-review-container">
                                <label class="edit-review-labels" for="new-user-input-id">Name: </label>
                                <input class="edit-review-inputs add-user-name-input" type="text" id="new-user-input-id" />

                                <label class="edit-review-labels">Review: </label>
                                <textarea class="edit-review-inputs edit-review-textarea-input add-review-textarea" id="new-review-input-id"></textarea>
                                
                                <button class="disabled-btn" disabled>Coming Soon – Backend Not Live</button>
                            </div>
                        </div>

                        <div class="reviews-wrapper" id="review-wrapper-id">
                            <div class="reviews-continer" id="review-container-id">
                            </div>
                        </div>
                    </div>
                </div>
            `;

        const movieTitleText = document.getElementById("movie-title");
        movieTitleText.innerHTML = `${movieTitle} (${data.release_date.substring(
          0,
          4
        )})
                <a class="tmdb-movie-link" href="https://www.themoviedb.org/movie/${
                  data.id
                }" target="_blank">Tmdb <i class="fa-solid fa-link"></i></a>
            `;

        const subHeading = document.getElementById("sub-heading");
        subHeading.innerHTML = `
                <span class="tmdb-score">
                    <span class="tmdb-avg-score">TMDB Score: </span>
                    <span class="movie-avg-vote" id="movie-avg-vote"></span>
                </span>
                &bull;
                <span class="full-release-date">${data.release_date
                  .split("-")
                  .reverse()
                  .join("/")}</span>
                &bull;
                <span class="genres">
                    ${data.genres.map((genre) => genre.name).join(", ")}
                </span>
                &bull;
                <span class="duration">${formatTime(data.runtime)}</span>
            `;

        const movieAvgVote = document.getElementById(`movie-avg-vote`);
        const avgVote = Math.round(data.vote_average * 10 * 100) / 100;
        movieAvgVote.innerHTML = avgVote;

        if (avgVote >= 80) {
          movieAvgVote.classList.add("high-avg-vote");
          movieAvgVote.classList.remove("medium-avg-vote");
          movieAvgVote.classList.remove("low-avg-vote");
          movieAvgVote.classList.remove("no-vote");
        } else if (avgVote >= 60 && avgVote < 80) {
          movieAvgVote.classList.remove("high-avg-vote");
          movieAvgVote.classList.add("medium-avg-vote");
          movieAvgVote.classList.remove("low-avg-vote");
          movieAvgVote.classList.remove("no-vote");
        } else if (avgVote < 60) {
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

        const moviePoster = document.getElementById("movie-poster-id");
        const moviePosterCanvas = document.getElementById(
          "movie-poster-canvas"
        );
        moviePoster.alt = `${movieTitle} Poster`;
        moviePoster.src = IMG_PATH + data.poster_path;
        moviePosterCanvas.style.display = "none";
      } else {
        movieDetails.innerHTML =
          "<h1 class='no-movies-found'>No Details Found!</h1>";
      }
    });
}

function addReviewForm() {
  return `<div class="add-review-container">
            <div class="edit-review-container">
                <label class="edit-review-labels" for="new-user-input-id">Name: </label>
                <input class="edit-review-inputs add-user-name-input" type="text" id="new-user-input-id" />

                <label class="edit-review-labels" for="new-review-input-id">Review: </label>
                <textarea class="edit-review-inputs edit-review-textarea-input add-review-textarea" id="new-review-input-id"></textarea>
                
                <a class="save-edit-btn add-review-btn" onclick="saveReview('new-review-input-id', 'new-user-input-id')">Add Review</a>
            </div>
        </div>`;
}

function formatTime(min) {
  const seconds = min * 60;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours > 0 ? hours + "h " : ""}${minutes}m`;
}

function filterImage(img, canvas, color) {
  img.crossOrigin = "anonymous";
  const ctx = canvas.getContext("2d");

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    setTimeout(() => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const target = hexToRgb(color);
      const targetR = target.r,
        targetG = target.g,
        targetB = target.b;
      const tolerance = 30;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const diff =
          Math.abs(r - targetR) + Math.abs(g - targetG) + Math.abs(b - targetB);

        if (diff < tolerance) {
          pixels[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }, 500);

    img.style.display = "none";
  };
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

// setTimeout(() => {
//   returnReviews(REVIEWAPILINK);
// }, 500);

function returnReviews(url) {
  fetch(url + "movie/" + movieId)
    .then((res) => res.json())
    .then(function (data) {
      if (data.length != 0) {
        const reviewsContainer = document.getElementById("review-container-id");
        data.forEach((review) => {
          reviewsContainer.innerHTML += `
                    <div class="review-card" id="review-${review._id}">
                        <p class="review">${review.review}</p>
                        <div class="user-control-container">
                            <p class="user-name"><strong>By: </strong>${review.user}</p>
                            <div class="review-controls">
                                <button class="edit-btn" data-id="${review._id}" onclick="editReview(this)">Edit <i class="fa-solid fa-file-pen"></i></button>
                                <button class="del-btn" onclick="deleteReview('${review._id}')">Delete <i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
        });
      }
    });
}

function editReview(editBtn) {
  const id = editBtn.getAttribute("data-id");

  const reviewCard = document.getElementById("review-" + id);
  const reviewInputId = "edit-review-" + id;
  const userInputId = "review-user-" + id;

  const oldReviewCard = reviewCard.innerHTML;

  fetch(REVIEWAPILINK + id)
    .then((res) => res.json())
    .then(function (data) {
      reviewCard.innerHTML = `
            <div class="edit-review-container">
                <label class="edit-review-labels" for="${userInputId}">Name: </label>
                <input class="edit-review-inputs" type="text" id="${userInputId}" value="${data.user}"/>
    
                <label class="edit-review-labels" for="${reviewInputId}">Review: </label>
                <textarea class="edit-review-inputs edit-review-textarea-input" id="${reviewInputId}">${data.review}</textarea>
                
                <button class="go-back-btn" id="go-back-btn-${id}">Back</button>
                <a href="#" class="save-edit-btn" onclick="saveReview('${reviewInputId}', '${userInputId}', '${id}')">Save</a>
            </div>
        `;
    });

  setTimeout(() => {
    document
      .getElementById(`go-back-btn-${id}`)
      .addEventListener("click", function () {
        reviewCard.innerHTML = oldReviewCard;
      });
  }, 500);
}

function saveReview(reviewInputId, userInputId, reviewId = "") {
  const review = document.getElementById(reviewInputId).value;
  const user = document.getElementById(userInputId).value;

  if (reviewId) {
    fetch(REVIEWAPILINK + reviewId, {
      method: "PUT",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user, review: review }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        location.reload();
      });
  } else {
    fetch(REVIEWAPILINK + "/new", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieId: movieId, user: user, review: review }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        location.reload();
      });
  }
}

function deleteReview(reviewId) {
  fetch(REVIEWAPILINK + reviewId, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      location.reload();
    });
}
