const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const app = express();
const cors = require("cors");
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const PLACEHOLDER_PATTERNS = [
  /\[.*?\]/gi,
  /_{3,}/g,
  /\bTBD\b/gi,
  /\bXXX\b/gi,
  /\bTO BE FILLED\b/gi,
  /\bTO BE COMPLETED\b/gi,
];

const CRUCIAL_CHECKS = {
  testator_name: [
    /\bi,\s+[a-z][a-z\s]+/i,
    /\btestator\b/i,
    /\bname of testator\b/i,
  ],
  date: [
    /\bdate\b/i,
    /\bdated this\b/i,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i,
  ],
  signature_section: [
    /\bsignature\b/i,
    /\bsignature of testator\b/i,
    /\bsigned by\b/i,
  ],
  witness_section: [
    /\bwitness\b/i,
    /\bwitnesses\b/i,
    /\bin the presence of\b/i,
  ],
  beneficiary: [
    /\bbeneficiary\b/i,
    /\bbeneficiaries\b/i,
    /\bgive, devise,? and bequeath\b/i,
    /\bi leave\b/i,
    /\bto my\b/i,
  ],
  executor: [
    /\bexecutor\b/i,
    /\bexecutrix\b/i,
    /\bpersonal representative\b/i,
    /\bappoint\b.*\bas executor\b/i,
  ],
};

function findPlaceholders(text) {
  const found = [];
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) found.push(...matches);
  }
  return found;
}

function sectionExists(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function checkSections(text) {
  const results = {};
  for (const [section, patterns] of Object.entries(CRUCIAL_CHECKS)) {
    results[section] = sectionExists(text, patterns);
  }
  return results;
}

function detectBlankSignatureLines(text) {
  const patterns = [
    /signature\s*[:\-]?\s*_{3,}/gi,
    /signature of testator\s*[:\-]?\s*_{3,}/gi,
    /witness\s*signature\s*[:\-]?\s*_{3,}/gi,
    /signed by\s*[:\-]?\s*_{3,}/gi,
  ];

  const hits = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) hits.push(...matches);
  }
  return hits;
}

function detectMissingNames(text) {
  const issues = [];

  const witness1Exists = /witness\s*1.*?name\s*:\s*[A-Za-z]/is.test(text);
  const witness2Exists = /witness\s*2.*?name\s*:\s*[A-Za-z]/is.test(text);

  if (/witness\s*1/i.test(text) && !witness1Exists) {
    issues.push("Witness 1 name appears missing");
  }

  if (/witness\s*2/i.test(text) && !witness2Exists) {
    issues.push("Witness 2 name appears missing");
  }

  const testatorNameExists = /\bi,\s+[A-Za-z][A-Za-z\s]+/i.test(text);
  if (!testatorNameExists) {
    issues.push("Testator name appears missing");
  }

  return issues;
}

function detectBlankKeyFields(text) {
  const issues = [];

  const patterns = {
    "Date appears blank": [/date\s*:\s*_{3,}/i, /dated this\s*_{3,}/i],
    "Place appears blank": [/place\s*:\s*_{3,}/i],
    "Executor name may be missing": [
      /executor\s*:\s*_{3,}/i,
      /appoint\s*_{3,}\s*as executor/i,
    ],
    "Beneficiary name may be missing": [
      /beneficiary\s*:\s*_{3,}/i,
      /to\s*_{3,}/i,
    ],
  };

  for (const [issue, pats] of Object.entries(patterns)) {
    if (pats.some((p) => p.test(text))) {
      issues.push(issue);
    }
  }

  return issues;
}

function scoreDocument(
  sectionResults,
  placeholderHits,
  blankSignatureHits,
  missingNameIssues,
  blankFieldIssues
) {
  let score = 100;
  const issues = [];

  const requiredSections = {
    testator_name: 20,
    date: 15,
    signature_section: 10,
    witness_section: 15,
    beneficiary: 15,
    executor: 15,
  };

  for (const [section, penalty] of Object.entries(requiredSections)) {
    if (!sectionResults[section]) {
      score -= penalty;
      issues.push(`Missing or unclear: ${section.replace(/_/g, " ")}`);
    }
  }

  if (placeholderHits.length > 0) {
    const strongPlaceholders = placeholderHits.filter(
      (p) =>
        p.includes("[") ||
        p.toUpperCase().includes("TBD") ||
        p.toUpperCase().includes("XXX")
    );

    const underscorePlaceholders = placeholderHits.filter((p) =>
      p.includes("_")
    );

    if (strongPlaceholders.length > 0) {
      score -= Math.min(strongPlaceholders.length * 8, 24);
      issues.push(
        `Draft placeholders detected: ${strongPlaceholders
          .slice(0, 5)
          .join(", ")}`
      );
    }

    if (underscorePlaceholders.length > 0) {
      score -= Math.min(underscorePlaceholders.length * 3, 12);
      issues.push("Blank fill-in lines detected");
    }
  }

  if (blankSignatureHits.length > 0) {
    score -= 20;
    issues.push("Signature line appears blank / likely unsigned");
  }

  for (const issue of missingNameIssues) {
    score -= 12;
    issues.push(issue);
  }

  for (const issue of blankFieldIssues) {
    score -= 10;
    issues.push(issue);
  }

  score = Math.max(score, 0);

  const hasStrongDraftPlaceholders = placeholderHits.some(
    (p) =>
      p.includes("[") ||
      p.toUpperCase().includes("TBD") ||
      p.toUpperCase().includes("XXX")
  );

  let status = "Needs review";

  if (blankSignatureHits.length > 0) {
    status = "Unsigned / incomplete";
  } else if (hasStrongDraftPlaceholders) {
    status = "Draft / placeholders unresolved";
  } else if (score >= 90) {
    status = "Likely complete";
  } else if (score >= 75) {
    status = "Likely complete with minor review needed";
  } else {
    status = "Likely incomplete";
  }

  return { score, status, issues };
}

async function extractPdfText(buffer) {
  const result = await pdf(buffer);
  return result?.text || "";
}

async function analyzeWillPdf(buffer) {
  const text = await extractPdfText(buffer);

  const sectionResults = checkSections(text);
  const placeholderHits = findPlaceholders(text);
  const blankSignatureHits = detectBlankSignatureLines(text);
  const missingNameIssues = detectMissingNames(text);
  const blankFieldIssues = detectBlankKeyFields(text);

  const scoring = scoreDocument(
    sectionResults,
    placeholderHits,
    blankSignatureHits,
    missingNameIssues,
    blankFieldIssues
  );

  return {
    preview: text.slice(0, 1200),
    section_results: sectionResults,
    placeholders: placeholderHits.slice(0, 10),
    blank_signature_lines: blankSignatureHits.slice(0, 10),
    missing_name_issues: missingNameIssues,
    blank_field_issues: blankFieldIssues,
    score: scoring.score,
    status: scoring.status,
    issues: scoring.issues,
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Will checker service is running" });
});

app.post("/check-will", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await analyzeWillPdf(req.file.buffer);
    return res.status(200).json(result);
  } catch (error) {
    console.error("CHECK-WILL ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Will checker service running on http://127.0.0.1:${PORT}`);
});