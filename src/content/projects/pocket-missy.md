---
title: "Pocket Missy"
description: "An AI healthcare companion for Singapore seniors that unifies vitals, prescriptions, and records, with a multilingual chatbot powered by vector search and RAG. Winner of HealthHack 2025 Intersystems Challenge."
pubDate: "July 2025"
heroImage: "/projects/pocket-missy/pocketmissy1.png"
badge: "HealthHack 2025"
stack: ["rag", "llm"]
context: "hackathon"
featured: true
repo: "https://github.com/awpbash/healthhack"
tools: ["azure-openai", "intersystems-iris"]
---

Pocket Missy is an AI healthcare companion for Singapore seniors. The pitch is simple: an elderly user opens one app instead of five, gets their vitals, prescriptions, and care history in one view, and asks questions in plain language. Underneath it's RAG over the user's own data with InterSystems IRIS vector search and Azure OpenAI for the chat.

Built at HealthHack 2025, where it won the InterSystems Challenge.

## Why this exists

Healthcare for seniors in Singapore is fragmented in a frustratingly avoidable way. Vitals from one app, appointments from another, prescriptions from a third, records from the hospital portal that an 80-year-old is realistically never going to log into. The result is that symptoms get underreported, prescriptions get missed, and the clinician on the other end has no continuous picture of what's going on between visits.

On the clinician side, the data exists. It's just buried in different systems with different schemas, and a doctor with twelve minutes per consultation isn't going to surface useful patterns from a stream of wearable data.

We wanted one surface that worked for both: simple enough for a senior to use without a tutorial, and rich enough that a clinician could ask "how was this person sleeping last week" and get a real answer.

## What's in it

- **One dashboard.** Vitals, diet, activity, and medical history pulled into a single view for both the senior and their care provider.
- **Ask Missy, the chatbot.** Multilingual, RAG-grounded against the user's own data. The senior asks "what was my blood pressure trend this month" in their own language and the model answers from their actual records, not from generic web content.
- **Proactive monitoring.** Wearable signals (falls, irregular heart rate, etc.) get auto-logged and surfaced before they need to be asked about.
- **Modes for the chatbot.** Symptom checker, medical summary, treatment recommendations, general health Q&A. Each one tunes the retrieval and the prompt for the kind of answer the user is asking for.

## How it works

1. User logs health data via sensors or manual input.
2. Data is chunked, embedded, and stored in IRIS with vector search.
3. When the user asks a question, vector search retrieves the relevant slices of their own record.
4. Retrieved context plus the question goes to Azure OpenAI, which produces the answer.

### Stack

- **Frontend:** React Native (TypeScript)
- **Backend:** Flask (Python)
- **Database:** InterSystems IRIS with vector search
- **Embeddings:** SentenceTransformer (`pritamdeka/S-PubMedBert-MS-MARCO`)
- **LLM:** Azure OpenAI

### System diagram

<img src="/projects/pocket-missy/pocketmissy1.png" width="100%" alt="System Architecture of Pocket Missy" />

## Demo

<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe
    src="https://www.youtube.com/embed/7Qxpbz3fE30"
    title="Pocket Missy Demo"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>

## What was hard

This was my first real run at LLMs and prompt engineering, and the lessons came fast.

- **Prompting for medical contexts is different.** You're not trying to make the model sound impressive. You're trying to make it refuse to guess when it doesn't know, surface uncertainty in plain language, and never confidently say the wrong thing about a drug interaction. We rewrote the system prompt more times than I want to count.
- **IRIS locally was a setup story of its own.** Running the database on our hackathon laptops took non-trivial effort, and the embedding pipeline plus the RAG plus the Azure OpenAI call needed custom glue we had to write under time pressure.
- **Multilingual broke our prompt structure.** Switching languages didn't just mean translating output, it meant rethinking which medical terms to keep in English (drug names) and which to localise (symptom descriptions). Each language we added doubled the testing surface.

Despite all that, we came out with a working multilingual RAG pipeline and a real demo. The InterSystems Challenge win was nice; the part that stuck with me was watching one of the judges, who works in elderly care, try the chatbot and immediately ask follow-up questions about deployment.

## The Team

<img src="/projects/pocket-missy/pocketmissy2.png" alt="Pocket Missy Team" width="100%" class="my-4 rounded-lg shadow-md" />

- [Allexis Yu](https://www.linkedin.com/in/allexis-yu-3018a6244/) – NUS Year 2 Business Analytics
- [Gerard Goh](https://www.linkedin.com/in/gerard-goh-ba888521b/) – NUS Year 2 Business Analytics
- [Lee Xin Yi](https://www.linkedin.com/in/xin-yi-lee-b600552b0/) – NUS Year 3 Medicine
- [Ng Jun Wei (me!)](https://www.linkedin.com/in/jun-wei-ng-2b06b6251/) – NUS Year 3 Civil Engineering
- [Ryan Tan](https://www.linkedin.com/in/ryan-tan-yan-tong/) – NUS Year 3 Business & Business Analytics (DDP)

Thanks to the organisers at NUS Yong Loo Lin School of Medicine, the GovTech judges, and the InterSystems sponsors.

## Links

- GitHub: [github.com/awpbash/healthhack](https://github.com/awpbash/healthhack)
