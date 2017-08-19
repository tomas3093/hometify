import {TemplateData} from "./TemplateData";

/**
 * Data structure for album-list template
 */
export class AlbumListData extends TemplateData {

    items: AlbumData[];

    constructor(title = "", warnings = [], messages = [], successes = [], heading = "", items: AlbumData[]) {
        super(title, warnings, messages, successes, heading);

        this.items = items;
    }
}

/**
 * Data structure of AlbumList item
 */
export class AlbumData {
    album_id: number;
    album_name: string;
    album_year:number;
    songs_count: number;
    artist_id: number;
}