describe("Quiz", function() {
    var state;

  beforeEach(function() {
    var MessageTime = 0

    state = {
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
    state.message(Quiz.EmptyMessage)
    state.messageTime = MessageTime
    state.page(0)
    state.complete(false)
    state.showCorrectAnswer(false)
    state.lockAnswer(false)
    state.quiz({
      title: "",
      description: "",
      questions: [
        { points: 2,
          question_type: "truefalse",
          correct_answer: true,
          selected_answer: true
        },
        { points: 3,
          question_type: "mutiplechoice-single" ,
          title: "Test Title",
          correct_answer: 2,
          selected_answer: 2
        },
        {
          points: 5,
          question_type: "mutiplechoice-multiple",
          correct_answer: [3,4],
          selected_answer: [3,4]
        },
        {
          points: 10,
          question_type: "mutiplechoice-multiple",
          correct_answer: [4,5],
          selected_answer: [4,6]
        }
      ]
    })
    state.resultsMessages({
      results: [
        { 
          maxpoints : 33 
        },
        {
          maxpoints: 66,
          "message": "Not great mate",
        },
        ]
    })
    state.finalResult({
      title: "",
      message: "",
      img: ""
    })
  });

  it("should give the current question", function() {
    state.page(1)
    var question = Quiz.currentQuestion(state)
    expect(question.title).toEqual("Test Title");
  });

  it("should identify correct answer when incorrect answer given", function() {
    state.showCorrectAnswer(true)
    state.page(0)
    var highlightStatus = Quiz.correctAnswerWhenIncorrect(state, false)
    expect(highlightStatus).toBe(false)
  })

  it("should not identify correct answer when correct answer given", function () {
    state.showCorrectAnswer(true)
    state.page(0)
    var highlightStatus = Quiz.correctAnswerWhenIncorrect(state, true)
    expect(highlightStatus).toBe(true)
  })

  it("should not identify correct answer when correct answer given for multiple answers", function () {
    state.showCorrectAnswer(true)
    state.page(3)
    var highlightStatus = Quiz.correctAnswerWhenIncorrect(state, 5)
    expect(highlightStatus).toBe(true)
  })

  it("Should go to next page if questions available", function() {
    state.page(2)
    Quiz.nextPage(state)
    expect(state.page()).toEqual(3)
  });

  describe("When at end of questions", function() {

    var last;

    beforeEach(function () {
      last = state.quiz().questions.length - 1
      state.page(last)
      Quiz.nextPage(state)
    })

      it("Should not go past end of questions", function () {
        expect(state.page()).toEqual(last)
      });

      it("should calculate score correctly", function () {
        expect(state.finalScore()).toEqual(50)
      })

      it("should give final message correctly", function() {
        expect(state.finalResult().message).toEqual("Not great mate")
      })

  })

});
