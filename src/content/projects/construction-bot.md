---
title: "Construction Bot"
description: "A smart document retrieval system for the construction industry using Vector Search and RAG to provide instant, accurate answers from project documentation."
pubDate: "Aug 1 2025"
heroImage: "/constructionbot/header.png"
badge: "RAG & AI"
tags: ["Vector Search", "RAG", "LLM", "OpenAI", "Document Retrieval"]
---

Construction projects are a data-intensive environment, with thousands of documents ranging from architectural blueprints to contracts and governmental regulations. Quickly finding the right information is critical for efficiency, compliance, and safety. However, traditional search methods are often slow and inefficient, and the presence of updated documents can easily lead to the use of outdated information.

Developed as a pilot project for KTC, the **Construction Bot** is an intelligent document retrieval chat bot system built to solve this problem. It allows project teams to find precise, context-aware information from their vast library of project documents leveraging vector search technology, natural language queries and large language reasoning models.

## The Problem

The challenge in construction is not a lack of data, but the difficulty of accessing it. A project manager might need to know the specific fire rating of a wall type, or a site supervisor might need to recall a specific safety protocol from over 200 documents, each with 400 pages. In our pilot study, KTC's Autodesk construction cloud had over 2Tb of data and it takes an experienced engineer over 15 minutes to find out who to contact regarding pipe related matters.

## Solution

The approximate time complexity of a basic search function is often O(N), where N is the number of documents. To make searching more efficient, we use RAG (Retrieval-Augmented Generation) to preprocess the data. This reduces the search complexity to O(1) or O(log N) by creating vector embeddings and using a vector database.

![Vector Search](/constructionbot/vector.png)

These vectors are then fed into a large language model (LLM), such as one from OpenAI, to reason and summarize the information. The LLM can interpret these vectors to identify the most relevant and updated documents, or to synthesize information from multiple documents to provide a comprehensive answer.

## Technology Stack

This project is built on a robust and scalable AI stack designed for document processing:

-   **Vector Search & Databases:** ChromaDB.
-   **RAG:** Langchain framework as backbone for RAG pipeline.
-   **Tokeniser and LLM:** OpenAI API.
-   **Cloud Integration:** Microsoft Azure and Autodesk Construction Cloud integration

## How It Works

The chat bot's pipeline can be broken down into a few simple steps:

1.  **Document Ingestion:** Project documents (PDFs, images, text files) are parsed, chunked, and converted into dense vector embeddings.
2.  **Vector Indexing:** These embeddings are stored in ChromaDB, creating a searchable index of the entire document library.
3.  **User Query:** A user submits a question in plain language (e.g., "What is the concrete mix ratio for the foundation?").
4.  **Retrieval:** The query is also converted into a vector, and a similarity search is performed to find the most relevant document chunks.
5.  **Generation:** The retrieved text chunks are passed to the LLM along with the user's question, allowing it to generate a precise, accurate, and context-specific answer.

## Features & Benefits

-   **Unmatched Accuracy:** Provides answers directly from your project documents, eliminating guesswork.
-   **Instant Retrieval:** Drastically reduces the time spent searching through large files.
-   **Enhanced Compliance:** Helps project teams quickly access and adhere to safety protocols and regulatory requirements.
-   **Seamless Integration:** Designed to work with existing cloud document management systems.
-   **Verifiable Responses:** All responses includes the exact page and vector returned from the query so users can view the organic document. 

## Project Links

-   **[GitHub Repository](https://github.com/awpbash/Construction_Bot)**

---

Unfortunately we did not close the project, but it's still a good learning experience!