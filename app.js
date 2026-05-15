/* -------- YES Connected PSHE: app.js (modern modular version) -------- */

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "[gstatic.com](https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js)";

import { auth, db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginView      = document.getElementById("loginView");
  const dashboardView  = document.getElementById("dashboardView");
  const lessonView     = document.getElementById("lessonView");
  const welcomeName    = document.getElementById("welcomeName");
  const userBar        = document.getElementById("userBar");
  const themesGrid     = document.getElementById("themesGrid");

  /* ---------- LOGIN ---------- */
  window.login = async function () {
    const email       = document.getElementById("email").value.trim();
    const password    = document.getElementById("password").value.trim();
    const teacherCode = document.getElementById("teacherCode").value.trim();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("This account isn’t set up yet. Please ask your teacher to create it.");
      } else {
        alert("Login error: " + error.message);
      }
      return;
    }

    const isTeacher = teacherCode === "TEACHER2026"; 
    sessionStorage.setItem("isTeacher", isTeacher ? "true" : "false");
  };

  /* ---------- PASSWORD RESET ---------- */
  window.resetPassword = async function () {
    const email = document.getElementById("email").value.trim();
    if (!email) {
      alert("Enter your email first, then click Forgot Password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset link has been sent! Check your inbox (and spam folder).");
    } catch (err) {
      alert("Error sending reset email: " + err.message);
    }
  };

  /* ---------- AUTH STATE LISTENER ---------- */
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isTeacher = sessionStorage.getItem("isTeacher") === "true";
      loginView.style.display     = "none";
      dashboardView.style.display = "block";
      userBar.style.display       = "flex";
      welcomeName.textContent     = `Signed in as ${user.email}`;
      loadCurriculum(isTeacher);
    } else {
      loginView.style.display     = "flex";
      dashboardView.style.display = "none";
      userBar.style.display       = "none";
    }
  });

  /* ---------- LOGOUT ---------- */
  window.logout = async function () {
    await signOut(auth);
    sessionStorage.clear();
  };

  /* ---------- LOAD CURRICULUM DATA ---------- */
  async function loadCurriculum(isTeacher) {
    try {
      const response = await fetch("lessons.json");
      const data = await response.json();

      themesGrid.innerHTML = "";

      Object.entries(data).forEach(([themeName, modules]) => {
        const themeCard = document.createElement("div");
        themeCard.className = "theme-card";

        let moduleList = "";

        Object.entries(modules).forEach(([moduleName, lessons]) => {
          moduleList += `
            <li>
              <strong>${moduleName}</strong>
              <ul>
                ${lessons
                  .map(
                    (lesson, idx) =>
                      `<li onclick="openLesson('${themeName}', '${moduleName}', ${idx})">
                        ${lesson.title}
                      </li>`
                  )
                  .join("")}
              </ul>
            </li>
          `;
        });

        themeCard.innerHTML = `
          <h3>${themeName}</h3>
          <ul>${moduleList}</ul>
        `;
        themesGrid.appendChild(themeCard);
      });

      if (isTeacher) {
        const note = document.createElement("p");
        note.style.marginTop = "20px";
        note.innerHTML =
          "📊 Teacher View Active – Lesson results will appear here as students work.";
        themesGrid.appendChild(note);
      }
    } catch (err) {
      console.error("Error loading lessons.json:", err);
      themesGrid.innerHTML = "<p>Unable to load curriculum data.</p>";
    }
  }

  // -------------------------------------------------------
  // LESSON PLAYER (STEP 2)
  // -------------------------------------------------------

  let currentLesson = null;
  let currentLessonId = null;

  window.openLesson = function (theme, moduleName, lessonIndex) {
    fetch("lessons.json")
      .then(r => r.json())
      .then(data => {
        const lesson = data[theme][moduleName][lessonIndex];
        currentLesson = lesson;
        currentLessonId = `${theme}_${moduleName}_lesson${lessonIndex}`;

        document.getElementById("lessonTitle").textContent = lesson.title;

        document.getElementById("lessonObjectives").innerHTML =
          lesson.objectives.map(o => `<li>${o}</li>`).join("");

        document.getElementById("lessonVideo").src = lesson.video;

        document.getElementById("lessonActivityPrompt").textContent =
          lesson.activityPrompt;

        document.getElementById("activityInput").value = "";

        document.getElementById("quizQuestion").textContent =
          lesson.quiz.question;

        document.getElementById("quizOptions").innerHTML =
          lesson.quiz.options
            .map(
              (opt, i) =>
                `<label><input type="radio" name="quiz" value="${i}">${opt}</label><br>`
            )
            .join("");

        loginView.style.display = "none";
        dashboardView.style.display = "none";
        lessonView.style.display = "block";
      });
  };

  window.returnToDashboard = function () {
    lessonView.style.display = "none";
    dashboardView.style.display = "block";
    document.getElementById("quizResult").textContent = "";
    document.getElementById("lessonVideo").src = "";
  };

  // -------------------------------------------------------
  // AUTO‑MARK + ACTIVITY SAVE + TIMESTAMP (STEP 3)
  // -------------------------------------------------------

  window.submitQuiz = async function () {
    if (!currentLesson) return;

    const selected = document.querySelector('input[name="quiz"]:checked');
    const resultBox = document.getElementById("quizResult");

    if (!selected) {
      resultBox.textContent = "Please choose an answer.";
      return;
    }

    const chosen = parseInt(selected.value);
    const correct = currentLesson.quiz.answer;
    const score   = chosen === correct ? 1 : 0;

    const activityText = document.getElementById("activityInput").value.trim();
    const timestamp    = new Date().toISOString();
    const userId       = auth.currentUser.uid;

    try {
      const { doc, setDoc } = await import(
        "[gstatic.com](https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js)"
      );

      await setDoc(
        doc(db, "results", userId),
        {
          [currentLessonId]: {
            score,
            activityText,
            timestamp,
            lessonTitle: currentLesson.title
          }
        },
        { merge: true }
      );

      resultBox.textContent =
        score === 1 ? "Correct! Great job." : "Incorrect. Review and try again.";
    } catch (err) {
      console.error("Error saving result:", err);
      resultBox.textContent = "Error saving your work.";
    }
  };

}); // END DOMContentLoaded
