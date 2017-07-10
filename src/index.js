"use strict"

// As an experiment I structure it like the Elm architecture - a single non-global State object, grouped update functions and separate mutable activity (ajax).

// This uses Knockout.js for basic view binding. Jasmine for unit tests (open SpecRunner.html).

// Things thought of, but decided would be overkill - validate json schema, more thorough unit tests. 

var Main = (function () {

  // Constants
  var MessageTime = 3000 // 3 seconds
  var QuizUrl = "https://proto.io/en/jobs/candidate-questions/quiz.json"
  var ResultsMessagesUrl = "http://proto.io/en/jobs/candidate-questions/result.json"

  // State model
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
    nextQuestion: Quiz.nextQuestion,
    currentQuestion: Quiz.currentQuestion,
    correctAnswerWhenIncorrect: Quiz.correctAnswerWhenIncorrect,
    messageTime: 0
  }

  // Initialisation
  State.message(Quiz.EmptyMessage)
  State.messageTime = MessageTime
  State.page(0)
  State.complete(false)
  State.showCorrectAnswer(false)
  State.lockAnswer(false)
  State.quiz({
    title: "",
    description: "",
    questions: [{
      title: "",
      img: "",
    }]
  })
  State.finalResult({
    title: "",
    message: "",
    img: ""
  })
 
  function setUpQuiz(quiz) {
    quiz.questions.forEach(function (question) {
      question.selected_answer = []
    })
  }

  Retrieval.getQuizData(
    ResultsMessagesUrl,
    State.message,
    State.resultsMessages
  ).done(
    Retrieval.getQuizData(
      QuizUrl,
      State.message,
      State.quiz,
      setUpQuiz
    ).done(
        // Binds html to variables and functions
        $(document).ready(function () {
          ko.applyBindings(State)
        })
      )
    )

}());