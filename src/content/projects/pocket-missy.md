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

### Overview

**Pocket Missy** is an AI-powered healthcare companion app designed to simplify and personalize healthcare for seniors in Singapore. Developed during HealthHack 2025, this project unifies multiple healthcare services into a single intuitive platform. At its core, Pocket Missy leverages advanced **vector search**, **Retrieval-Augmented Generation (RAG)**, and **Azure OpenAI** integration to provide personalized health insights and actionable recommendations.

---

### The Challenge

Healthcare for seniors is often fragmented, with vital services, appointments, prescriptions, and records scattered across different apps. This creates friction for elderly users and leads to **underreporting of symptoms**, which delays care. Clinicians, too, face cognitive overload, often unable to tap into rich lifestyle and sensor data due to time constraints.

---

### Key Features

- **Unified Health Dashboard**  
  Consolidates vitals, diet, activity, and medical history into one view for users and healthcare providers.

- **"Ask Missy" Multilingual Chatbot**  
  An AI assistant that taps into user data to deliver contextual, personalized responses. Modes include:  
  • Symptom Checker  
  • Medical Summary  
  • Treatment Recommendations  
  • General Health Queries

- **Proactive Health Monitoring**  
  Automatically logs key events like falls or unusual symptoms using wearable sensors and user inputs.

- **AI-Powered Data Retrieval**  
  Combines **IRIS vector search** and **RAG-based prompt engineering** to serve data-relevant, accurate outputs via Azure OpenAI.

---

### Technical Stack

- **Frontend:** React Native (TypeScript)
- **Backend:** Flask (Python)
- **Database:** InterSystems IRIS with vector search
- **NLP:** SentenceTransformer (`pritamdeka/S-PubMedBert-MS-MARCO`)  
- **LLM Integration:** Azure OpenAI API

---

### System Architecture

<img src="/projects/pocket-missy/pocketmissy1.png" width="100%" alt="System Architecture of Pocket Missy" />

---

### Workflow at a Glance

1. Users log health data via sensors or manual input  
2. Data is embedded into vector format and stored in IRIS  
3. Pocket Missy uses **vector search + RAG** to retrieve relevant data  
4. A prompt is sent to Azure OpenAI to generate personalized insights  

---

### Demo

<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="https://www.youtube.com/embed/7Qxpbz3fE30" 
    title="Pocket Missy Demo"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>

---

### Challenges faced

- **First Experience with LLMs & Prompt Engineering**  
  - Steep learning curve designing effective prompts for medical use cases  
  - Balancing accuracy, safety, and user-friendliness in chatbot responses  
  - Multi-language support added complexity to prompt structure and handling

- **Working with InterSystems IRIS Vector Search**  
  - Difficult to run IRIS database locally – required significant setup and system resources  
  - Embedding unstructured data into vector format and managing query performance was non-trivial  
  - Integration with RAG pipeline and Azure OpenAI needed custom data flow handling

- **Time Constraints During Hackathon**  
  - Rapid prototyping under tight deadlines  
  - Limited time to fully optimize database and model performance

> Despite these challenges, we gained hands-on experience with **RAG architecture**, **semantic search**, and building **LLM-driven healthcare applications**.

### Recognition

🏆 **Winner** – HealthHack 2025 Intersystems Challenge  
📍 Built at NUS to improve elderly care and reduce healthcare friction.

---

### The Team

<img src="/projects/pocket-missy/pocketmissy2.png" alt="Pocket Missy Team" width="100%" class="my-4 rounded-lg shadow-md" />

- [Allexis Yu](https://www.linkedin.com/in/allexis-yu-3018a6244/) – NUS Year 2 Business Analytics
- [Gerard Goh](https://www.linkedin.com/in/gerard-goh-ba888521b/) – NUS Year 2 Business Analytics  
- [Lee Xin Yi](https://www.linkedin.com/in/xin-yi-lee-b600552b0/) – NUS Year 3 Medicine  
- [Ng Jun Wei (me!)](https://www.linkedin.com/in/jun-wei-ng-2b06b6251/) – NUS Year 3 Civil Engineering 
- [Ryan Tan](https://www.linkedin.com/in/ryan-tan-yan-tong/) – NUS Year 3 Business & Business Analytics (DDP)

---

### Learn More

- GitHub: [https://github.com/awpbash/healthhack](https://github.com/awpbash/healthhack)  
- Special thanks to the organisers at NUS Yong Loo Lin School of Medicine, judges at GovTech, and sponsors at Intersystems.
