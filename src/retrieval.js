"use strict"

var Retrieval = (function () {

    function getQuizData(url, message, validate, load, setUp) {

        var EmptyMessage = ""
        var LoadingMessage = "Retrieving quiz information"
        var LoadingFailMessage = "Sorry - could not retrieve quiz information"

        message(LoadingMessage)
        return $.getJSON(url)
            .done(function (data) {
                if (validate(data)) {
                    load(data);
                    if (setUp) { setUp(data) };
                    message(EmptyMessage);
                }
                else {
                    message(LoadingFailMessage)
                }
            })
            .fail(function (data) {
                message(LoadingFailMessage)
            })
    }

    return {
        getQuizData : getQuizData
    }

}());