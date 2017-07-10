"use strict"

var Retrieval = (function () {

    function getQuizData(url, message, load, setUp) {

        var EmptyMessage = ""
        var LoadingMessage = "Retrieving quiz information"
        var LoadingFailMessage = "Sorry - could not retrieve quiz information"

        message(LoadingMessage)
        
        return $.getJSON(url)
            .done(function (data) {
                load(data);
                if (setUp) { setUp(data) };
                message(EmptyMessage);
            })
            .fail(function (data) {
                message(LoadingFailMessage)
            })
    }

    return {
        getQuizData : getQuizData
    }

}());