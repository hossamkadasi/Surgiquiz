# SurgiQuiz Beta

Public deployment shell for the SurgiQuiz early beta.

This repository intentionally contains only the shareable beta UI and the **private-study importer UI**. It does **not** contain the private source question dataset, source PDFs, credentials, database files, or other private editorial material.

## Private Study workflow

Open `/private-study.html` and select the current private bank file locally in the browser:

- `SurgiQuiz_Private_Study_Bank_All_3_Books_v7_SourceIntegrity.json`, or
- `SurgiQuiz_Private_Study_Bank_All_3_Books_v7_SourceIntegrity.json.gz`

The reconciled private bank represents **3,840 source questions** across three books:

- Review of Surgery Volume I — 1,365
- Review of Surgery Volume II — 1,391
- MasterPass MCQs for FRCS — 1,084

Source-integrity v7 preserves every source question while removing verified cross-question parsing spillover. It contains 3,828 scored-ready single-answer questions, one matching-format question, 10 questions whose source answer is missing/blank, and one question whose source prints an invalid answer label. No missing or invalid source answer is silently inferred.

The importer currently supports:

- local JSON / JSON.GZ loading without uploading the selected bank through the page
- source-book and chapter filters
- text search
- random, unseen, mistakes-only, and favorites-only study modes
- 10 / 25 / 50 / 100 / all-eligible session sizes
- local favorites, attempts, lifetime accuracy, and mistake queue
- question browser and one-question study launch
- session mistake review
- source-integrity reporting for complex-format items, source-answer anomalies, and recorded numbering gaps

Only question IDs and local study counters are persisted in browser `localStorage`; the source question text remains in the selected private bank file.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node: 22

The production site is connected to `main` for continuous deployment. GitHub Actions builds pull requests to `main` and pushes to `main`.

## Status

Early public preview. Automated content extraction, triage, and curriculum mapping are not equivalent to medical approval. Final published educational content requires human editorial and medical review.
