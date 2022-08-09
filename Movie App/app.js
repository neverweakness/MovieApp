const API_KEY = "71cf53f1-73e9-4080-a8a6-65589df4d32a";
const API_URL_POPULAR =
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/top";
const API_URL_SEARCH =
    "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_BASE =
    "https://kinopoiskapiunofficial.tech/api/v2.2/films";

let page = 1;

let movies;

let currentSearch;

let currentKeyword;

let currentAPI;

let currentSortBy;

let currentOrder = "RATING";

getMovies(API_URL_POPULAR, {type: "TOP_100_POPULAR_FILMS"});

// Запрос о получении фильмов
async function getMovies(url, params = {}) {

    // Блок кнопки до показа объекта
    document.getElementById('sButton').disabled = true;
    document.getElementById('sButton2').disabled = true;
    const innerPage = page;
    url = new URL(url),
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    const resp = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
        }
    });
    const respData = await resp.json();
    checkApiAttribute(respData);
    movies = respData;
    currentAPI = respData
    if (currentSearch == undefined){
        return
    }
    else (showMoviesAmount(currentAPI));
    // Разблок кнопки после показа объекта
    document.getElementById('sButton').disabled = false;
    document.getElementById('sButton2').disabled = false;
};

// Создание фильмов
function showMovies(data) {
    const moviesEl = document.querySelector(".movies");

    document.querySelector(".movies").innerHTML = "";
    
    data.films.forEach((movie) => {
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
        <div class="movie__cover-inner">
        <img
          src="${movie.posterUrlPreview}"
          class="movie__cover"
          alt="${movie.nameRu}"
        />
        <div class="movie__cover--darkened"></div>
      </div>
      <div class="movie__info">
        <div class="movie__title">${getFilmName(movie)}</div>
        <div class="movie__category">${movie.genres.map(
            (genre) => ` ${genre.genre}`
        )}</div>
        <div class="movie__average movie__average--${getClassByRate(
            movie
        )}">${getRating(movie)}</div>
        <div class="movie__year">${movie.year}</div>
        </div>
        `;
        moviesEl.appendChild(movieEl);
    })
    ;
}

// Создание фильмов после поиска
function showSearchedMovies(data) {
    const moviesEl = document.querySelector(".movies");
    
    document.querySelector(".movies").innerHTML = "";
    
    data.items.forEach((movie) => {
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
        <div class="movie__cover-inner">
        <img
          src="${movie.posterUrlPreview}"
          class="movie__cover"
          alt="${movie.nameRu}"
        />
        <div class="movie__cover--darkened"></div>
      </div>
      <div class="movie__info">
        <div class="movie__title">${getFilmName(movie)}</div>
        <div class="movie__category">${movie.genres.map(
            (genre) => ` ${genre.genre}`
        )}</div>
        <div class="movie__average movie__average--${getClassByRate(
            movie
        )}">${getRating(movie)}</div>
        <div class="movie__year">${filterReleaseDate(movie.year)}</div>
        </div>
        `;
        moviesEl.appendChild(movieEl);
    });
}

// Перенаправление массива
function checkApiAttribute(response) {
    if ('films' in response){
        showMovies(response)
    }
    else if ('items' in response) {
        showSearchedMovies(response)
    }
}

// Перелистывание основных страниц
function changePage(value) {
    page = value + page
    if (page <= 0) {
        page = 1
    }
    else if (page > currentAPI.pagesCount) return page = page - 1
    else
    getMovies(API_URL_POPULAR, {
        type: "TOP_100_POPULAR_FILMS",
        page: page, 
        
    })
}

// Перелистывание страниц после поиска
function changeSearchedPage(value) {
    page = value + page || 1
    if (page <= 0) {
        page = 1
    }
    else if (page > currentAPI.totalPages) return page = page - 1
    else {
    getMovies(API_URL_BASE, {
        order: currentOrder,
        type: "ALL",                
        keyword: currentKeyword,
        page: page,
    })
    }   
}

// Кол-во фильмов после поиска
function showMoviesAmount(movies){
    document.querySelector(".moviesAmount").innerHTML = 'Количество найденных страниц: '+ movies.totalPages;
    if (movies.totalPages !== 0) {
    document.querySelector(".moviesAmount").innerHTML = document.querySelector(".moviesAmount").innerHTML + ' Текущая: ' + page;
    }
}

// Поиск фильмов по ключевым словам
const form = document.querySelector("form");
const search = document.querySelector(".header__search")

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const apiSearchUrl = `${search.value}`;
    if (search.value.trim() !== "") {
        currentSearch = apiSearchUrl;
        currentKeyword = search.value
        search.value = "";
        changeSearchedPage()
        flipButtons()
    }
})

// Сортировка по выбранной категории
function sortBy(value) {
    if (value == 1) currentOrder = "RATING";
    if (value == 2) currentOrder = "NUM_VOTE";
    if (value == 3) currentOrder = "YEAR";
    changeSearchedPage()
}

// Замена кнопок после поиска
function flipButtons() {
    document.querySelector('.flip__page').classList.add('invisible_button');
    document.querySelector('.flip_searched_page').classList.remove('invisible_button');
    document.querySelector('.three').classList.remove('invisible_button')
}

// Цвет кружка по рейтингу
function getClassByRate(movie) {
    if (movie.rating || movie.ratingKinopoisk || movie.ratingImdb>= 7) {
        return "green";
    } else if (movie.rating || movie.ratingKinopoisk || movie.ratingImdb > 4) {
        return "orange";
    } else if (movie.rating || movie.ratingKinopoisk || movie.ratingImdb > 0) {
        return "red";
    } else {
        return "null";
    }
}

// Замена фильмов без русского названия, на английское и наоборот
function getFilmName(film) {
    if (film.nameRu === undefined) {
        return film.nameEn;
    } else return film.nameRu || film.nameOriginal;
}

// Отсечение процента от рейтинга массива
function getRating(movie) {
    if (typeof movie.rating === 'string') {
        if (movie.rating.length == '6'){
        return movie.rating.substr(1, 3);
    } else return movie.rating
    } else if (typeof movie.ratingKinopoisk === 'number') {
        return movie.ratingKinopoisk
    } else return movie.ratingImdb
}

// Показ "СКОРО" при дате выхода больше 2022 года
function filterReleaseDate(year) {
    if (year >= 2023) return "Скоро"
    else return year || ""
}