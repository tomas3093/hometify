/**
 * html5media enables <video> and <audio> tags in all major browsers
 * External File: https://api.html5media.info/1.1.8/html5media.min.js
 */
var debug = true;

var extension;
var mediaPath = debug ? 'https://archive.org/download/hometify2017-09-01/' : 'http://192.168.1.5:2000/client/src/playlist/';

// Add user agent as an attribute on the <html> tag
document.documentElement.setAttribute('data-useragent', navigator.userAgent);
document.documentElement.setAttribute('data-platform', navigator.platform);


jQuery(function ($) {
    var a = document.createElement('audio');
    var supportsMp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));

    //Audio player init
    extension = supportsMp3 ? '.mp3' : '.ogg';

    var audioPlayer = new AudioPlayer();

    var npAction = $('#npAction');
    var npTitle = $('#npTitle');

    //Event handlers attach
    var audio = $('#audio1').bind('play', function () {
        audioPlayer.isPlaying = true;
        npAction.text('Now Playing...');
    }).bind('pause', function () {
        audioPlayer.isPlaying = false;
        npAction.text('Paused...');
    }).bind('ended', function () {
        npAction.text('Paused...');
        if ((audioPlayer.currentlySelectedSongId + 1) < audioPlayer.playlist.length) {
            audioPlayer.currentlySelectedSongId++;
            loadTrack(audioPlayer.currentlySelectedSongId);
            audio.play();
        }
        else {
            audio.pause();
            audioPlayer.currentlySelectedSongId = 0;
            loadTrack(audioPlayer.currentlySelectedSongId);
        }
    }).get(0);

    var loadTrack = function (song_id) {
        $('.plSel').removeClass('plSel');
        $('#plList').find('li:eq(' + song_id + ')').addClass('plSel');
        npTitle.text(audioPlayer.playlist[song_id].song_name);
        audioPlayer.currentlySelectedSongId = song_id;
        audio.src = mediaPath + audioPlayer.playlist[song_id].song_id + extension;
    };

    var playTrack = function (song_id) {
        loadTrack(song_id);
        audio.play();
    };

    var buildPlaylist = (function () {

        $('#content').append('<div id="plList"></div>');

        $.each(audioPlayer.playlist, function (key, value) {

            $('#plList').append(
                '<li><div class="plItem"><div class="plNum">' + value.song_id + '</div>' +
                '<div class="plTitle">' + value.song_name + '</div>' +
                '<div class="plLength">' + value.duration + '</div></div></li>');
        });
    }());

    /**
     * Previous button click
     * @type {any | void}
     */
    var btnPrev = $('#btnPrev').click(function () {
        if ((audioPlayer.currentlySelectedSongId - 1) > -1) {
            audioPlayer.currentlySelectedSongId--;
            loadTrack(audioPlayer.currentlySelectedSongId);
            if (audioPlayer.isPlaying) {
                audio.play();
            }
        }
        else {
            audio.pause();
            audioPlayer.currentlySelectedSongId = 0;
            loadTrack(audioPlayer.currentlySelectedSongId);
        }
    });

    /**
     * Next button click
     * @type {any | void}
     */
    var btnNext = $('#btnNext').click(function () {

        //ak nie je este na konci zoznamu
        if ((audioPlayer.currentlySelectedSongId + 1) < audioPlayer.playlist.length) {
            audioPlayer.currentlySelectedSongId++;
            loadTrack(audioPlayer.currentlySelectedSongId);
            if (audioPlayer.isPlaying) {
                audio.play();
            }
        }
        else {
            npAction.text('Paused...');
            audio.pause();
            audioPlayer.currentlySelectedSongId = 0;
            loadTrack(audioPlayer.currentlySelectedSongId);
        }
    });

    /**
     * Playlist item click
     */
    var li = $('#plList').find('li').click(function () {
        var id = parseInt($(this).index());
        if (id !== audioPlayer.currentlySelectedSongId) {
            playTrack(id);
        }
    });
    loadTrack(audioPlayer.currentlySelectedSongId);
});

/**
 * AudioPlayer object
 */
var AudioPlayer = (function () {

    function AudioPlayer() {

        this.currentlySelectedSongId = 0;
        this.isPlaying = false;
        this.playlist = [
            new Song(1, "artist xyz", "skladba 1", "2:22"),
            new Song(2, "artist xyz", "skladba 2", "2:22"),
            new Song(3, "artist xyz", "skladba 3", "2:22")];

        this.addTrackToPlaylist = function (song) {
            this.playlist.push(song);
        };
    }

    return AudioPlayer;
}());

/**
 * Song object
 */
var Song = (function () {
    function Song(song_id, artist_id, song_name, album_id, duration) {
        this.song_id = song_id;
        this.artist_id = artist_id;
        this.song_name = song_name;
        this.album_id = album_id;
        this.duration = duration;
    }
    return Song;
}());