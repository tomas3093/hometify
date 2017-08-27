import {SongListData, SongData} from "./server/classes/SongListData";
import {ArtistData, ArtistListData} from "./server/classes/ArtistListData";
import {AlbumData, AlbumListData} from "./server/classes/AlbumListData";
import {TemplateData} from "./server/classes/TemplateData";

declare function require(name:string);
declare const __dirname;

const express = require('express');
const getJSON = require('get-json');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const util = require('util');

const app = express();
const serv = require('http').Server(app);

//template engine options
app.set('views', './server/views');
app.set('view engine', 'pug');

//support for json and url encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 2001;
serv.listen(port);
console.log('Server started at http://localhost:' + port);

//Database
const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "S3cur3DBRaspi",
    database: "hometify"
});


//########################### ROUTES ###########################

/**
 * Favourite songs
 */
app.get('/', function (req, res) {

    getJSON('http://localhost:2000/data/favourites', function (db_err, items:SongData[]) {

        let songListData: SongListData = new SongListData("Hometify - Your home music streaming",
            undefined, undefined, undefined, "Most played songs", items);

        res.render('song-list', { data: songListData });
    });
});

/**
 * All artists
 */
app.get('/artists', function (req, res) {

    getJSON('http://localhost:2000/data/artists', function (db_err, items: ArtistData[]) {

        let data: ArtistListData = new ArtistListData("Artists",
            undefined, undefined, undefined, "Artists", items);

        res.render('artist-list', {data});
    });
});

/**
 * Songs of certain artist
 */
app.get('/artist/:id', function (req, res) {

    getJSON('http://localhost:2000/data/artist/' + req.params.id + '/songs', function (db_err, items:SongData[]) {

        getJSON('http://localhost:2000/data/artist/' + req.params.id, function (db_err2, artistData:ArtistData) {

            let data: SongListData = new SongListData(artistData.artist_name,
                undefined, undefined, undefined, artistData.artist_name, items);

            res.render('song-list', { data: data });
        });
    });
});

/**
 * All songs from certain album
 */
app.get('/album/:id', function (req, res) {

    getJSON('http://localhost:2000/data/album/' + req.params.id + '/songs', function (db_err, items:SongData[]) {

        getJSON('http://localhost:2000/data/album/' + req.params.id, function (db_err2, albumData:AlbumData) {

            let data: SongListData = new SongListData(albumData.album_name,
                undefined, undefined, undefined,
                albumData.album_name + " (" + albumData.album_year + ")", items);

            res.render('song-list', { data: data });
        });
    });
});


//NEW ARTIST FORM
/**
 * Form for new artist submition
 */
app.get('/new/artist', function (req, res) {

    let data: TemplateData = new TemplateData("New artist", undefined,
        undefined, undefined, "Add new artist");

    res.render('artist-submit-form', { data: data });
});

/**
 * Submitted form data handle
 */
app.post('/new/artist', function (req, res) {

    let data: TemplateData = new TemplateData("New artist", undefined,
        undefined, undefined, "Add new artist");

    let artist: string = req.body.artist_name.trim();

    //INPUT IS VALID
    if (artist.match("^[a-zA-Z0-9][ a-zA-Z0-9\\-']+$")) {

        //Overenie ci zadana hodnota uz existuje
        db.query('SELECT * FROM artists ' +
            'WHERE artist_name = ?', [artist], function (db_err, db_res) {

            //AK NEEXISTUJE, ZAPIS JU DO DB
            if (db_res[0] == null) {

                db.query("INSERT INTO artists (artist_name) VALUES (?)", artist,
                    function (db_err2, db_res_2) {

                        if (db_err2) {
                            data.addWarningMsg('Error: ' + db_err2);
                        } else {
                            data.addSuccessMsg('Artist ' + artist + ' added successfully');
                        }

                        res.render('artist-submit-form', { data: data });
                });

                //AK EXISTUJE
            } else {
                data.addWarningMsg('Error: ' + artist + ' already exists!');

                res.render('artist-submit-form', { data: data });
            }
        });

    } else {
        data.addWarningMsg('Error: Name ' + artist + ' contains forbidden characters or has wrong format!');

        res.render('artist-submit-form', { data: data });
    }
});


//NEW ALBUM FORM
/**
 * Form for new album submition
 */
app.get('/new/album', function (req, res) {

    let data: TemplateData = new TemplateData("New album", undefined,
        undefined, undefined, "Add new album");

    res.render('album-submit-form', { data: data });
});

/**
 * Submitted form data handle
 */
app.post('/new/album', function (req, res) {

    let data: TemplateData = new TemplateData("New album", undefined,
        undefined, undefined, "Add new album");

    let artist_name: string = req.body.artist_name.trim();

    //ARTIST VALIDATION
    db.query('SELECT artist_id FROM artists ' +
        'WHERE artist_name = ?', [artist_name], function (db_err, db_res) {

        //IF ARTIST EXISTS
        if (db_res[0] != null) {

            let artist_id: number = db_res[0].artist_id;

            let album_name: string = req.body.album_name.trim();
            let album_year: number = parseInt(req.body.album_year);

            //ALBUM INPUT VALIDATION
            if (album_name.match("^[a-zA-Z0-9][ a-zA-Z0-9\\-']+$") &&
                album_year > 1800 && album_year <= new Date().getFullYear()) {

                db.query('SELECT * FROM albums ' +
                    'WHERE album_name = ?', [album_name], function (db_err, db_res) {

                    //AK NEEXISTUJE ROVNAKY ALBUM ZAPIS HO DB
                    if (db_res[0] == null) {

                        let q = db.query("INSERT INTO albums (album_name, album_year, artist_id) VALUES (?, ?, ?)",
                            [album_name, album_year, artist_id], function (db_err2, db_res_2) {

                            console.log(q.sql);

                                if (db_err2) {
                                    data.addWarningMsg('Error: ' + db_err2);
                                } else {
                                    data.addSuccessMsg('Album ' + album_name + ' (' + album_year + ') added successfully');
                                }

                                res.render('album-submit-form', { data: data });
                            });

                        //AK EXISTUJE
                    } else {
                        data.addWarningMsg('Error: Album ' + album_name + ' already exists!');

                        res.render('album-submit-form', { data: data });
                    }
                });

            } else {
                data.addWarningMsg('Error: Values contain forbidden characters or have wrong format!');

                res.render('album-submit-form', { data: data });
            }

        } else {
            data.addWarningMsg('Error: Unknown artist!');

            res.render('album-submit-form', { data: data });
        }
    });
});


//NEW SONG FORM
/**
 * Form for new song submition
 */
app.get('/new/song', function (req, res) {

    getJSON('http://localhost:2000/data/favourites', function (err, items: SongData[]) {

        let data: SongListData = new SongListData("New song", undefined,
            undefined, undefined, "Add new song", items);

        if (err) {
            res.json(err);
        } else {
            res.render('song-submit-form', { data: data });
        }
    });
});

/**
 * Submitted form data handle
 */
app.post('/new/song', function (req, res) {

    let data: TemplateData = new TemplateData("New song upload",
        undefined, undefined, undefined, "New song upload");

    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        let oldPath = files.uploaded_file.path;
        let newPath = __dirname + '/server/data/songs/' + files.uploaded_file.name;

        fs.readFile(oldPath, function (err, data) {
            if (err) throw err;

            console.log('file read!');

            //Write file
            fs.writeFile(newPath, data, function (err) {
                if (err) throw err;

                res.send('File uploaded and moved!');
                res.end();
            });

            fs.unlink(oldPath, function (err) {
                if (err) throw err;

                console.log('Tmp file deleted!');
            })
        });
    });

    /*
    //Overenie ci zadana hodnota uz existuje
    db.query('SELECT * FROM songs ' +
        'WHERE track_name = ?', [req.body.track_name], function (db_err, db_res) {

        //AK NEEXISTUJE, ZAPIS JU DO DB
        if (db_res[0] == null) {

            db.query("INSERT INTO songs (track_name) VALUES (?)", req.body.artist_name,
                function (db_err2, db_res_2) {

                    if (db_err2) {
                        console.log(db_err2);
                    } else {
                        data.addSuccessMsg('Song ' + req.body.track_name + ' added successfully');
                    }

                    res.render('song-submit-form', { data: data });
                });

            //AK EXISTUJE
        } else {
            data.addWarningMsg('Error: artist ' + req.body.track_name + ' already exists');

            res.render('song-submit-form', { data: data });
        }
    });*/
});


//AUDIO PLAYER TEST
app.get('/player', function (req, res) {
    res.render('audio-player-test', {});
});


//########################### APIs ###########################

/**
 * Favourite song list
 * Pridat ORDER BY 'play_time' a obmedzenie poctu vysledkov
 *
 * Returns SongData[] JSON
 */
app.get('/data/favourites', function (req, res) {
    db.query(   "SELECT songs.song_id AS song_id, " +
                "artists.artist_id AS artist_id, " +
                "songs.album_id AS album_id, " +
                "songs.track AS track_name, " +
                "artists.artist_name AS artist_name, " +
                "albums.album_name AS album_name " +
                "FROM ((songs INNER JOIN artists ON songs.artist_id = artists.artist_id) " +
                "INNER JOIN albums ON songs.album_id = albums.album_id)",
            function (err, songData:SongData[]) {

        if (err) {
            res.json(err);
        } else {
            res.json(songData);
        }
    });
});

/**
 * Search for items which contains certain string in table artists
 *
 * Returns ArtistData[] JSON
 */
app.get('/data/artists/contains/:string', function (req, res) {
    db.query(   "SELECT artist_id AS artist_id, " +
                "artist_name AS artist_name " +
                "FROM artists WHERE artist_name LIKE ?",
                '%' + [req.params.string] + '%', function (err, rows: ArtistData[]) {

        if (err) res.json(err);
        res.json(rows);
    });
});

/**
 * Search for items which starts with certain string in table artists
 *
 * Returns ArtistData[] JSON
 */
app.get('/data/artists/search/:string', function (req, res) {
    db.query(   "SELECT artist_id AS artist_id, " +
                "artist_name AS artist_name " +
                "FROM artists WHERE artist_name LIKE ?",
                [req.params.string] + '%', function (err, rows: ArtistData[]) {

        if (err) res.json(err);
        res.json(rows);
        });
});

/**
 * List of all artists
 *
 * Returns ArtistData[] JSON
 */
app.get('/data/artists', function (req, res) {

    db.query(   "SELECT artist_id AS artist_id, " +
                "artist_name AS artist_name " +
                "FROM artists", function (err, rows: ArtistData[]) {

        if (err) res.json(err);
        res.json(rows);
    });
});

/**
 * All songs from certain artist
 *
 * Returns SongData[] JSON
 */
app.get('/data/artist/:id/songs', function (req, res) {
    db.query(   "SELECT songs.song_id AS song_id, " +
                "artists.artist_id AS artist_id, " +
                "songs.album_id AS album_id, " +
                "songs.track AS track_name, " +
                "artists.artist_name AS artist_name, " +
                "albums.album_name AS album_name " +
                "FROM ((songs INNER JOIN artists ON songs.artist_id = artists.artist_id) " +
                "INNER JOIN albums ON songs.album_id = albums.album_id) " +
                "WHERE artists.artist_id = ?",
            [req.params.id], function (err, songData:SongData[]) {

            if (err) {
                res.json(err);
            } else {
                res.json(songData);
            }
    });
});

/**
 * All albums from certain artist
 *
 * Returns AlbumData[] JSON
 */
app.get('/data/artist/:id/albums', function (req, res) {
    db.query(   "SELECT albums.album_id AS album_id, " +
                "albums.album_name AS album_name, " +
                "albums.album_year AS album_year, " +
                "COUNT(*) AS songs_count, " +
                "songs.artist_id AS artist_id " +
                "FROM albums INNER JOIN songs ON albums.album_id = songs.album_id " +
                "WHERE songs.artist_id = ? GROUP BY albums.album_id", [req.params.id], function (err, rows: AlbumData[]) {

        if (err) res.json(err);
        res.json(rows);
    });
});

//TODO dorobit songs_count a albums_count
/**
 * Info about certain artist
 * IF param 'id' is number  -> info about artist with certain 'artist_id'
 * IF param 'id' is text    -> info about artist with certain 'artist_name'
 *
 * Returns ArtistData JSON
 */
app.get('/data/artist/:id', function (req, res) {

    let artistData: ArtistData = new ArtistData();
    let param: any = req.params.id;

    //SEARCH ARTIST BY NAME
    if (isNaN(param)) {

        let artist_name: string = param.trim();      //decodes uri

        //Vytiahne z DB meno a pocet songov
        db.query(   "SELECT artists.artist_id AS artist_id, " +
            "artists.artist_name AS artist_name " +
            "FROM artists " +
            "WHERE artists.artist_name LIKE ?", [artist_name], function (db_err, db_res) {

            if (db_err) {
                res.json(db_err);
            } else {

                artistData.artist_id = db_res[0].artist_id;
                artistData.artist_name = db_res[0].artist_name;

                res.json(artistData);
            }
        });

        //SEARCH ARTIST BY ID
    } else {

        let artist_id: number = parseInt(param);

        //Vytiahne z DB meno a pocet songov
        db.query(   "SELECT artists.artist_id AS artist_id, " +
            "artists.artist_name AS artist_name " +
            "FROM artists " +
            "WHERE artists.artist_id = ?", [artist_id], function (db_err, db_res) {

            if (db_err) {
                res.json(db_err);
            } else {

                artistData.artist_id = db_res[0].artist_id;
                artistData.artist_name = db_res[0].artist_name;

                res.json(artistData);
            }
        });
    }
});

/**
 * List of albums
 *
 * Returns AlbumData[] JSON
 */
app.get('/data/albums', function (req, res) {
    //songs_count not implemented
    db.query(   "SELECT albums.album_id AS album_id, " +
                "albums.album_name AS album_name, " +
                "albums.album_year AS album_year, " +
                "-1 AS songs_count," +
                "albums.artist_id AS artist_id " +
                "FROM albums", function (err, rows) {

        if (err) res.json(err);
        res.json(rows);
    });
});

/**
 * Songs from certain album
 *
 * Returns SongData[] JSON
 */
app.get('/data/album/:id/songs', function (req, res) {
    db.query(   "SELECT songs.song_id AS song_id, " +
                "artists.artist_id AS artist_id, " +
                "songs.album_id AS album_id, " +
                "songs.track AS track_name, " +
                "artists.artist_name AS artist_name, " +
                "albums.album_name AS album_name " +
                "FROM ((songs INNER JOIN artists ON songs.artist_id = artists.artist_id) " +
                "INNER JOIN albums ON songs.album_id = albums.album_id) " +
                "WHERE songs.album_id = ?",
        [req.params.id], function (err, songData:SongData[]) {

            if (err) {
                res.json(err);
            } else {
                res.json(songData);
            }
        });
});

/**
 * Info about certain album
 *
 * Returns AlbumData JSON
 */
app.get('/data/album/:id', function (req, res) {

    db.query("SELECT albums.album_id AS album_id, " +
        "albums.album_name AS album_name, " +
        "albums.album_year AS album_year, " +
        "COUNT(*) AS songs_count, " +
        "albums.artist_id AS artist_id " +
        "FROM albums INNER JOIN songs ON albums.album_id = songs.album_id " +
        "WHERE albums.album_id = ? GROUP BY albums.album_id", [req.params.id], function (db_err, db_res: AlbumData[]) {

        if (db_err) {
            res.json(db_err);
        } else {
            res.json(db_res);
        }
    });
});

/**
 * Users can only access '/client' directory
 */
app.use('/client', express.static(__dirname + '/client'));