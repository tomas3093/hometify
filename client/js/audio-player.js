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
    var btnBack = $('#btnBack');
    var btnPlay = $('#btnPlay');
    var btnNext = $('#btnNext');

    var audioPlayer = new AudioPlayer(npActionElement, npTitleElement, playlistElement, fileExtension);


    //######################## CONTENT LOADER #########################################
    //### CONSTANTS AND VARIABLES ###

    var contentElement = $('#main-content');

    loadPageContent();

    //################# FUNCTIONS #################

    /**
     * load content of page
     */
    function loadPageContent() {

        contentElement.html('');
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
    }

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
                '</div>' +

                '<div class="info-box">' +

                //Identifikacne udaje pesnicky
                '<p class="song_id" hidden>' + song.song_id + '</p>' +
                '<p class="artist_id" hidden>' + song.artist_id + '</p>' +
                '<p class="song_name" hidden>' + song.song_name + '</p>' +
                '<p class="album_id" hidden>' + song.album_id + '</p>' +
                '<p class="duration" hidden>' + song.duration + '</p>' +

                '<p><strong>' + song.artist_name + '</strong></p>' +
                '<p>' + song.song_name + '</p>' +
                '<p class="control"><i class="fa fa-play fa-2x" style="color:#cc2b00"></i></p>' +
                '<p class="control addToPlaylistBtn"><i class="fa fa-plus fa-2x" style="color:#cc2b00"></i></p>' +
                '<p class="control"><i class="fa fa-ellipsis-v fa-2x" style="color:#cc2b00"></i></p>' +
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

    $('#btn').on('click', function () {
        console.log('clicked!');
        changePage(ARTISTS_URL.url, ARTISTS_URL.title, {});
    });


    //######################## AUDIO PLAYER #########################################

    /**
     * Play button click
     */
    btnPlay.click(function () {
        if (audioPlayer.isPlaying) {
            audioPlayer.audioElement.pause();
            btnPlay.html('<i class="fa fa-play" style="color:#cc2b00"></i>');
        } else {
            //audioPlayer.audioElement.play();
            btnPlay.html('<i class="fa fa-pause" style="color:#cc2b00"></i>');
        }
    });

    /**
     * Previous button click
     */
    btnBack.click(function () {
        audioPlayer.previousSong();
    });

    /**
     * Next button click
     */
    btnNext.click(function () {
        audioPlayer.nextSong();
    });
});


//################## LOGIC ##################

/**
 * AudioPlayer and playlist logic
 */
function AudioPlayer(npActionElement, npTitleElement, playlistElement, supportedFileFormatExtension) {

    var self = this;

    self.fileExtension = supportedFileFormatExtension;

    //AudioPlayer info labels
    self.npActionElement = npActionElement;
    self.npTitleElement = npTitleElement;

    self.playlistElement = playlistElement;

    self.playlistSongIndex = 0;
    self.isPlaying = false;

    self.playlist = {
        songs: [],
        addNewSong: function (newSong) {

            //avoid duplicate entry
            var containDuplicate = false;
            this.songs.forEach(function (songFromPlaylist) {
                if (songFromPlaylist.song_id === newSong.song_id) {
                    containDuplicate = true;
                }
            });

            if (!containDuplicate) {
                this.songs.push(newSong);
                self.buildPlaylist();
            }
        },

        getSongById: function (song_id) {

            var requestedSong = null;
            this.songs.forEach(function (songFromPlaylist) {
                if (songFromPlaylist.song_id === song_id) {
                    requestedSong = songFromPlaylist;
                }
            });

            return requestedSong;
        },

        removeSong: function (playlistSongIndex) {
            this.songs.splice(playlistSongIndex, 1);
        }
    };

    /**
     * EventListeners attach to HTML audio element (Events triggered by user)
     * @type {jQuery}
     */
    self.audioElement = $('#audioElement').bind('play', function () {
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
        if ((self.playlistSongIndex + 1) < self.playlist.songs.length) {

            self.playlistSongIndex++;
            self.loadSongFile(self.playlistSongIndex);
            self.audioElement.play();

        } else {
            self.audioElement.pause();
            self.playlistSongIndex = 0;
            self.loadSongFile(self.playlistSongIndex);
        }
    };

    /**
     * Load song from existing playlist
     * @param playlistSongIndex
     */
    self.loadSongFile  = function (playlistSongIndex) {

        if (playlistSongIndex >= 0 && playlistSongIndex < self.playlist.songs.length) {

            self.playlistSongIndex = playlistSongIndex;
            self.npTitleElement.text(self.playlist.songs[playlistSongIndex].song_name);
            self.audioElement.src = mediaPath + self.playlist.songs[self.playlistSongIndex].song_id + self.fileExtension;

        } else {
            self.audioElement.pause();
            console.log('Error: Selected song not found');
        }
    };

    /**
     * Load and play song from existing playlist
     * @param playlistSongIndex
     */
    self.playSongFile = function (playlistSongIndex) {
        self.loadSongFile(playlistSongIndex);
        self.audioElement.play();
    };

    /**
     * Skip to previous song in playlist
     */
    self.previousSong = function () {

        if (self.playlistSongIndex - 1 > -1) {
            self.playlistSongIndex--;
            self.loadSongFile(self.playlistSongIndex);

            if (self.isPlaying) {
                self.audioElement.play();
            }

        } else {
            self.audioElement.pause();
            self.playlistSongIndex = 0;
        }
    };

    /**
     * Skip to next song in playlist
     */
    self.nextSong = function () {
        if (self.playlistSongIndex + 1 < self.playlist.songs.length) {
            self.playlistSongIndex++;
            self.loadSongFile(self.playlistSongIndex);

            if (self.isPlaying) {
                self.audioElement.play();
            }
        }
        else {
            self.npActionElement.text('Paused...');
            self.audioElement.pause();
            self.playlistSongIndex = 0;
        }
    };

    /**
     * Build playlist in playlistElement
     */
    self.buildPlaylist = function () {

        //Remove current playlist
        self.playlistElement.html('');

        //Build new playlist
        self.playlist.songs.forEach(function (songFromPlaylist) {
            self.playlistElement.append(
                '<li><div class="plItem">' +
                '<i class="control removeSongFromPlaylist fa fa-times fa-2x" style="color:#cc2b00"></i>' +
                '<div class="plNum">' + (self.playlist.songs.indexOf(songFromPlaylist) + 1) + '</div>' +
                '<div class="plTitle">' + songFromPlaylist.song_name + '</div>' +
                '<div class="plLength">' + songFromPlaylist.duration + '</div>' +
                '</div></li>');
        });

        /**
         * Add play feature to items in playlist
         */
        playlistElement.find('li').click(function () {

            var playlistSongIndex = parseInt($(this).index());
            self.playSongFile(playlistSongIndex);
        });

        /**
         * Add remove feature to items in playlist
         */
        playlistElement.find('.removeSongFromPlaylist').click(function () {

            var playlistSongIndex = parseInt($(this).index());
            self.removeSongFromPlaylist(playlistSongIndex);
        });

        self.loadSongFile(self.playlistSongIndex);
    };

    /**
     * Add new song to existing playlist and rebuild it
     * @param newSong
     */
    self.addSongToPlaylist = function (newSong) {
        self.playlist.addNewSong(newSong);
        self.buildPlaylist();
    };

    /**
     * Remove selected song from existing playlist and rebuild it
     * @param playlistSongIndex
     */
    self.removeSongFromPlaylist = function (playlistSongIndex) {
        self.playlist.removeSong(playlistSongIndex);
        self.buildPlaylist();
    };

    /**
     * Initialisation
     */
    self.buildPlaylist();
    //self.loadSongFile(self.playlistSongIndex);
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