import {TemplateData} from "./TemplateData";

/**
 * Data structure for artist-list template
 */
export class ArtistListData extends TemplateData {

    items: ArtistData[];

    constructor(title = "", warnings = [], messages = [], successes = [], heading = "", items: ArtistData[]) {
        super(title, warnings, messages, successes, heading);

        this.items = items;
    }
}

/**
 * Data structure of ArtistList item
 */
export class ArtistData {
    artist_id: number;
    artist_name: string;
}