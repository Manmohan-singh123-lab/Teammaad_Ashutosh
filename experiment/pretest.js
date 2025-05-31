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
      question: "1. What does the Noise Figure (NF) of an amplifier represent?",  ///// Write the question inside double quotes
      answers: {
        a: "The input power of the amplifier",                  ///// Write the option 1 inside double quotes
        b: "The efficiency of the amplifierThe efficiency of the amplifier",                  ///// Write the option 2 inside double quotes
        c: "The degradation of the signal-to-noise ratio (SNR) due to the amplifier",                  ///// Write the option 3 inside double quotes
        d: "The frequency response of the amplifier"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "c"                ///// Write the correct option inside double quotes
    },

    {
     question: "2. Which unit is commonly used to express Noise Figure?",  ///// Write the question inside double quotes
      answers: {
        a: "Watts",                  ///// Write the option 1 inside double quotes
        b: "dBm",                  ///// Write the option 2 inside double quotes
        c: "dB",                  ///// Write the option 3 inside double quotes
        d: "Ohms"                   ///// Write the option 4 inside double quotes
      },
      correctAnswer: "c"                ///// Write the correct option inside double quotes
    },     
    {
      question: "3. A noise figure of 0 dB indicates:",  ///// Write the question inside double quotes
       answers: {
         a: "Infinite gain",                  ///// Write the option 1 inside double quotes
         b: "Perfect amplifier (no added noise)",                  ///// Write the option 2 inside double quotes
         c: "Zero power consumption",                  ///// Write the option 3 inside double quotes
         d: "Maximum output noise"                   ///// Write the option 4 inside double quotes
       },
       correctAnswer: "b"                ///// Write the correct option inside double quotes
     }, 
     {
      question: "4. Which parameter primarily affects the noise figure of a cascaded system?",  ///// Write the question inside double quotes
       answers: {
         a: "The last stage gain",                  ///// Write the option 1 inside double quotes
         b: "The highest gain stage",                  ///// Write the option 2 inside double quotes
         c: "The first stage noise figure and gain",                  ///// Write the option 3 inside double quotes
         d: "The system bandwidth"                   ///// Write the option 4 inside double quotes
       },
       correctAnswer: "c"                ///// Write the correct option inside double quotes
     },  
     {
      question: "5. What happens to the overall noise figure if a lossy component (like an attenuator) is placed before a low-noise amplifier (LNA)?",  ///// Write the question inside double quotes
       answers: {
         a: "It improves the noise figure",                  ///// Write the option 1 inside double quotes
         b: "It has no effect on the noise figure",                  ///// Write the option 2 inside double quotes
         c: "It significantly degrades the noise figure",                  ///// Write the option 3 inside double quotes
         d: "It increases the amplifier’s gain"                   ///// Write the option 4 inside double quotes
       },
       correctAnswer: "c"                ///// Write the correct option inside double quotes
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