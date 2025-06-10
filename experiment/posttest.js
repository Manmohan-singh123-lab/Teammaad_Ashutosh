/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////

(function() {
  function buildQuiz() {
    // we'll need a place to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // we'll want to store the list of answer choices
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${letter} :
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        //answerContainers[questionNumber].style.color = "lightgreen";
      } else {
        // if answer is wrong or blank
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////






/////////////// Write the MCQ below in the exactly same described format ///////////////


  const myQuestions = [
    {
      question: "Which of the following best describes the purpose of measuring noise figure in an amplifier?",  ///// Write the question inside double quotes
      answers: {
        a: "To calculate the power output",                  ///// Write the option 1 inside double quotes
        b: "To assess signal distortion",                  ///// Write the option 2 inside double quotes
        c: "To determine how much noise the amplifier adds",                  ///// Write the option 3 inside double quotes
        d: "To evaluate frequency response"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "c"                ///// Write the correct option inside double quotes
    },

    {
      question: " What is the effect of a high noise figure on a communication system?",  ///// Write the question inside double quotes
      answers: {
        a: "Improved bandwidth",                  ///// Write the option 1 inside double quotes
        b: "Increased signal strength",                  ///// Write the option 2 inside double quotes
        c: "Degraded signal quality",                  ///// Write the option 3 inside double quotes
        d: "Reduced input impedance"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "c"             ///// Write the correct option inside double quotes
    },                                
    
    {
      question: "Which measurement method compares output noise levels under two known conditions (hot and cold)?",  ///// Write the question inside double quotes
      answers: {
        a: "S-parameter method",                  ///// Write the option 1 inside double quotes
        b: "Y-factor method",                  ///// Write the option 2 inside double quotes
        c: "Noise ratio method",                  ///// Write the option 3 inside double quotes
        d: "Harmonic balance method"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "b"             ///// Write the correct option inside double quotes
    }, 

    {
      question: "A noise figure of 0 dB implies:",  ///// Write the question inside double quotes
      answers: {
        a: "Infinite SNR",                  ///// Write the option 1 inside double quotes
        b: "No added noise by the amplifier",                  ///// Write the option 2 inside double quotes
        c: "The output is twice the input",                  ///// Write the option 3 inside double quotes
        d: "The amplifier has 100% efficiency"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "b"             ///// Write the correct option inside double quotes
    }, 

    {
      question: " Which parameter in a cascaded system has the most impact on overall noise figure?",  ///// Write the question inside double quotes
      answers: {
        a: "Last stage gain",                  ///// Write the option 1 inside double quotes
        b: "Middle stage bandwidth",                  ///// Write the option 2 inside double quotes
        c: "First stage noise figure and gain",                  ///// Write the option 3 inside double quotes
        d: "Output impedance"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "c"             ///// Write the correct option inside double quotes
    }

    ///// To add more questions, copy the section below 
    									                  ///// this line


    /* To add more MCQ's, copy the below section, starting from open curly braces ( { )
        till closing curly braces comma ( }, )

        and paste it below the curly braces comma ( below correct answer }, ) of above 
        question

    Copy below section

    {
      question: "This is question n?",
      answers: {
        a: "Option 1",
        b: "Option 2",
        c: "Option 3",
        d: "Option 4"
      },
      correctAnswer: "c"
    },

    Copy above section

    */




  ];




/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////


  // display quiz right away
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();


/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
