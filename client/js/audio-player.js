/**
 * html5media enables <video> and <audio> tags in all major browsers
 * External File: https://api.html5media.info/1.1.8/html5media.min.js
 */

/**
 * AudioPlayer object
 */
function AudioPlayer(npActionElement, npTitleElement, playlistElement, supportedFileFormatExtension) {

    var self = this;

    self.fileExtension = supportedFileFormatExtension;
    //self.audioElement = audioElement;

    /**
     * EventListeners attach (Triggered by user)
     * @type {jQuery}
     */
    self.audioElement = $('#audio1').bind('play', function () {
        console.log('Event "play" fired');
        self.playEvent();
    }).bind('pause', function () {
        console.log('Event "pause" fired');
        self.pauseEvent();
    }).bind('ended', function () {
        console.log('Event "ended" fired');
        self.endedEvent();
    }).get(0);

    //AudioPlayer info labels
    self.npActionElement = npActionElement;
    self.npTitleElement = npTitleElement;

    self.playlistElement = playlistElement;

    self.currentlySelectedSongId = 0;
    self.isPlaying = false;

    self.playlist = [
        new Song(1, "artist xyz", "skladba 1", 0, "2:22"),
        new Song(2, "artist xyz", "skladba 2", 0, "2:22"),
        new Song(3, "artist xyz", "skladba 3", 0, "2:22")];


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
            self.loadSongFile(audioPlayer.currentlySelectedSongId);
        }
    };

    /**
     * Loads given song
     * @param song_id
     */
    self.loadSongFile  = function (song_id) {
        //TODO Dat prec kod ktory pracuje s UI

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
        self.playlistElement.innerHTML = '';

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
     * @param song
     */
    self.addTrackToPlaylist = function (song) {
        self.playlist.push(song);
        self.buildPlaylist();
    };

    /**
     * Initialisation
     */
    self.buildPlaylist();
    self.loadSongFile(self.currentlySelectedSongId);
}

/**
 * Song object
 */
function Song(song_id, artist_id, song_name, album_id, duration) {

    var self = this;

    self.song_id = song_id;
    self.artist_id = artist_id;
    self.song_name = song_name;
    self.album_id = album_id;
    self.duration = duration;
}

var debug = true;

var mediaPath = debug ? 'https://archive.org/download/hometify2017-09-01/' : 'http://192.168.1.5:2000/client/src/playlist/';

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

    var audioPlayer = new AudioPlayer(npActionElement, npTitleElement, playlistElement, fileExtension);

    /**
     * Previous button click
     */
    var btnPrev = $('#btnPrev').click(function () {
        audioPlayer.previousSong();
    });

    /**
     * Next button click
     */
    var btnNext = $('#btnNext').click(function () {
        audioPlayer.nextSong();
    });

    /**
     * Playlist item click
     */
    var li = playlistElement.find('li').click(function () {
        //TODO

        var song_id = parseInt($(this).index()) + 1;

        console.log('Clicked! `song_id` = ' + song_id);

        audioPlayer.playSongFile(song_id);
    });
});