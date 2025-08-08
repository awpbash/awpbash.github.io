---
title: "ClearPlate"
description: "ClearPlate uses cutting-edge computer vision and regression models to estimate food waste weight and composition from images, helping institutions reduce environmental impact."
pubDate: "Aug 8 2025"
heroImage: "/clearplate_demo.webp"
badge: "Computer Vision"
tags: ["Computer Vision", "Foodwaste", "Segmentation", "Consumption Insights", "XGBoost"]
---

ClearPlate is a computer vision pipeline that detects and estimates food waste from plate images using segmentation, depth-aware estimation, and regression models. Designed to reduce manual annotation effort and improve sustainability tracking, ClearPlate is especially useful for F&B outlets, institutions, and food courts seeking data-driven waste reduction strategies.

## 🧠 Technology Stack

We combine multiple state-of-the-art AI tools:

- **Meta SAM** for rapid instance segmentation with minimal manual labeling.
- **YOLO** for food and reference object (e.g., coin) detection.
- **XGBoost** for estimating food weight based on area ratios.
- **OpenCV** for post-processing and analysis.
- **Gradio** frontend for user-friendly visual inspection.

## ⚙️ How It Works

1. User uploads an image of a food tray with a known-size reference (like a coin).
2. YOLO detects food and coin regions.
3. SAM segments food items into classes.
4. Area of food is normalized against coin area.
5. XGBoost regression predicts approximate weight of each food type.

All you need is a smartphone photo — no scales, no manual counting.

## 🌍 Environmental Impact

ClearPlate aims to help kitchens and policymakers:

- Quantify exactly how much and what type of food is being wasted
- Identify trends over time (e.g. high rice wastage every Monday lunch)
- Improve procurement planning
- Meet ESG and sustainability goals with real data

## 🎥 Demo Video

![Demo](https://user-images.githubusercontent.com/yourdemo.gif)

> “With ClearPlate, we reduced food waste by 18% in a single pilot.” – University Dining Manager

## 📦 Deployment Ready

The full system is containerized via Docker and can be deployed on-prem or in the cloud. It supports API-based integration with existing food inventory or POS systems.

---

Want to see ClearPlate in action? Reach out for a private demo — we’d be happy to show you how it works with your own dataset.
