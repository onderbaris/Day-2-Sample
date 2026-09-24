
    (function () {
      "use strict";

      // Theme switch: no storage or network connection required.
      var themeButton = document.getElementById("theme-button");

      themeButton.addEventListener("click", function () {
        var lightMode = document.body.classList.toggle("light");

        themeButton.textContent = lightMode
          ? "Dark mode"
          : "Light mode";

        themeButton.setAttribute("aria-pressed", String(lightMode));
      });

      // Predefined examples for the educational walkthrough.
      var scenarios = {
        research: [
          {
            title: "Plan: define the question",
            description:
              "Identify the research topic, audience, and scope. Decide " +
              "which kinds of sources would support a useful answer."
          },
          {
            title: "Act: gather relevant material",
            description:
              "Use available search or document tools to collect sources. " +
              "Record where each important claim came from."
          },
          {
            title: "Check: compare the evidence",
            description:
              "Look for conflicting findings, missing context, and claims " +
              "that lack support. Revise the draft where needed."
          },
          {
            title: "Deliver: present the summary",
            description:
              "Provide a clear summary with source references, key " +
              "disagreements, and remaining uncertainty."
          }
        ],

        code: [
          {
            title: "Plan: understand the reported bug",
            description:
              "Identify the expected behavior, actual behavior, and steps " +
              "that reproduce the problem."
          },
          {
            title: "Act: investigate and propose a fix",
            description:
              "Inspect relevant code and available error information. " +
              "Make a focused change that addresses the likely cause."
          },
          {
            title: "Check: verify the behavior",
            description:
              "Run suitable checks and test the reported scenario. " +
              "Investigate failures rather than assuming the fix worked."
          },
          {
            title: "Deliver: explain the change",
            description:
              "Summarize what changed, what was checked, and any " +
              "remaining limitations for the reviewer."
          }
        ],

        data: [
          {
            title: "Plan: define the analysis",
            description:
              "Clarify the question, identify relevant columns, and " +
              "decide what a useful output should contain."
          },
          {
            title: "Act: inspect and calculate",
            description:
              "Examine the dataset for missing values and inconsistent " +
              "formats, then calculate the requested summaries."
          },
          {
            title: "Check: validate the results",
            description:
              "Check totals, units, assumptions, and unusual values. " +
              "Make sure conclusions match what the data supports."
          },
          {
            title: "Deliver: report the findings",
            description:
              "Present the results with clear labels and explain " +
              "limitations, including gaps in the underlying data."
          }
        ]
      };

      var scenarioSelect = document.getElementById("scenario");
      var nextButton = document.getElementById("next-button");
      var resetButton = document.getElementById("reset-button");
      var stageTitle = document.getElementById("stage-title");
      var stageDescription = document.getElementById("stage-description");
      var stageItems = document.querySelectorAll(".stages li");
      var currentStage = -1;

      function updateStageMarkers() {
        for (var i = 0; i < stageItems.length; i++) {
          var active = i === currentStage;

          stageItems[i].classList.toggle("active", active);

          if (active) {
            stageItems[i].setAttribute("aria-current", "step");
          } else {
            stageItems[i].removeAttribute("aria-current");
          }
        }
      }

      function resetDemo() {
        currentStage = -1;
        stageTitle.textContent = "Ready to begin";
        stageDescription.textContent =
          "Select a task, then press “Start walkthrough.”";
        nextButton.textContent = "Start walkthrough";
        updateStageMarkers();
      }

      nextButton.addEventListener("click", function () {
        var selectedStages = scenarios[scenarioSelect.value];

        currentStage = (currentStage + 1) % selectedStages.length;

        stageTitle.textContent = selectedStages[currentStage].title;
        stageDescription.textContent =
          selectedStages[currentStage].description;

        nextButton.textContent =
          currentStage === selectedStages.length - 1
            ? "Restart walkthrough"
            : "Next stage";

        updateStageMarkers();
      });

      resetButton.addEventListener("click", resetDemo);
      scenarioSelect.addEventListener("change", resetDemo);

      // Quiz scoring runs entirely in the browser.
      var quizForm = document.getElementById("quiz-form");
      var quizResult = document.getElementById("quiz-result");

      quizForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var correctAnswers = {
          q1: "b",
          q2: "a",
          q3: "c"
        };

        var explanations = {
          q1: "An agent uses AI to select actions toward a goal.",
          q2: "Tools depend on the environment's capabilities and permissions.",
          q3: "Results should be checked against evidence, tests, or review."
        };

        var score = 0;
        var feedback = [];

        Object.keys(correctAnswers).forEach(function (name) {
          var selected = quizForm.querySelector(
            'input[name="' + name + '"]:checked'
          );

          if (selected && selected.value === correctAnswers[name]) {
            score++;
          } else {
            feedback.push(explanations[name]);
          }
        });

        quizResult.textContent =
          "Your score: " + score + " / 3. " +
          (score === 3
            ? "You have the key ideas."
            : feedback.join(" "));
      });

      quizForm.addEventListener("change", function () {
        quizResult.textContent = "";
      });
    })();
  