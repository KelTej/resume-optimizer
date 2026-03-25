from flask import Flask, request, jsonify, send_from_directory
import anthropic
import os
import json
import traceback

app = Flask(__name__)

API_KEY = "YOUR_API_KEY_HERE"

client = anthropic.Anthropic(api_key=API_KEY)

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        resume = data.get("resume", "")
        job_description = data.get("job_description", "")

        if not resume or not job_description:
            return jsonify({"error": "Please provide both a resume and job description."}), 400

        prompt = f"""You are an expert ATS (Applicant Tracking System) resume optimizer and career coach.

Analyze the following resume against the job description and return ONLY a valid JSON object with no extra text, no markdown, no backticks.

The JSON must follow this exact structure:
{{
  "ats_score": a number between 0 and 100,
  "summary": "2-3 sentence overall assessment",
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "strong_matches": ["match1", "match2", "match3"],
  "improvements": [
    {{"section": "section name", "suggestion": "specific improvement"}}
  ]
}}

Job Description:
{job_description}

Resume:
{resume}"""

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        raw_text = message.content[0].text.replace("```json", "").replace("```", "").strip()
        print("Raw response:", raw_text)

        result = json.loads(raw_text)
        return jsonify(result)

    except Exception as e:
        print("ERROR:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5500)