/**
 * Dynamic loading of content to main template via jquery (ajax)
 */
jQuery(function ($) {

    //### CONSTANTS AND VARIABLES ###

    var contentElement = $('#content');


    //################# FUNCTIONS #################

    /**
     * load content of page
     */
    var loadPageContent = (function loadPageContent() {

        var requestedUrl = getCurrentUrl();

        if (requestedUrl === ROOT_URL.url) {
            $.getJSON(SERVER_URL.url + "/data/favourites", function (data) {
                renderSongList(data);
            });
        } else if (requestedUrl === ARTISTS_URL.url) {
            $.getJSON(SERVER_URL.url + "/data/artists", function (data) {
                renderArtistList(data);
            });
        }

        //
    })();

    /**
     * change url without reloading
     * @param path
     * @param title
     * @param data
     */
    function changePage(path, title, data) {

        if (path !== getCurrentUrl()) {

            //remove previous content
            contentElement.innerHTML = '';

            window.history.pushState(data, title, path);
            document.title = title;

            //load content
            loadPageContent();
        }
    }

    /**
     * Return current url
     * @returns {string}
     */
    function getCurrentUrl() {
        return window.location.pathname;
    }

    //################# RENDER FUNCTIONS #################

    /**
     * Create SongList HTML structure with given data
     * @param songs
     */
    function renderSongList(songs) {
        contentElement.prepend('<ul class="song-list"></ul>');
        var song_list = $('.song-list');

        songs.forEach(function (song) {
            song_list.append(
                '<li class="song">' +
                '<div class="img-box">' +
                '<img src="/client/img/flaticon/note.svg" alt="" width="50" height="50">' +
                '</div>'+

                '<div class="info-box">' +
                '<p><strong>' + song.artist_name + '</strong></p>' +
                '<p>' + song.song_name + '</p>' +
                '<p><img src="/client/img/flaticon/play.svg" width="25" height="25"></p>' +
                '<p onclick="clicked(' + song.song_id + ')"><img src="/client/img/flaticon/bold-star.svg" width="25" height="25"></p>' +
                '<p><img src="/client/img/flaticon/more.svg" width="25" height="25"></p>' +
                '</div>' +
                '</li>');
        });
    }

    /**
     * Create ArtistList HTML structure with given data
     * @param artists
     */
    function renderArtistList(artists) {

        contentElement.prepend('<ul class="artist-list"></ul>');
        var artist_list = $('.artist-list');

        artists.forEach(function (artist) {
            artist_list.append(
                '<li class="artist">' +
                    '<div class="img-box">' +
                        '<img src="/client/img/flaticon/note.svg" alt="" width="50" height="50">' +
                    '</div>'+

                    '<div class="info-box">' +
                        '<p><strong><a href="#">' + artist.artist_name + '</a></strong></p>' +
                        '<p><a href="#">25 songs</a></p>' +
                    '</div>' +
                '</li>');
        });
    }

    //### TESTING ###

    contentElement.append('<button id="btn">Still testing</button>');

    var btn = $('#btn').on('click', function () {
        console.log('clicked!');
        changePage(ARTISTS_URL.url, 'Favourite songs', {});
    });

});