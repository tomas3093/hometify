$(document).ready(function () {

    //TODO dorobit dynamicke zobrazovanie pocas pisania do inputu

    //AJAX post request emitted by button click
    /*$('#submit-btn').click(function () {

        var artistName = $('#artist-name-field').val();

        if (artistName !== "") {

            $.ajax({
                url: "/new/artist/submit",
                type: "POST",
                dataType: "html",
                data: {
                    artist_name: artistName
                },
                cache: false
            });
        }

    });*/

    //AJAX request to API
    /*$.getJSON("http://localhost:2000/data/artist/2", function (data) {
        $('#input-field').val(data.artist_name);
    })*/

});