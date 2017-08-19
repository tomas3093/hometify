import {TemplateData} from "./TemplateData";

/**
 * Data structure for song-list template
 */
export class SongListData extends TemplateData {

    items: SongData[];

    constructor(title = "", warnings = [], messages = [], successes = [], heading = "", items: SongData[]) {
        super(title, warnings, messages, successes, heading);

        this.items = items;
    }
}

/**
 * Data structure of SongList item
 */
export class SongData {
    song_id:number;
    artist_id:number;
    album_id:number;
    track_name:string;
    artist_name:string;
    album_name:string;
}

