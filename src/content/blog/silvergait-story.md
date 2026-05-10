---
title: "Building SilverGait, in Singlish"
description: "Six MSBA students, nine weeks, and a clinically grounded frailty assessment that runs on a phone camera. A note on what we built and why we made the calls we made."
pubDate: "May 10 2026"
heroImage: "/projects/silvergait/hero.png"
kind: "hackathon"
relatedProject: "silvergait"
---

The click moment came when we tested SilverGait on ourselves, in Singlish, sitting on chairs in a meeting room at NUS. The joint tracking caught the chair-stand timing, the scoring spat out a number, and someone laughed and said "wait, this actually works." Not the most accurate run we'd ever do, but accurate enough that the system was doing what we built it to do.

That was about 9 weeks in.

SilverGait started with one of my teammates, a pharmacist at Singapore General Hospital, noticing how much clinical time goes into frailty assessments. The Short Physical Performance Battery (SPPB) is a standardized test for community-dwelling seniors: balance stand, 4-metre gait, chair-stand. It needs trained eyes. It doesn't scale. He brought it to the team and we workshopped it from there. Six of us, all NUS MSBA.

Healthcare in Singapore is personal to us. Our parents and grandparents use it. This was our healthcare system, our problem to solve, and we weren't going to half-ass a project on aging Singaporeans. That's not a strategy, it's just how we felt going in.

The actual bottleneck was building and testing. None of us were CS-trained. We spent more time than expected on SWE plumbing and AI debugging. The other bottleneck was clinical grounding. The judges would ask us why we picked Katz ADL, why CFS, why the SPPB cutoffs were what they were. The papers existed but were spread across decades of geriatrics literature, and finding the right ones took as much time as writing the code did.

The architectural decision I'm proud of was making the scoring pipeline fully deterministic. Zero LLM calls. The default startup move would have been "lol gemini, generate the score from this video." Easier to ship, slower to defend. We pushed back on that early because for clinical use, you need predictable outputs. Same input, same score, every time. A clinician needs to be able to trace why. So MoveNet does pose extraction, Gemini Vision evaluates the keypoint trajectories against the SPPB rubric, and a rule-based classifier turns scores into a frailty tier. The chat side, where we actually want creative reasoning (explaining a care plan, answering a question about exercise), runs a LangGraph orchestrator with Gemini sub-agents. LLMs only where you actually need reasoning. The judges noticed.

![CV pipeline](/projects/silvergait/cv.png)

What we ripped out: a full agentic pipeline for the monitoring layer. We had ideas about tool-calling cron jobs, agents that "decide" when to run check-ins, but when we mapped the actual decisions, they were linear. Run check-in, if alert, notify caregiver. There was no agentic graph type shit needed. So we cut it and kept the orchestration where reasoning was actually load-bearing.

The piece I'm most proud of is the caregiver voice cloning. The pitch in our heads was simple: an elderly user is more likely to listen to a familiar voice than to a synthetic one. ElevenLabs lets you clone a short sample of someone the senior already trusts (a son, a daughter, a regular caregiver), and every TTS output uses that voice. It's a small detail in the architecture diagram. It's the entire UX in practice. The first time we played a cloned voice back, that was the moment the team understood what we were building was actually for someone, not just for the demo.

![Voice cloning flow](/projects/silvergait/voice.png)

Things I'd change next time. The big one is real wearables integration. We scoped it in early and cut it because of difficulty. Frailty signals like heart rate variability and gait asymmetry over weeks live in wearables data. The phone-camera assessment is point-in-time, and wearables would close the loop. Probably also a smaller multilingual scope to start. We did English, Mandarin, Malay, and Tamil. MERaLiON handles Singlish. It worked, but each language added testing surface area we didn't have time to be thorough on.

The thing that surprised me most was how varied the team's strengths were. I did the entire stack myself: backend, frontend, the Railway deployment, the API integrations. My teammates ran pitching, the clinical research, and the user study with seniors. Without their parts, the technical demo lands flat. Without my parts, the pitching team has nothing to demo. That's obvious in retrospect, and not obvious at all when you're 6 MSBA students staring at a competition brief.

Also: Claude Code is genuinely the reason a non-CS team ships a multimodal multilingual system in 9 weeks. I would not have written the FastAPI async + SQLAlchemy + LangGraph orchestration that fast on my own.

We placed 2nd at the AI Innovation Challenge 2026.

![The team with the cheque at the finals](/projects/silvergait/team.jpg)

If you want the technical deep-dive, the full architecture write-up lives at the [SilverGait docs site](https://awpbash.github.io/SilverGait/), with 35+ peer-reviewed citations behind the design calls.
