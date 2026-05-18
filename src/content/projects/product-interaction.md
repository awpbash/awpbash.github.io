---
title: "Product Interaction"
description: "A computer vision system that detects shopper-product interactions in CCTV footage using pose estimation, segmentation, and monocular depth. Built during my internship at Tictag."
pubDate: "August 2025"
heroImage: "/projects/product-interaction/header.png"
badge: "Tictag Internship"
stack: ["vision"]
context: "internship"
featured: true
---

### Overview

This was the main project of my Tictag internship: a computer vision pipeline that watches retail CCTV footage and figures out, for each shopper, when they actually interacted with a product on a shelf and whether they picked it up or put it back.

The reason it's harder than it sounds is that motion detection alone is useless in a retail aisle. People walk past shelves constantly. The signal we care about is the moment a shopper's hand reaches into a specific region of the shelf and a product physically changes. Catching that, on monocular angled CCTV, with crowding and occlusion, was the actual problem.

---

### What it does, end to end

- Detects every person in the frame from a fixed overhead or angled camera.
- Figures out which shelf region (ROI) each person is interacting with.
- Classifies whether they added or removed an item.
- Outputs the event stream for downstream retail analytics, without needing any extra sensors on the shelf.

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

None of these went away. The pipeline we ended up with is a combination of vision models stacked with rule-based filters that catch each model's worst failure modes. "Robust" is the wrong word; "useful, with known limitations" is closer to the truth.

---

### Demo

🚫 **Not Publicly Available**  
The system is currently used internally at Tictag and cannot be shared due to company policy. Please reach out for a private demonstration.

However, here’s a representative demo GIF showcasing the interaction detection in action:

<img src="/projects/product-interaction/pid.gif" width="600" alt="Interaction Detection Demo" />

---

### Reflections

This was the first time I had to stitch a real perception pipeline together rather than treat each model as its own demo. Most of what I learned wasn't about any single model; it was about how noise compounds. Every stage has its own failure modes, and by the time pose estimation passes a jittery wrist into the XGBoost classifier, which passes a borderline call into the depth estimator, the cumulative noise can swamp the signal. Half the work was figuring out where to insert sanity checks and where to lean on rule-based logic to catch the model when it was wrong.

It also made me appreciate why Tictag's whole business model is human-in-the-loop annotation. The cleanest fix for most of the failure modes wasn't a better model. It was a better-labelled corner case.

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

### Internship at Tictag

Tictag is a Singapore startup building hybrid AI/human data-labelling tools. I spent the internship embedded with their engineering and product teams, iterating on this pipeline. It was my first proper exposure to applied CV outside of a coursework setting, and the gap between a clean academic dataset and an actual angled CCTV stream from a real store is the part of the experience I think about most.
