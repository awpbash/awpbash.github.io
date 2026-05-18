---
title: "Cloud Code"
description: "A LeetCode-style learning platform for cloud architecture featuring drag-and-drop challenges, real-time cost optimization, and AI-powered evaluation. Built during HackNRoll 2026."
pubDate: "Jan 18 2026"
heroImage: "/projects/cloud-code/demo_archi.png"
badge: "HackNRoll 2026"
stack: ["agents", "llm"]
context: "hackathon"
featured: true
repo: "https://github.com/awpbash/hacknroll26"
demo: "https://hnr2026-fe.vercel.app/"
tools: ["openai", "firebase"]
---

### The pitch

Cloud Code is LeetCode but for cloud architecture. You get a brief ("design a system for X with budget Y"), drag AWS/Azure/GCP services onto a canvas, wire them up, and submit. GPT-4 reads the architecture and grades it. We built it in 24 hours at HackNRoll 2026.

The problem we kept hitting in our own learning: every cloud course teaches you what the services do, but nothing teaches you how to put them together. You learn S3 in a vacuum, Lambda in a vacuum, then stare at a blank diagram tool wondering which combination is sane and how much it'll cost.

![Comic Strip](/projects/cloud-code/comic_strip.jpg)

The actual questions you want answered are: *Which services should I use? Is my architecture overkill or under-built? How much will this thing cost me?*

![Meme](/projects/cloud-code/meme.avif)

---

### How the grading works

A submission gets scored on four things:

- **Functionality.** Does this architecture actually solve the brief?
- **Cost.** Is it within the budget, with live pricing data.
- **Complexity.** Is it appropriately sized, not three Kubernetes clusters when you needed a Lambda.
- **Best practices.** Security, scalability, the things a senior would flag in review.

Beginners get a guided track that walks through the basics before they're thrown at open challenges.

---

### What's actually in there

- Drag-and-drop builder with services from AWS, Azure, and GCP.
- Live cost estimate that updates as you build, using real pricing.
- GPT-4 reviewing your architecture and writing the feedback in plain English.
- Easy / Medium / Hard challenges, filterable by domain (compute, storage, networking).
- A global leaderboard so you can see how your design stacks up.
- A guided beginner track for people who want the fundamentals first.

---

### Platform Interface

#### Homepage
<img src="/projects/cloud-code/homepage.jpg" alt="Cloud Code Homepage" width="100%" />

#### Challenge Interface
<img src="/projects/cloud-code/challenge.jpg" alt="Challenge Builder Interface" width="100%" />

#### Architecture Visualization
<img src="/projects/cloud-code/demo_2.png" alt="Example Cloud Architecture" width="100%" />

---

### Technical Implementation

#### Backend Infrastructure
- **Node.js + Express**: RESTful API handling authentication, challenge management, and submission processing.
- **Firebase Firestore**: NoSQL database storing user profiles, challenge data, and submission history.
- **JWT Authentication**: Secure token-based authentication for user sessions.

#### Frontend Stack
- **React 18**: Component-based UI framework with hooks for state management.
- **Vercel**: Edge-optimized hosting for low-latency global access.

#### AI Integration
- **OpenAI GPT-4**: Natural language evaluation of cloud architectures, providing context-aware feedback on design decisions.

---

### User Workflow

1. **Account Creation**
   Users register with email authentication to track progress and submissions.

2. **Challenge Selection**
   Browse challenges filtered by difficulty (Easy/Medium/Hard) or domain category (Compute, Storage, Networking, etc.).

3. **Architecture Design**
   Use the drag-and-drop canvas to construct cloud solutions, with real-time cost updates and service compatibility indicators.

4. **AI Evaluation**
   Submit solutions for automated assessment across functionality, cost, complexity, and best practices dimensions.

5. **Leaderboard Ranking**
   Compare solutions against the community to identify optimization opportunities and learn from top performers.

6. **Guided Learning**
   For beginners, follow the structured course path covering foundational concepts before attempting challenges.

---

### What we'd do differently

24 hours is enough time to ship a working demo, not enough time to think hard about it. The GPT-4 grading prompt went through maybe ten rewrites in the last six hours alone, because the model would happily approve an architecture that put a database behind no auth or recommend you put everything in Lambda. Most of the prompt work was teaching it to be the senior engineer in code review, not the enthusiastic intern.

Firebase was the right call for the timebox (auth, db, hosting in one) but I'd swap it for something with stricter schema and a saner local dev story if we kept building. The drag-and-drop layer is React-only right now; a serious version would let you export to Terraform or CDK so a grader's verdict translates into something you could actually deploy.

---

### Demo

Try the live platform: **[https://hnr2026-fe.vercel.app/](https://hnr2026-fe.vercel.app/)**

---

### Project Links

- **[GitHub Repository](https://github.com/awpbash/hacknroll26)**

---
