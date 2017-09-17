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

$(document).ready(function () {

    //Check for supported audio format
    var a = document.createElement('audio');
    var supportsMp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    var fileExtension = supportsMp3 ? '.mp3' : '.ogg';

    var contentElement = $('#main-content');

    //AudioPlayer HTML Elements
    var playlistElement = $('#playlist');
    var playerSongNameLabel = $('#playerSongNameLabel');
    var playerArtistNameLabel = $('#playerArtistNameLabel');
    var btnBack = $('#btnBack');
    var btnPlayPause = $('#btnPlayPause');
    var btnNext = $('#btnNext');

    var audioPlayer = new AudioPlayer(btnPlayPause, playerSongNameLabel, playerArtistNameLabel, playlistElement, fileExtension);


    //######################## CONTENT LOADER #########################################

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
        contentElement.prepend('<table class="song-list"></table>');
        var song_list = $('.song-list');

        songs.forEach(function (song) {
            song_list.append(
                '<tr class="song">' +
                '<td class="img-box"><img src="/client/img/flaticon/note.svg" alt="" width="50" height="50"></td>' +

                //Identifikacne udaje pesnicky
                '<td class="song_id" hidden>' + song.song_id + '</td>' +
                '<td class="artist_id" hidden>' + song.artist_id + '</td>' +
                '<td class="song_name" hidden>' + song.song_name + '</td>' +
                '<td class="album_id" hidden>' + song.album_id + '</td>' +
                '<td class="duration" hidden>' + song.duration + '</td>' +

                '<td><strong>' + song.artist_name + '</strong></td>' +
                '<td>' + song.song_name + '</td>' +
                '<td class="control"><i class="fa fa-play fa-2x" style="color:#cc2b00"></i></td>' +
                '<td class="control addToPlaylistBtn"><i class="fa fa-plus fa-2x" style="color:#cc2b00"></i></td>' +
                '<td class="control"><i class="fa fa-ellipsis-v fa-2x" style="color:#cc2b00"></i></td>' +
                '</tr>');
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

    //######################## AUDIO PLAYER #########################################

    /**
     * Play button click
     */
    btnPlayPause.click(function () {
        audioPlayer.playPauseEvent();
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

    //### TESTING ###

    contentElement.append('<button id="btn">Change url (test)</button>');

    $('#btn').on('click', function () {
        console.log('clicked!');
        changePage(ARTISTS_URL.url, ARTISTS_URL.title, {});
    });
});


//################## LOGIC ##################

/**
 * AudioPlayer and playlist logic
 */
function AudioPlayer(btnPlayPause, playerSongNameLabel, playerArtistNameLabel, playlistElement, supportedFileFormatExtension) {

    var self = this;

    self.fileExtension = supportedFileFormatExtension;

    self.btnPlayPause = btnPlayPause;

    //AudioPlayer info labels
    self.playerSongNameLabel = playerSongNameLabel;
    self.playerArtistNameLabel = playerArtistNameLabel;

    self.playlistElement = playlistElement;

    self.playlistSongIndex = NO_SONG_SELECTED;
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

        getSongByIndex: function (playlistSongIndex) {
            try {
                return self.playlist.songs[playlistSongIndex];
            } catch (indexOutOfBoundsException) {
                console.log('Error: ' + indexOutOfBoundsException);
                return null;
            }
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
        if (self.playlist.songs.length > 0) {
            self.isPlaying = true;
        }
    };

    /**
     * `pause` event handler
     */
    self.pauseEvent = function () {
        self.isPlaying = false;
    };

    /**
     * 'ended' event handler
     */
    self.endedEvent = function () {

        //If current index is not at the end of the playlist
        if ((self.playlistSongIndex + 1) < self.playlist.songs.length) {

            self.playlistSongIndex++;
            self.loadSongFile(self.playlistSongIndex);
            self.audioElement.play();

        } else {
            self.audioElement.pause();
            self.playlistSongIndex = NO_SONG_SELECTED;
            self.loadSongFile(self.playlistSongIndex);
        }
    };

    /**
     * playPause event handler (fired when playPause button is clicked)
     */
    self.playPauseEvent = function () {
        if (self.playlist.songs.length > 0) {

            if (self.playlistSongIndex === NO_SONG_SELECTED) {
                self.playSongFile(0);
            } else if (self.isPlaying) {
                self.audioElement.pause();
                btnPlayPause.find('i').attr('class', 'fa fa-play fa-2x');
            } else {
                self.audioElement.play();
                btnPlayPause.find('i').attr('class', 'fa fa-pause fa-2x');
            }
        }
    };

    /**
     * Load song from existing playlist
     *
     * Return true if successfully loaded selected song, otherwise return false
     * @param playlistSongIndex
     */
    self.loadSongFile  = function (playlistSongIndex) {

        var selectedSong = self.playlist.getSongByIndex(playlistSongIndex);

        if (selectedSong !== null) {

            self.playlistSongIndex = playlistSongIndex;

            self.playerSongNameLabel.html(selectedSong.song_name);
            self.playerArtistNameLabel.html('by ' + selectedSong.artist_id);
            self.audioElement.src = mediaPath + selectedSong.song_id + self.fileExtension;

            return true;

        } else {
            return false;
        }
    };

    /**
     * Load and play song from existing playlist
     * @param playlistSongIndex
     */
    self.playSongFile = function (playlistSongIndex) {

        if (self.loadSongFile(playlistSongIndex)) {
            self.audioElement.play();
            self.playPauseEvent();
        }
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

        } else {
            self.audioElement.pause();
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
                '<tr>' +
                '<td class="control playlistSongTitle">' + songFromPlaylist.song_name + '</td>' +
                '<td class="playlistSongDuration">' + songFromPlaylist.duration + '</td>' +
                '<td class="control removeSongFromPlaylist"><i class="fa fa-trash"></i></td>' +
                '</tr>');
        });

        /**
         * Add play feature to items in playlist
         */
        playlistElement.find('.playlistSongTitle').click(function () {

            var playlistSongIndex = parseInt($(this).parent().index());
            self.playSongFile(playlistSongIndex);
        });

        /**
         * Add remove feature to items in playlist
         */
        playlistElement.find('.removeSongFromPlaylist').click(function () {

            var index = parseInt($(this).parent().index());
            self.removeSongFromPlaylist(index);
        });
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

        if (self.playlistSongIndex === playlistSongIndex) {
            self.nextSong();
        }

        self.buildPlaylist();
    };

    /**
     * Initialisation
     */
    self.buildPlaylist();
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