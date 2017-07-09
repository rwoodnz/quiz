"use strict"

// I've based this on the Elm architecture - a single State object with grouped update functions, separation of mutable activity (ajax) into a separate module, and views being functions of state.

// I've used Knockout.js for view binding.

$(document).ready(function () {
  
  // Constants
  var EmptyMessage = ""
  var CorrectMessage = "You are correct! You get points of: "
  var IncorrectMessage = "Er. No. That isn't right..."
  var NoAnswerMessage = "Please enter your selection"
  var MessageTime = 3000 // 3 seconds

  // State
  var State = {
    message: ko.observable(),
    quiz: ko.observable(),
    resultsMessages: ko.observable(),
    page: ko.observable(),
    complete: ko.observable(),
    showCorrectAnswer: ko.observable(),
    lockAnswer: ko.observable(),
    finalResult: ko.observable(),
    finalScore: ko.observable(),
    nextQuestion: nextQuestion,
    currentQuestion: currentQuestion,
    correctAnswerWhenIncorrect: correctAnswerWhenIncorrect,
  }

  // Initialisation
  State.message(EmptyMessage)
  State.page(0)
  State.complete(false)
  State.showCorrectAnswer(false)
  State.lockAnswer(false)
  State.quiz({
    title: "",
    description: "",
    questions:[{
      title:"",
      img:"",
    }]
  })
  State.finalResult({
    title: "",
    message: "",
    img: ""
  })

  retrieval.getQuizData(
    "http://proto.io/en/jobs/candidate-questions/result.json",
    State.message,
    validateLoadResultMessages,
    State.resultsMessages
  ).done(
    retrieval.getQuizData(
      "https://proto.io/en/jobs/candidate-questions/quiz.json",
      State.message,
      validateLoadQuiz,
      State.quiz,
      setUpQuiz
    ).done(
      // Binds html to variables and functions
      ko.applyBindings(State)
      )
    )

  // State updates
  function validateLoadQuiz(quiz) {
    // TODO
    return true
  }

  function validateLoadResultMessages(resultMessages) {
    // TODO
    return true
  }

  function setUpQuiz(quiz) {
    quiz.questions.forEach(function (question) {
      question.selected_answer = []
    })
  }

  function nextQuestion(state) {
    var question = currentQuestion(state)
    if(question.selected_answer.length == []) {
      state.message(NoAnswerMessage)
      setTimeout(function () {
        state.message(EmptyMessage)
      }, MessageTime)
      return
    }

    var isCorrect = gotItCorrect(question)

    var resultMessage = isCorrect
      ? CorrectMessage + question.points 
      : IncorrectMessage

    state.message(resultMessage)
    state.lockAnswer(true)

    if (!isCorrect) {
      state.showCorrectAnswer(true)
    }

    setTimeout(function () { 
      state.message(EmptyMessage)
      state.showCorrectAnswer(false)
      state.lockAnswer(false)
      nextPage(state);
    }, MessageTime)

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

  // Helpers
  function currentQuestion(state) {
    return state.quiz().questions[state.page()]
  }

  function matchesCorrectAnswer(question, selected_answer) {
    return question.correct_answer.toString() === selected_answer.toString()
  }

  // Quiz validation
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

    if(!state.showCorrectAnswer()) return false

    switch (question.question_type) {
      case "mutiplechoice-single":
        return matchesCorrectAnswer(question, value)

      case "truefalse":
        return matchesCorrectAnswer(question, value)

      case "mutiplechoice-multiple":
        return question.correct_answer.indexOf(parseInt(value)) > -1 
    }
  }

  // Quiz scoring
  function calculateScore(questions) {
    var total = questions.reduce(
      function (sum, question) {
        return sum + question.points
      }, 0)

    var score = questions.reduce(
      function(sum, question, index) {
        var question = questions[index]
        var pointsForQuestion = 
          gotItCorrect(question) ? question.points : 0
        return sum + pointsForQuestion
    }, 0)

    return Math.round(score*100/total)
  }

  function finalMessages(resultsMessages, score) {
    return resultsMessages.results.find(function(category) {
      return score <= category.maxpoints
    })
  }

});








