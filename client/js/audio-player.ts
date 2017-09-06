// html5media enables <video> and <audio> tags in all major browsers
// External File: https://api.html5media.info/1.1.8/html5media.min.js

declare function jQuery(f);

const debug = true;

let extension: string;
const mediaPath = debug ? 'https://archive.org/download/hometify2017-09-01/' : 'http://192.168.1.5:2000/client/src/songs/';

// Add user agent as an attribute on the <html> tag
document.documentElement.setAttribute('data-useragent', navigator.userAgent);
document.documentElement.setAttribute('data-platform', navigator.platform);

/**
 * Track info container
 */
class Track {
    track_id: number;
    track_name: string;
    track_artist: string;
    track_length: string;


    constructor(track_id: number, track_name: string, track_artist: string, track_length: string) {
        this.track_id = track_id;
        this.track_name = track_name;
        this.track_artist = track_artist;
        this.track_length = track_length;
    }
}

/**
 * AudioPlayer container
 */
class AudioPlayer {

    track_id: number;
    playing: boolean;
    tracks: Track[];

    constructor() {

        this.track_id = 0;
        this.playing = false;

        this.tracks = [];
    }
}

jQuery(function ($) {

    const a = document.createElement('audio');
    const supportsMp3: boolean = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));


    //Audio player init
    extension = supportsMp3 ? '.mp3' : '.ogg';

    let audioPlayer: AudioPlayer = new AudioPlayer();

    const npAction = $('#npAction');
    const npTitle = $('#npTitle');

    //Event handlers attach
    let audio = $('#audio1').bind('play', function () {
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
        } else {
            audio.pause();
            audioPlayer.track_id = 0;
            loadTrack(audioPlayer.track_id);
        }
    }).get(0);

    let loadTrack = function (track_id: number) {
        $('.plSel').removeClass('plSel');
        $('#plList').find('li:eq(' + track_id + ')').addClass('plSel');

        npTitle.text(audioPlayer.tracks[track_id].track_name);
        audioPlayer.track_id = track_id;
        audio.src = mediaPath + audioPlayer.tracks[track_id].track_id + extension;
    };

    let playTrack = function (track_id: number) {
        loadTrack(track_id);
        audio.play();
    };

    let buildPlaylist = $.each(audioPlayer.tracks, function (key, value: Track) {

        let trackNumber: string = '' + value.track_id;
        let trackName: string = value.track_name;
        let trackLength: string = value.track_length;

        if (trackNumber.toString().length === 1) {
            trackNumber = '0' + trackNumber;
        } else {
            trackNumber = '' + trackNumber;
        }

        $('#plList').append('<li><div class="plItem"><div class="plNum">' + trackNumber + '.</div><div class="plTitle">' + trackName + '</div><div class="plLength">' + trackLength + '</div></div></li>');
    });

    /**
     * Previous button click
     * @type {any | void}
     */
    let btnPrev = $('#btnPrev').click(function () {
        if ((audioPlayer.track_id - 1) > -1) {
            audioPlayer.track_id--;
            loadTrack(audioPlayer.track_id);

            if (audioPlayer.playing) {
                audio.play();
            }

        } else {
            audio.pause();
            audioPlayer.track_id = 0;
            loadTrack(audioPlayer.track_id);
        }
    });

    /**
     * Next button click
     * @type {any | void}
     */
    let btnNext = $('#btnNext').click(function () {

        //ak nie je este na konci zoznamu
        if ((audioPlayer.track_id + 1) < audioPlayer.tracks.length) {
            audioPlayer.track_id++;
            loadTrack(audioPlayer.track_id);

            if (audioPlayer.playing) {
                audio.play();
            }

        } else {
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
    let li = $('#plList').find('li').click(function () {
        let id = parseInt($(this).index());
        if (id !== audioPlayer.track_id) {
            playTrack(id);
        }
    });

    loadTrack(audioPlayer.track_id);
});