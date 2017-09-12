/**
 * html5media enables <video> and <audio> tags in all major browsers
 * External File: https://api.html5media.info/1.1.8/html5media.min.js
 */

//### VARIABLES ###

const DEBUG = true;
var mediaPath = DEBUG ? 'https://archive.org/download/hometify2017-09-01/' : SERVER_URL.url + '/client/src/songs/';

// Add user agent as an attribute on the <html> tag
document.documentElement.setAttribute('data-useragent', navigator.userAgent);
document.documentElement.setAttribute('data-platform', navigator.platform);

jQuery(function ($) {

    //Check for supported audio format
    var a = document.createElement('audio');
    var supportsMp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    var fileExtension = supportsMp3 ? '.mp3' : '.ogg';

    //AudioPlayer HTML Elements
    var playlistElement = $('#plList');
    var npActionElement = $('#npAction');
    var npTitleElement = $('#npTitle');
    var btnPrev = $('#btnPrev');
    var btnNext = $('#btnNext');

    var audioPlayer = new AudioPlayer(npActionElement, npTitleElement, playlistElement, fileExtension);


    //######################## CONTENT LOADER #########################################
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

                //Identifikacne udaje pesnicky
                '<p class="song_id" hidden>' + song.song_id + '</p>' +
                '<p class="artist_id" hidden>' + song.artist_id + '</p>' +
                '<p class="song_name" hidden>' + song.song_name + '</p>' +
                '<p class="album_id" hidden>' + song.album_id + '</p>' +
                '<p class="duration" hidden>' + song.duration + '</p>' +

                '<p><strong>' + song.artist_name + '</strong></p>' +
                '<p>' + song.song_name + '</p>' +
                '<p><img src="/client/img/flaticon/play.svg" width="25" height="25"></p>' +
                '<p class="addToPlaylistBtn"><img src="/client/img/flaticon/bold-star.svg" width="25" height="25"></p>' +
                '<p><img src="/client/img/flaticon/more.svg" width="25" height="25"></p>' +
                '</div>' +
                '</li>');
        });

        /**
         * Add onclick function to buttons
         */
        $('.addToPlaylistBtn').click(function () {

            var song_id = $(this).prevAll('.song_id').text();
            var artist_id = $(this).prevAll('.artist_id').text();
            var song_name = $(this).prevAll('.song_name').text();
            var album_id = $(this).prevAll('.album_id').text();
            var duration = $(this).prevAll('.duration').text();

            audioPlayer.addSongToPlaylist(new Song(song_id, artist_id, song_name, album_id, duration));
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

    contentElement.append('<button id="btn">Change url (test)</button>');

    var btn = $('#btn').on('click', function () {
        console.log('clicked!');
        changePage(ARTISTS_URL.url, 'Favourite songs', {});
    });


    //######################## AUDIO PLAYER #########################################

    /**
     * Previous button click
     */
    btnPrev.click(function () {
        audioPlayer.previousSong();
    });

    /**
     * Next button click
     */
    btnNext.click(function () {
        audioPlayer.nextSong();
    });

    /**
     * Playlist item click
     */
    playlistElement.find('li').click(function () {
        //TODO

        var song_id = parseInt($(this).index());

        console.log('Clicked! `song_id` = ' + song_id);

        audioPlayer.playSongFile(song_id);
    });
});


//################## LOGIC ##################

/**
 * AudioPlayer logic
 */
function AudioPlayer(npActionElement, npTitleElement, playlistElement, supportedFileFormatExtension) {

    var self = this;

    self.fileExtension = supportedFileFormatExtension;

    //AudioPlayer info labels
    self.npActionElement = npActionElement;
    self.npTitleElement = npTitleElement;

    self.playlistElement = playlistElement;

    self.currentlySelectedSongId = 0;
    self.isPlaying = false;

    self.playlist = [];

    /**
     * EventListeners attach to HTML audio element (Events triggered by user)
     * @type {jQuery}
     */
    self.audioElement = $('#audio1').bind('play', function () {
        self.playEvent();
    }).bind('pause', function () {
        self.pauseEvent();
    }).bind('ended', function () {
        self.endedEvent();
    }).get(0);


    //### METHODS ###

    /**
     * `play` event handler
     */
    self.playEvent = function () {
        self.isPlaying = true;
        self.npActionElement.text('Now Playing...');
    };

    /**
     * `pause` event handler
     */
    self.pauseEvent = function () {
        self.isPlaying = false;
        self.npActionElement.text('Paused...');
    };

    /**
     * 'ended' event handler
     */
    self.endedEvent = function () {
        self.npActionElement.text('Paused...');

        //If current index is not at the end of the playlist
        if ((self.currentlySelectedSongId + 1) < self.playlist.length) {
            self.currentlySelectedSongId++;
            self.loadSongFile(self.currentlySelectedSongId);
            self.audioElement.play();
        }
        else {
            self.audioElement.pause();
            self.currentlySelectedSongId = 0;
            self.loadSongFile(self.currentlySelectedSongId);
        }
    };

    /**
     * Loads given song
     * @param song_id
     */
    self.loadSongFile  = function (song_id) {
        //TODO Dat prec kod ktory pracuje s UI + kontrola ci pozadovana pesnicka existuje

        $('.plSel').removeClass('plSel');
        self.playlistElement.find('li:eq(' + song_id + ')').addClass('plSel');
        self.npTitleElement.text(self.playlist[song_id].song_name);
        self.currentlySelectedSongId = song_id;

        self.audioElement.src = mediaPath + self.playlist[song_id].song_id + self.fileExtension;
    };

    /**
     * Load and play given song
     * @param song_id
     */
    self.playSongFile = function (song_id) {
        self.loadSongFile(song_id);
        self.audioElement.play();
    };

    /**
     * Skip to previous song in playlist
     */
    self.previousSong = function () {
        if ((self.currentlySelectedSongId - 1) > -1) {
            self.currentlySelectedSongId--;
            self.loadSongFile(self.currentlySelectedSongId);
            if (self.isPlaying) {
                self.audioElement.play();
            }
        }
        else {
            self.audioElement.pause();
            self.currentlySelectedSongId = 0;
            self.loadSongFile(self.currentlySelectedSongId);
        }
    };

    /**
     * Skip to next song in playlist
     */
    self.nextSong = function () {
        if ((self.currentlySelectedSongId + 1) < self.playlist.length) {
            self.currentlySelectedSongId++;
            self.loadSongFile(self.currentlySelectedSongId);

            if (self.isPlaying) {
                self.audioElement.play();
            }
        }
        else {
            self.npActionElement.text('Paused...');
            self.audioElement.pause();
            self.currentlySelectedSongId = 0;
            self.loadSongFile(self.currentlySelectedSongId);
        }
    };

    /**
     * Build playlist in playlistElement
     */
    self.buildPlaylist = function () {

        //Remove current playlist
        self.playlistElement.html('');

        //Build new playlist
        self.playlist.forEach(function (song) {
            self.playlistElement.append(
                '<li><div class="plItem"><div class="plNum">' + song.song_id + '</div>' +
                '<div class="plTitle">' + song.song_name + '</div>' +
                '<div class="plLength">' + song.duration + '</div></div></li>');
        })
    };

    /**
     * Add new song to existing playlist and rebuild it
     * @param newSong
     */
    self.addSongToPlaylist = function (newSong) {

        //avoid duplicate entry
        var containDuplicate = false;
        self.playlist.forEach(function (songFromPlaylist) {
            if (songFromPlaylist.song_id === newSong.song_id) {
                containDuplicate = true;
            }
        });

        if (!containDuplicate) {
            self.playlist.push(newSong);
            self.buildPlaylist();
        }
    };

    /**
     * Initialisation
     */
    self.buildPlaylist();
    //self.loadSongFile(self.currentlySelectedSongId);
}

/**
 * Object representing song as it is in database
 */
function Song(song_id, artist_id, song_name, album_id, duration) {

    var self = this;

    self.song_id = song_id;
    self.artist_id = artist_id;
    self.song_name = song_name;
    self.album_id = album_id;
    self.duration = duration;
}