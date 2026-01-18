---
title: "Cloud Code"
description: "A LeetCode-style learning platform for cloud architecture featuring drag-and-drop challenges, real-time cost optimization, and AI-powered evaluation. Built during HackNRoll 2026."
pubDate: "Jan 18 2026"
heroImage: "/cloud-code/demo_archi.png"
badge: "HackNRoll 2026"
tags: ["Cloud Architecture", "AI Evaluation", "Gamification", "React", "Firebase", "OpenAI"]
---

### Overview

**Cloud Code** is an interactive learning platform that gamifies cloud architecture education through LeetCode-style challenges. Developed during **HackNRoll 2026**, a 24-hour hackathon, this project addresses the steep learning curve of cloud infrastructure by providing hands-on, practical experience with drag-and-drop architecture building, real-time cost estimation, and AI-powered feedback.

---

### The Challenge

Learning cloud architecture presents a significant barrier for aspiring developers. The vast ecosystem of cloud services across AWS, Azure, and GCP creates analysis paralysis—students struggle to move from theoretical knowledge to practical application. Traditional learning methods lack immediate feedback, cost awareness, and the gamified progression that keeps learners engaged.

![Comic Strip](/cloud-code/comic_strip.jpg)

The fundamental questions remain: *Which services should I use? How do I know if my architecture is optimal? How much will this actually cost?*

![Meme](/cloud-code/meme.avif)

---

### Solution Architecture

Cloud Code transforms cloud architecture learning into an interactive challenge system modeled after LeetCode's proven gamification approach. Users build cloud solutions through a visual drag-and-drop interface, receiving multi-dimensional evaluation across four critical axes:

- **Functionality**: Validates that the architecture meets the specified requirements and handles the expected workload.
- **Cost Efficiency**: Ensures the solution remains within budget constraints using real-world pricing data.
- **Complexity Analysis**: Evaluates whether the architecture is appropriately scaled—neither over-engineered nor under-provisioned.
- **Best Practices**: Leverages AI evaluation to assess security, scalability, and adherence to cloud architecture principles.

For beginners, the platform includes a structured guided course that provides foundational knowledge before progressing to independent challenges.

---

### Key Features

- **Interactive Drag-and-Drop Builder**
  Visual interface for constructing cloud architectures using services from AWS, Azure, and GCP.

- **Real-Time Cost Estimation**
  Live pricing feedback as components are added, helping users understand the financial implications of architectural decisions.

- **AI-Powered Evaluation**
  GPT-4-based assessment providing detailed feedback on security, scalability, and architectural patterns.

- **Multi-Cloud Support**
  Up-to-date service information across major cloud providers, exposing users to diverse ecosystems.

- **Progressive Challenge System**
  Difficulty-graded challenges (Easy, Medium, Hard) with category-based filtering for targeted learning.

- **Global Leaderboards**
  Competitive rankings to drive engagement and showcase optimal solutions.

- **Guided Learning Path**
  Structured curriculum for absolute beginners, building foundational cloud architecture knowledge.

---

### Platform Interface

#### Homepage
<img src="/cloud-code/homepage.jpg" alt="Cloud Code Homepage" width="100%" />

#### Challenge Interface
<img src="/cloud-code/challenge.jpg" alt="Challenge Builder Interface" width="100%" />

#### Architecture Visualization
<img src="/cloud-code/demo_2.png" alt="Example Cloud Architecture" width="100%" />

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

### Hackathon Context

This project was built during **HackNRoll 2026**, one of Southeast Asia's largest student hackathons. The 24-hour constraint pushed us to focus on core functionality while maintaining a polished user experience. The challenge was balancing technical depth with accessibility—creating a platform that serves both beginners exploring cloud basics and experienced developers refining their architectural skills.

---

### Reflections

Building Cloud Code in 24 hours taught us valuable lessons about rapid prototyping and feature prioritization. The integration of GPT-4 for architecture evaluation was particularly challenging—crafting effective prompts that could assess diverse cloud designs required iterative refinement. We also gained practical experience with Firebase's real-time capabilities and React's component architecture under time pressure.

---

### Demo

Try the live platform: **[https://hnr2026-fe.vercel.app/](https://hnr2026-fe.vercel.app/)**

---

### Project Links

- **[GitHub Repository](https://github.com/awpbash/hacknroll26)**

---
