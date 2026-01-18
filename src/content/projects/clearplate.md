---
title: "ClearPlate"
description: "ClearPlate uses cutting-edge computer vision and regression models to estimate food waste weight and composition from images, helping institutions reduce environmental impact."
pubDate: "Aug 8 2025"
heroImage: "/projects/clearplate/header.png"
badge: "Computer Vision"
tags: ["Computer Vision", "Foodwaste", "Segmentation", "Consumption Insights", "XGBoost"]
---

ClearPlate is a computer vision pipeline that detects and estimates food waste from plate images using segmentation, depth-aware estimation, and regression models. Designed to reduce manual annotation effort and improve sustainability tracking, ClearPlate is especially useful for F&B outlets, institutions, and food courts seeking data-driven waste reduction strategies.

## Project Context

The inspiration for ClearPlate came from our experience as NUS RC4 students, where we observed a significant amount of food being thrown away in the dining halls. We realized that while many solutions exist to track food waste at the production and preparation levels, few address waste insights at the **post-consumption** level.

Additionally, many existing solutions are often costly, relying on complicated weighing scales and image classification models that lack the **granularity** needed for in-depth analysis. These systems can't distinguish between different food types on a single plate, making it difficult to understand *what* is being wasted, not just *how much*.

We aimed to solve this by developing a system that identifies all food types on a plate and estimates their weight, **purely from a single image** which could provide a more detailed, cost-effective, and scalable solution for waste analysis.

This project was developed for the **Engineering Innovation Challenge 2025**, where our solution was recognized with a **Merit Award**.

---

## Project Goals and Impact

The goal of ClearPlate is to provide actionable insights for both dining hall managers and individual users. By tracking post-consumption food waste, dining halls can make data-driven decisions to **adjust serving sizes** and improve menu planning. Simultaneously, the platform aims to empower **users to track their own waste**, fostering a greater awareness and encouraging behavioral changes. This dual approach ensures that both parties can actively contribute to reducing food waste.

The pipeline is built with **scalability and rapid adaptability** in mind. Our system is designed to learn and adapt to new menus quickly. With a user-friendly interface, dining hall staff can simply scan a few images, perform some quick labeling, and update the model in under 30 minutes. This quick and easy process ensures the solution remains relevant and effective, even with constantly changing menus.

---

## Tech Stack

We combine multiple state-of-the-art AI tools:

-   **Meta SAMv2** for rapid instance segmentation with minimal manual labeling.
-   **YOLO11** for food and reference object (e.g., coin) detection.
-   **XGBoost** for monocular depth reconstruction.
-   **OpenCV** for post-processing and analysis.
-   **Gradio** frontend for user-friendly visual inspection.

## Environmental Impact

ClearPlate aims to help kitchens and policymakers:

-   Quantify exactly how much and what type of food is being wasted
-   Identify trends over time (e.g. high rice wastage every Monday lunch)
-   Improve procurement planning
-   Meet ESG and sustainability goals with real data

## Demo Video

![Demo](/projects/clearplate/demo.gif)


## Deployment Ready

The full system is containerized via Docker and can be deployed on-prem or in the cloud. It supports API-based integration with existing food inventory or POS systems.

---

## The Team

![Team Photo of the ClearPlate team](/projects/clearplate/team.png)

This project was a collaborative effort by a dedicated team of problem solvers:

- [Don Han](https://www.linkedin.com/in/donhanyc/) – NUS Year 1 Business & Communications & New Media (DDP)
- [Ng Jun Wei (me!)](https://www.linkedin.com/in/jun-wei-ng-2b06b6251/) – NUS Year 3 Civil Engineering
- [Ryan Tan](https://www.linkedin.com/in/ryan-tan-yan-tong/) – NUS Year 3 Business & Business Analytics (DDP)
- [Teo Jia Xin](https://www.linkedin.com/in/teojiaxin/) – NUS Year 3 Environmental Engineering & Economics (DDP)

Special mention to our mentor [Dr Jovan Tan](https://www.linkedin.com/in/jovantan/), for his guidance and unwavering support, and students and staff of RC4 for helping us in our data collection! 

---

## Project Links

-   **[GitHub Repository](https://github.com/awpbash/ClearPlate)**

---
