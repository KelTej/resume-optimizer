const analyzeBtn = document.getElementById("analyzeBtn");
const resultsSection = document.getElementById("results");
const atScoreEl = document.getElementById("atsScore");
const summaryEl = document.getElementById("summary");
const strongMatchesEl = document.getElementById("strongMatches");
const missingKeywordsEl = document.getElementById("missingKeywords");
const improvementsEl = document.getElementById("improvements");

analyzeBtn.addEventListener("click", async () => {
  const resume = document.getElementById("resume").value.trim();
  const job_description = document.getElementById("job_description").value.trim();

  if (!resume || !job_description) {
    alert("Please paste both your resume and a job description.");
    return;
  }

  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;
  resultsSection.style.display = "none";

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, job_description })
    });

    const result = await response.json();
    displayResults(result);

  } catch (error) {
    alert("Something went wrong. Make sure the Python server is running.");
    console.error(error);
  } finally {
    analyzeBtn.textContent = "Optimize Resume";
    analyzeBtn.disabled = false;
  }
});

function displayResults(result) {
  atScoreEl.textContent = result.ats_score + "%";

  summaryEl.textContent = result.summary;

  strongMatchesEl.innerHTML = "";
  result.strong_matches.forEach(match => {
    const li = document.createElement("li");
    li.textContent = match;
    strongMatchesEl.appendChild(li);
  });

  missingKeywordsEl.innerHTML = "";
  result.missing_keywords.forEach(keyword => {
    const li = document.createElement("li");
    li.textContent = keyword;
    missingKeywordsEl.appendChild(li);
  });

  improvementsEl.innerHTML = "";
  result.improvements.forEach(item => {
    const div = document.createElement("div");
    div.className = "improvement-item";
    div.innerHTML = `
      <div class="improvement-section">${item.section}</div>
      <div class="improvement-suggestion">${item.suggestion}</div>
    `;
    improvementsEl.appendChild(div);
  });

  resultsSection.style.display = "flex";
}