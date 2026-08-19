# SurgiQuiz Beta

Public deployment shell for the SurgiQuiz early beta.

This repository intentionally contains only the shareable beta UI and supporting code. It does **not** contain the full private question bank, private editorial data, credentials, database files, medical source PDFs, or verbatim commercial-source datasets.

## Private study workflow

`public/private-study.html` is a local-file study utility. It lets an authorized user select a private SurgiQuiz study-bank JSON/JSON.GZ file from their own device and run filtered study sessions by source book and chapter.

The study-bank file is read in the browser session; the page does not bundle the private bank into this public repository. Questions whose uploaded source has a missing or invalid explicit answer remain flagged and are excluded from scored sessions rather than being silently corrected.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node: 22

The production site should be connected to the `main` branch for continuous deployment.

## Status

Early public preview. Automated content extraction, triage, normalization, and curriculum mapping are not equivalent to medical approval. Final published educational content requires human editorial and medical review.
