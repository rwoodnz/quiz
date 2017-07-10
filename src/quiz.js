"use strict"

var Quiz = (function () {

    // Constants
    var EmptyMessage = ""
    var CorrectMessage = "You are correct! You get points worth: "
    var IncorrectMessage = "Nah. That isn't right - it was this"
    var NoAnswerMessage = "Nah. A selection is needed. Please try again"

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
            state.message(
                CorrectMessage + Math.round(question.points * 100 / total(state.quiz().questions)) + "%"
            )
        }
        else
        {
            state.message(IncorrectMessage)
            state.showCorrectAnswer(true)
        }

        pauseAndGoToNextPage(state)
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

    function pauseAndGoToNextPage(state) {
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

        var score = questions.reduce(
            function (sum, question, index) {
                var question = questions[index]
                var pointsForQuestion =
                    gotItCorrect(question) ? question.points : 0
                return sum + pointsForQuestion
            }, 0)

        return Math.round(score * 100 / total(questions))
    }

    function total(questions) { 
        return questions.reduce(
            function (sum, question) {
            return sum + question.points
        }, 0)
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