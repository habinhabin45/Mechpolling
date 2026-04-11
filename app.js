// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let isAdmin = false;

// POLL ID (share system)
function getPollId() {
  const params = new URLSearchParams(window.location.search);
  let pollId = params.get("poll");

  if (!pollId) {
    pollId = Math.random().toString(36).substring(2, 8);
    const newUrl = window.location.origin + window.location.pathname + "?poll=" + pollId;
    window.history.replaceState({}, "", newUrl);
  }
  return pollId;
}

const pollId = getPollId();

// NAV
function showPage(pageId, el) {
  if (pageId === "resultPage" && !isAdmin) {
    alert("⛔ Admin only!");
    return;
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav button").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");
}

// VOTE
function vote(option) {
  if (localStorage.getItem("voted_" + pollId)) {
    document.getElementById("msg").innerText = "⚠️ Already voted!";
    return;
  }

  db.collection("polls").doc(pollId).collection("votes").add({
    choice: option,
    time: new Date()
  }).then(() => {
    localStorage.setItem("voted_" + pollId, "true");
    document.getElementById("msg").innerText = "✅ Vote submitted!";
  });
}

// ADMIN LOGIN
function adminLogin() {
  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    isAdmin = true;
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("resultTab").style.display = "inline-block";
  } else {
    alert("Wrong password!");
  }
}

// LOAD RESULTS
function loadResults() {
  db.collection("polls").doc(pollId).collection("votes").get().then(snapshot => {
    let A = 0, B = 0;

    snapshot.forEach(doc => {
      if (doc.data().choice === "A") A++;
      if (doc.data().choice === "B") B++;
    });

    let total = A + B;

    let percentA = total ? (A/total)*100 : 0;
    let percentB = total ? (B/total)*100 : 0;

    document.getElementById("barA").style.width = percentA + "%";
    document.getElementById("barA").innerText = percentA.toFixed(1) + "%";

    document.getElementById("barB").style.width = percentB + "%";
    document.getElementById("barB").innerText = percentB.toFixed(1) + "%";
  });
}

// SHARE
function sharePoll() {
  navigator.clipboard.writeText(window.location.href);
  alert("🔗 Link copied!");
}
