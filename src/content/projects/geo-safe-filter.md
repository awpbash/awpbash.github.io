---
title: "Geo-Safe-Filter"
description: "An AI-powered mobile app that detects and redacts location-revealing elements in photos before sharing, protecting users from unintentional location exposure. Built for TikTok TechJam 2025."
pubDate: "Jul 12 2025"
heroImage: "/projects/geo-safe-filter/image.png"
badge: "TikTok TechJam 2025"
tags: ["Computer Vision", "Privacy", "React Native", "FastAPI", "Gemini", "Grounding DINO"]
---

### Overview

**Geo-Safe-Filter** is a privacy-focused mobile application that automatically detects and blurs location-revealing elements in photos before they are shared online. Built during **TikTok TechJam 2025**, the project addresses a growing concern: AI-powered geolocation can deduce someone's exact location from seemingly innocuous visual clues.

---

### The Problem

A single image can reveal more than you think. A distinctive flag in the corner, an HDB block number, a street sign with just enough detail — these are all clues that geolocation models and determined individuals can exploit to pinpoint where a photo was taken.

While platforms like GeoGuessr treat this as entertainment, the real-world consequences can be severe. In 2023, a Pakistani TikTok creator was located and killed by someone who pieced together her address from her content. Geo-Safe-Filter uses the same AI technology that enables location identification to instead *conceal* those identifying features before images go public.

![GeoGuessr clues](/projects/geo-safe-filter/geoguessr.png)

---

### How It Works

1. **Upload** a photo through the React Native mobile app.
2. **Gemini 2.5 Flash** analyses the image and identifies location-revealing objects (street signs, flags, landmarks, building numbers, etc.).
3. **Grounding DINO** localises the detected objects with bounding boxes.
4. **OpenCV** applies the user's chosen redaction method — blur, mosaic, or noise masking.
5. **Preview** the before/after comparison and download the safe version.

#### Before & After

<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
  <figure style="text-align: center;">
    <img src="/projects/geo-safe-filter/unblurred.jpg" alt="Original image with location clues" width="300" />
    <figcaption style="font-size: 0.85rem; color: gray;">Before: Location indicators visible</figcaption>
  </figure>
  <figure style="text-align: center;">
    <img src="/projects/geo-safe-filter/blurred.jpg" alt="Filtered image with clues redacted" width="300" />
    <figcaption style="font-size: 0.85rem; color: gray;">After: Sensitive elements redacted</figcaption>
  </figure>
</div>

---

### Technical Architecture

#### Frontend
- **React Native** for cross-platform iOS and Android support, providing a native mobile experience for capturing and filtering photos on the go.

#### Backend
- **Python + FastAPI** with GPU acceleration (NVIDIA 4060Ti) for real-time image processing and model inference.

#### AI Models
- **Gemini 2.5 Flash** — Vision-language model for identifying location-revealing objects via API.
- **Grounding DINO** — Open-set object detection for precise localisation of sensitive elements.
- **GeoCLIP** — Geolocation inference model used to demonstrate the risk (showing users *what* AI can deduce from their photos).

#### Image Processing
- **OpenCV** — Blur, mosaic, and noise masking operations applied to detected regions.

---

### Reflections

This project sits at a fun intersection of my interests — GeoGuessr taught me just how much location information hides in plain sight, and building computer vision systems at Tictag and GovTech gave me the tools to do something about it. The core challenge was balancing detection sensitivity (catching subtle clues like partial street signs) with usability (not over-redacting and ruining the photo).

---

### Project Links

- **[GitHub Repository](https://github.com/awpbash/Geo-Safe-Filter)**
