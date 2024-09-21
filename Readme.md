# Nexaflow - Context-Aware Chatbot

## Team Nexus Squad

## Overview

Nexaflow is an intelligent, context-aware chatbot designed to provide precise and useful information from a comprehensive knowledge base while executing various actions through integrated APIs. The chatbot can handle multiple document formats, preserve conversation context, and execute actions like creating/canceling orders, collecting payments, and more.

Nexaflow was built as part of a hackathon challenge to solve real-world problems like FAQs, escalation handling, and task automation with a seamless user experience.

## Features

- **Context-Aware Chat**: The chatbot understands the flow of conversations and maintains context across multiple queries.
- **Action Execution**: Nexaflow integrates with various APIs to perform actions such as booking, canceling orders, processing payments, etc.
- **Knowledge Base Integration**: Information is retrieved from documents like PDFs, PPTs, or external databases, ensuring relevant and accurate responses.
- **Multiple Formats Supported**: Integrates with various document types, including PDFs, DOCs, and PPTs.
- **Session Management**: Maintains session context between interactions.

## Tech Stack

- **Frontend**: React (built using ShadCN UI library), Firebase.
- **Backend**: Python and FastAPI, with additional integrations for document parsing and external API management.

## Installation & Setup (For Developers)

To set up the project on your local machine:

### Prerequisites

- **Node.js**: Install from [here](https://nodejs.org/en/).
- **Python 3.x**: Install from [here](https://www.python.org/downloads/).
- **Pinecone API Key**
- **Azure Document Intelligence API Key**
- **Claude API Key**

### Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/nexsussquad/nexaflow
    cd nexaflow
    ```

2. Navigate to the `server` folder:
    ```bash
    cd server
    ```

3. Create a virtual environment:
    ```bash
    python -m venv venv
    ```

4. Activate the virtual environment:

    - On Windows:
      ```bash
      venv\Scripts\activate
      ```
    - On MacOS/Linux:
      ```bash
      source venv/bin/activate
      ```

5. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

6. Set up environment variables:

    Create a `.env` file in the root directory of the `server` folder and fill in the following keys:

    ```bash
    PINECONE_API_KEY=<your-pinecone-key>
    HF_TOKEN=<your-hf-token>
    MISTRAL_API_KEY=<your-mistral-api-key>
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=<your-azure-endpoint>
    AZURE_DOCUMENT_INTELLIGENCE_APIKEY=<your-azure-api-key>
    ```

7. Run the backend:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend Setup

1. Navigate to the `nexa_ui` folder:
    ```bash
    cd nexa_ui
    ```

2. Install the frontend dependencies:
    ```bash
    npm install
    ```

3. To run the **client** side (end-user app):
    ```bash
    npm run dev
    ```

4. To run the **admin** side (admin panel for managing actions and documents):
    ```bash
    npm run dev:admin
    ```

The admin app's routes:

- `/`: Admin homepage


### End User (Deployed Version)

1. Visit the deployed Nexaflow app.
2. On the homepage, interact with the chatbot for any FAQs or context-aware queries.
3. If you want to perform an action (e.g., cancel an appointment), simply ask the bot, and it will handle it via integrated APIs.

### Admin (Deployed Version)

1. Visit the admin panel of the deployed Nexaflow app - [Admin Panel](https://admin.nexaflow.co/).
2. Manage actions and documents by adding new workflows or updating the knowledge base.

---
## Team - Nexus Squad
---
