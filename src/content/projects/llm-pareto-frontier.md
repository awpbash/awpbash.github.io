---
title: "Model benchmark explorer"
description: "A configurable comparison of quality, cost, token efficiency, speed, and latency across language, image, voice, and video models."
pubDate: "Sep 28 2026"
stack: ["llm", "multimodal", "data"]
context: "experiment"
tools: ["Three.js", "React", "Astro"]
demo: "https://junwei.ng/benchmarks"
---

Most model leaderboards sort one column at a time. This explorer plots two or three metrics together and recomputes the Pareto frontier for the models on screen.

**[Open the interactive explorer](/benchmarks)**

## What it compares

- Language models: intelligence, measured cost per task, output tokens per task, published token prices, throughput, latency, total response time, and context size.
- Image and video models: Arena quality, media pricing, win rate, comparison count, and rating uncertainty.
- Speech-to-speech models: overall quality, time to first audio, benchmark task cost, voice-agent success, and input/output audio pricing.

The language presets separate token efficiency from cost efficiency. Token efficiency is useful for fixed token budgets. Cost per task is useful for metered APIs. The two metrics can produce different rankings.

## Data pipeline

A scheduled GitHub Action checks daily and refreshes the public Artificial Analysis data once the current copy is at least 47 hours old. Each category has coverage checks. The workflow keeps the last valid dataset if parsing or validation fails.
