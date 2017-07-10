"use strict"

var Quiz = (function () {

    // As an experiment this is based this on the Elm architecture - a single State object with grouped update functions and separation of mutable activity (ajax) into a separate module

    // This uses Knockout.js for basic view binding.

    // Constants
    var EmptyMessage = ""
    var CorrectMessage = "You are correct! You get points of: "
    var IncorrectMessage = "Er. No. That isn't right..."
    var NoAnswerMessage = "Er. No. A selection is needed. You will have to try again"

    // Navigation
    function nextQuestion(state) {

        state.lockAnswer(true)

        var question = currentQuestion(state)
        if (question.selected_answer.length === 0) {
            state.message(NoAnswerMessage)
            pause(state)
            return
        }

        if(gotItCorrect(question)) {
            state.message(CorrectMessage + question.points)
        }
        else
        {
            state.message(IncorrectMessage)
            state.showCorrectAnswer(true)
        }

        pauseAndGo(state)
    }

    function currentQuestion(state) {
        return state.quiz().questions[state.page()]
    }

    function pause(state) {
        setTimeout(function () {
            state.message(EmptyMessage)
            state.lockAnswer(false)
        }, state.messageTime)
    }

    function pauseAndGo(state) {
        setTimeout(function () {
            state.message(EmptyMessage)
            state.showCorrectAnswer(false)
            state.lockAnswer(false)
            nextPage(state);
        }, state.messageTime)
    }

    function nextPage(state) {
        if (state.page() >= state.quiz().questions.length - 1) {
            state.finalScore(calculateScore(state.quiz().questions))
            state.finalResult(
                finalMessages(state.resultsMessages(), state.finalScore())
            );
            state.complete(true);
        }
        else {
            state.page(state.page() + 1)
        }
    }

    // Validity
    function matchesCorrectAnswer(question, selected_answer) {
        return question.correct_answer.toString() === selected_answer.toString()
    }

    function gotItCorrect(question) {

        switch (question.question_type) {
            case "mutiplechoice-single":
                return matchesCorrectAnswer(question, question.selected_answer);

            case "truefalse":
                return matchesCorrectAnswer(question, question.selected_answer);

            case "mutiplechoice-multiple":
                var correct_answer = question.correct_answer.sort()
                var selected_answer = question.selected_answer.sort()
                return (correct_answer.length === selected_answer.length) &&
                    selected_answer.every(function (answer, index) {
                        return answer.toString() == correct_answer[index].toString()
                    })

        }
    }

    function correctAnswerWhenIncorrect(state, value) {
        var question = currentQuestion(state)

        if (!state.showCorrectAnswer()) return false

        switch (question.question_type) {
            case "mutiplechoice-single":
                return matchesCorrectAnswer(question, value)

            case "truefalse":
                return matchesCorrectAnswer(question, value)

            case "mutiplechoice-multiple":
                return question.correct_answer.indexOf(parseInt(value)) > -1
        }
    }

    // Scoring
    function calculateScore(questions) {
        var total = questions.reduce(
            function (sum, question) {
                return sum + question.points
            }, 0)

        var score = questions.reduce(
            function (sum, question, index) {
                var question = questions[index]
                var pointsForQuestion =
                    gotItCorrect(question) ? question.points : 0
                return sum + pointsForQuestion
            }, 0)

        return Math.round(score * 100 / total)
    }

    function finalMessages(resultsMessages, score) {
        return resultsMessages.results.find(function (category) {
            return score <= category.maxpoints
        })
    }

    return {
        emptyMessage: EmptyMessage,
        currentQuestion: currentQuestion,
        correctAnswerWhenIncorrect: correctAnswerWhenIncorrect,
        nextQuestion: nextQuestion,
        nextPage: nextPage
    }

}());