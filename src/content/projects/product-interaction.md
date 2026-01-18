---
title: "Product Interaction"
description: "A computer vision system to detect product interactions in retail CCTV footage using pose estimation, segmentation, and depth analysis. Built during my internship at Tictag."
pubDate: "August 2025"
heroImage: "/projects/product-interaction/header.png"
tags: ["Computer Vision", "Deep Learning", "Retail Insights", "Video Analytics"]
---

### Overview

During my internship at **Tictag**, I worked on an advanced **product interaction detection system** designed for retail environments. The goal was to analyze monocular CCTV footage and automatically identify when a shopper **interacts with a product** in a specific Region of Interest (ROI) — including whether an item was **picked up**, **put back**, or left untouched.

Instead of relying on basic motion detection, this project leverages **deep learning models**, **pose estimation**, **segmentation**, and **depth perception** to infer intent and behavior, unlocking new potential for **in-store analytics**, **shelf optimization**, and **product placement evaluation**.

---

### Key Objectives

- Detect human interaction with products using overhead or angled CCTV cameras.
- Determine **which ROI** (e.g., product shelf) was interacted with.
- Classify interactions as either **addition** or **removal** of products.
- Enable **retail analytics** for customer behavior without requiring additional sensors.

---

### How It Works

---

To accurately detect product interaction events in retail CCTV footage, we developed a multi-stage vision pipeline that combines object detection, pose estimation, spatial classification, segmentation, frame differencing, and depth analysis.

#### 1. **Person Detection**
- **Model:** `PekingU/rtdetr_r50vd_coco_o365`
- We use RF-DETR, a transformer-based object detector, to detect all human figures in the frame.
- This lightweight and efficient detector offers reliable bounding boxes for tracking individuals in crowded environments.

#### 2. **Pose Estimation**
- **Model:** `usyd-community/vitpose-plus-huge`
- For each detected person, we run ViTPose to extract **17 body keypoints**, including wrists, elbows, shoulders, and more.
- Each keypoint includes a (x, y) coordinate and a confidence score.
- These keypoints are used to infer body pose and the directionality of arm movement, crucial for detecting interactions.

#### 3. **Interaction Classification**
- **Model:** Custom **XGBoost** classifier
- We calculate the **normalized relative distance** between each keypoint and the center of each predefined ROI.
- These relative features help the model learn spatial interaction patterns, independent of camera position and frame resolution.
- The XGBoost model then predicts which (if any) ROI the person is likely interacting with in a given frame.
- This approach is **distance-aware** and allows classification of interaction even in cases where arm contact is ambiguous.

#### 4. **Body Segmentation**
- **Model:** `yolov11m-seg`
- To avoid false positives from moving limbs, we segment out the person’s body inside each ROI.
- This ensures that subsequent change detection steps are only sensitive to object-level changes, not body motion.

#### 5. **Frame Differencing**
- **Technique:** OpenCV’s **BackgroundSubtractorMOG**
- We use background subtraction on cropped ROI patches **before and after** the predicted interaction to detect pixel-level changes.
- If significant visual change is detected, we confirm that an interaction indeed altered the scene.

#### 6. **Depth Estimation**
- **Model:** `Intel/dpt-large`
- To distinguish between **adding** vs **removing** a product, we estimate monocular depth using a DPT model.
- For example:
  - If the average depth in the ROI **increases**, it suggests a product was removed (background revealed).
  - If the average depth **decreases**, it suggests a product was added (foreground occlusion).
- This adds a 3D-awareness component to an otherwise 2D pipeline.

---

This hybrid rule-based and learning-based system enables fine-grained analysis of retail interactions—even under challenging conditions like crowding, occlusion, or suboptimal camera angles.


---

### Challenges Faced

Building a reliable interaction detection system for retail CCTV analytics was far from straightforward. Some of the key challenges we faced include:

- **Occlusion:**  
  Customers often block each other or key body parts, especially in crowded retail spaces, making person detection and pose estimation highly unreliable.

- **Crowding and Overlap:**  
  In dense environments, pose keypoints frequently overlapped or were misattributed, leading to confusion in tracking and interaction mapping.

- **Non-Ideal CCTV Angles:**  
  Most models (like ViTPose or YOLO) are trained on datasets with front-facing or side-view images. Retail CCTV footage typically comes from elevated, angled monocular cameras, resulting in reduced accuracy and distorted detections.

- **Misclassification of Actions:**  
  Standing near an ROI or casually moving an arm could be misclassified as an interaction, while real interactions were sometimes missed due to pose ambiguity.

- **Inaccurate Depth from 2D:**  
  With only monocular input, depth estimation was noisy. It was difficult to accurately determine if a hand was entering, hovering over, or leaving an ROI, leading to false positives or negatives.

- **Pose Estimation Jitter:**  
  Wrist and elbow points were especially noisy, fluctuating across frames and making interaction direction estimation unstable.

- **Performance Bottlenecks:**  
  Processing just 1 minute of video could take **over 6 minutes** on an **NVIDIA A100 GPU**, due to the heavy stack of models—**person detection**, **pose estimation**, **segmentation**, and **depth inference** all run frame-by-frame. This made real-time or near-real-time deployment infeasible without major optimization.

Despite these obstacles, we developed a reasonably robust pipeline by combining multiple vision models and rule-based logic, offering actionable insights for retail clients.

---

### Demo

🚫 **Not Publicly Available**  
The system is currently used internally at Tictag and cannot be shared due to company policy. Please reach out for a private demonstration.

However, here’s a representative demo GIF showcasing the interaction detection in action:

<img src="/projects/product-interaction/pid.gif" width="600" alt="Interaction Detection Demo" />

---

### Reflections

This was my first time integrating **multiple AI models** into a real-world deployment pipeline. I learned how to stitch together multiple stages of perception, work with noisy outputs, and build a practical, scalable solution. It also gave me a deeper appreciation for **human-in-the-loop annotation**, something Tictag specializes in.

---

### Models Used

- **Person Detection:** `PekingU/rtdetr_r50vd_coco_o365`
- **Pose Estimation:** `usyd-community/vitpose-plus-huge`
- **Segmentation:** `yolov11m-seg`
- **Depth Estimation:** `Intel/dpt-large`

---

### Built With

- Python, OpenCV
- ONNX Runtime
- XGBoost
- Hugging Face Transformers
- Tictag’s custom annotation and video processing platform

---

### Internship @ Tictag

This project was part of my internship at **Tictag**, a startup that builds hybrid AI-human data labeling tools. I worked closely with their engineering and product teams to design, build, and iterate on this interaction detection module. It was an eye-opening experience into the messy but rewarding world of applied computer vision.
