// html5media enables <video> and <audio> tags in all major browsers
// External File: https://api.html5media.info/1.1.8/html5media.min.js
var debug = true;
var extension;
var mediaPath = debug ? 'https://archive.org/download/hometify2017-09-01/' : 'http://192.168.1.5:2000/client/src/songs/';
// Add user agent as an attribute on the <html> tag
var b = document.documentElement;
b.setAttribute('data-useragent', navigator.userAgent);
b.setAttribute('data-platform', navigator.platform);
/**
 * Track info container
 */
var Track = (function () {
    function Track(track_id, track_name, track_artist, track_length) {
        this.track_id = track_id;
        this.track_name = track_name;
        this.track_artist = track_artist;
        this.track_length = track_length;
    }
    return Track;
}());
/**
 * AudioPlayer container
 */
var AudioPlayer = (function () {
    function AudioPlayer() {
        this.track_id = 0;
        this.playing = false;
        this.tracks = [new Track(0, "Can't stop the feeling", "Justin Timberlake", "0:00"),
            new Track(1, "We Will Rock You", "Queen", "0:00"),
            new Track(2, "Another Brick In The Wall", "Pink Floyd", "0:00")];
    }
    return AudioPlayer;
}());
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
        audioPlayer.playing = true;
        npAction.text('Now Playing...');
    }).bind('pause', function () {
        audioPlayer.playing = false;
        npAction.text('Paused...');
    }).bind('ended', function () {
        npAction.text('Paused...');
        if ((audioPlayer.track_id + 1) < audioPlayer.tracks.length) {
            audioPlayer.track_id++;
            loadTrack(audioPlayer.track_id);
            audio.play();
        }
        else {
            audio.pause();
            audioPlayer.track_id = 0;
            loadTrack(audioPlayer.track_id);
        }
    }).get(0);
    var loadTrack = function (track_id) {
        $('.plSel').removeClass('plSel');
        $('#plList').find('li:eq(' + track_id + ')').addClass('plSel');
        npTitle.text(audioPlayer.tracks[track_id].track_name);
        audioPlayer.track_id = track_id;
        audio.src = mediaPath + audioPlayer.tracks[track_id].track_id + extension;
    };
    var playTrack = function (track_id) {
        loadTrack(track_id);
        audio.play();
    };
    var buildPlaylist = $.each(audioPlayer.tracks, function (key, value) {
        var trackNumber = '' + value.track_id;
        var trackName = value.track_name;
        var trackLength = value.track_length;
        if (trackNumber.toString().length === 1) {
            trackNumber = '0' + trackNumber;
        }
        else {
            trackNumber = '' + trackNumber;
        }
        $('#plList').append('<li><div class="plItem"><div class="plNum">' + trackNumber + '.</div><div class="plTitle">' + trackName + '</div><div class="plLength">' + trackLength + '</div></div></li>');
    });
    /**
     * Previous button click
     * @type {any | void}
     */
    var btnPrev = $('#btnPrev').click(function () {
        if ((audioPlayer.track_id - 1) > -1) {
            audioPlayer.track_id--;
            loadTrack(audioPlayer.track_id);
            if (audioPlayer.playing) {
                audio.play();
            }
        }
        else {
            audio.pause();
            audioPlayer.track_id = 0;
            loadTrack(audioPlayer.track_id);
        }
    });
    /**
     * Next button click
     * @type {any | void}
     */
    var btnNext = $('#btnNext').click(function () {
        //ak nie je este na konci zoznamu
        if ((audioPlayer.track_id + 1) < audioPlayer.tracks.length) {
            audioPlayer.track_id++;
            loadTrack(audioPlayer.track_id);
            if (audioPlayer.playing) {
                audio.play();
            }
        }
        else {
            npAction.text('Paused...');
            audio.pause();
            audioPlayer.track_id = 0;
            loadTrack(audioPlayer.track_id);
        }
    });
    /**
     * Playlist item click
     * @type {any | void}
     */
    var li = $('#plList').find('li').click(function () {
        var id = parseInt($(this).index());
        if (id !== audioPlayer.track_id) {
            playTrack(id);
        }
    });
    loadTrack(audioPlayer.track_id);
});
//# sourceMappingURL=audio-player.js.map