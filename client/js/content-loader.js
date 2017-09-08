/**
 * Dynamic loading of content to main template via jquery (ajax)
 */
jQuery(function ($) {

    var contentElement = $('#content');

    //current url
    function getCurrentUrl() {
        return window.location.pathname;
    }

    //change url without reloading
    function changePage(path, title, data) {
        window.history.pushState(data, title, path);
        document.title = title;

        console.log(getCurrentUrl());
    }


    contentElement.append('<button id="btn">Still testing</button>');

    var btn = $('#btn').on('click', function () {
        console.log('clicked!');

        changePage('/new/url', 'new title', {});
    });

});