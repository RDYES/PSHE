/* -------- YES Connected PSHE: app.js (full version) -------- */

document.addEventListener("DOMContentLoaded", () => {

  const loginView      = document.getElementById("loginView");
  const dashboardView  = document.getElementById("dashboardView");
  const welcomeName    = document.getElementById("welcomeName");
  const userBar        = document.getElementById("userBar");
  const themesGrid     = document.getElementById("themesGrid");

  /* ---------- LOGIN ---------- */
  window.login = async function() {
    const email       = document.getElementById("email").value.trim();
    const password    = document.getElementById("password").value.trim();
    const teacherCode = document.getElementById("teacherCode").value.trim();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      // ---- Sign in existing user only ----
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("This account isn’t set up yet. Please ask your teacher to create it.");
      } else {
        alert("Login error: " + error.message);
      }
      return;
    }

    // Identify teacher vs student using private code
    const isTeacher = teacherCode === "TEACHER2026";  // <- change this secret if you like
    sessionStorage.setItem("isTeacher", isTeacher ? "true" : "false");
  };

  /* ---------- PASSWORD RESET ---------- */
  window.resetPassword = async function() {
    const email = document.getElementById("email").value.trim();
    if (!email) {
      alert("Enter your email first, then click Forgot Password.");
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      alert("Reset link has been sent! Check your inbox (and spam folder).");
    } catch (err) {
      alert("Error sending reset email: " + err.message);
    }
  };

  /* ---------- AUTH STATE LISTENER ---------- */
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Logged in
      const isTeacher = sessionStorage.getItem("isTeacher") === "true";
      loginView.style.display     = "none";
      dashboardView.style.display = "block";
      userBar.style.display       = "flex";
      welcomeName.textContent     = `Signed in as ${user.email}`;
      loadCurriculum(isTeacher);
    } else {
      // Logged out
      loginView.style.display     = "flex";
      dashboardView.style.display = "none";
      userBar.style.display       = "none";
    }
  });

  /* ---------- LOGOUT ---------- */
  window.logout = async function() {
    await auth.signOut();
    sessionStorage.clear();
  };

  /* ---------- LOAD CURRICULUM DATA ---------- */
  async function loadCurriculum(isTeacher) {
    try {
      const response = await fetch("lessons.json");
      const data     = await response.json();
      themesGrid.innerHTML = "";

      Object.entries(data).forEach(([themeName, modules]) => {
        const themeCard = document.createElement("div");
        themeCard.className = "theme-card";

        const moduleList = Object.keys(modules)
          .map(m => `<li>${m}</li>`)
          .join("");

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

});
