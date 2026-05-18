---
title: "Construction Bot"
description: "A document retrieval chatbot for the construction industry using vector search and RAG to surface answers from thousands of pages of project documentation."
pubDate: "Aug 1 2025"
heroImage: "/projects/construction-bot/header.png"
badge: "Side Project"
stack: ["rag", "llm"]
context: "experiment"
repo: "https://github.com/awpbash/Construction_Bot"
tools: ["langchain", "openai", "azure"]
---

Construction projects sit on enormous piles of documents: blueprints, contracts, regulations, RFIs, change orders, safety protocols. The information is all there. Finding the right page when you need it is the hard part.

This was a pilot we ran for KTC, a Singapore construction firm. The Construction Bot is a RAG-based chatbot that sits on top of their Autodesk Construction Cloud and answers questions in plain language, with citations back to the source document.

## The actual problem

KTC's Autodesk cloud had over 2TB of project data across hundreds of documents, each running into the hundreds of pages. In the pilot study, it took an experienced engineer about 15 minutes just to figure out who to contact for a pipe-related query, because the answer was buried somewhere in a directory tree.

Site supervisors ask very specific questions ("what's the fire rating for this wall type", "which RFI covers the revised slab thickness on level 7"). The information exists. The lookup is the friction.

## What we built

A pretty standard RAG pipeline, honestly. The interesting choices were less in the architecture and more in how to make it fit a construction workflow.

![Vector Search](/projects/construction-bot/vector.png)

- **Embedding store:** ChromaDB. Light enough to run alongside the existing setup, with hooks back to Azure.
- **Retrieval and generation:** LangChain orchestrating an OpenAI LLM for the answer step.
- **Source integration:** Autodesk Construction Cloud as the document source of truth, so when KTC updates a document, the index reflects it.
- **Citations on every answer.** Every response surfaces the page and chunk the LLM pulled from, so the user can verify against the original document rather than trust the chatbot blindly. This was the feature engineers actually cared about; nobody was going to use a search tool they couldn't fact-check.

The pipeline itself is the textbook one: ingest documents, chunk and embed, store in Chroma, embed the user query, retrieve top-k chunks, pass to the LLM with the question. The work that mattered was on the edges: keeping the index in sync with a live document store, surfacing citations cleanly, and getting answer quality to a point where a site engineer trusted it more than a manual search.

## How it ended

We didn't close the project commercially. The technical pilot worked, the value was real, but the sales cycle and procurement side of construction is its own animal that I didn't have the bandwidth or seniority to drive. Still one of the more useful things I've built, in the sense that the people we demoed it to immediately wanted to use it.

## Project Links

- **[GitHub Repository](https://github.com/awpbash/Construction_Bot)**
