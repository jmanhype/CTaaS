# CTaaS: Clinical Trials as a Service

## Overview

CTaaS (Clinical Trials as a Service) is a comprehensive full-stack platform designed to streamline and manage various aspects of clinical research. It features a robust backend built with Phoenix (Elixir) and a modern, responsive frontend developed using Next.js (React, TypeScript).

The platform provides a suite of tools for managing clinical trials, including modules for trial setup, protocol management, IRB submissions, site coordination, patient recruitment and tracking, data monitoring, and regulatory reporting.

## Core Features

*   **Trial Management:** Create, update, and manage clinical trials through a dedicated API and user interface.
*   **Protocol Management:** Design, draft, and track study protocols.
*   **IRB Submissions:** Handle submissions and track statuses for Institutional Review Boards.
*   **Site Management:** Coordinate and manage participating clinical trial sites.
*   **Patient Recruitment & Tracking:** Tools for identifying and managing patient cohorts.
*   **Data Monitoring:** Summarize and track monitoring events related to trial progress.
*   **Regulatory Reporting:** Generate and manage regulatory reports.
*   **API-Driven:** A comprehensive set of API endpoints for programmatic interaction and integration.

## Technologies Used

*   **Backend:** Elixir, Phoenix Framework
*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Radix UI
*   **Messaging/Event Streaming:** NATS Server
*   **Database:** (Assumed, typically PostgreSQL with Phoenix projects, but not explicitly configured in this setup walkthrough)
*   **Package Management:** Mix (Elixir), pnpm (Node.js)

## Project Structure

*   `/apps/a2a_agent_web/`: Contains the Phoenix backend application.
    *   `lib/a2a_agent_web_web/router.ex`: Defines API and web routes.
    *   `mix.exs`: Backend project dependencies and configuration.
*   `/ctaas_frontend/`: Contains the Next.js frontend application.
    *   `src/app/`: Main application code, including pages and components.
    *   `package.json`: Frontend project dependencies and scripts.
*   `/README.md`: This file.

## Setup and Running the Application

These instructions reflect the steps taken to get the application running in a specific sandbox environment. You may need to adapt them based on your local setup.

### Prerequisites

1.  **Git:** For cloning the repository.
2.  **Elixir & Erlang:** Specific versions are required.
    *   Erlang/OTP 26.2.5
    *   Elixir 1.18.0
    *   It is recommended to use a version manager like `asdf` to install these:
        ```bash
        asdf plugin-add erlang
        asdf plugin-add elixir
        asdf install erlang 26.2.5
        asdf install elixir 1.18.0
        asdf global erlang 26.2.5
        asdf global elixir 1.18.0
        ```
3.  **Node.js & pnpm:** For the frontend.
    *   Node.js (e.g., v20.x or later)
    *   pnpm (e.g., v10.x or later)
    *   Install pnpm globally if you haven't: `npm install -g pnpm`
4.  **NATS Server:** Required for backend event communication.
    *   Download the NATS server binary for Linux (e.g., `nats-server-v2.10.17-linux-amd64.zip`) from the [NATS releases page](https://github.com/nats-io/nats-server/releases).
    *   Unzip and place the `nats-server` executable in your PATH or a known location.
5.  **Build Essentials:** (If building Erlang/Elixir from source with `asdf`)
    ```bash
    sudo apt-get update
    sudo apt-get install -y build-essential autoconf libssl-dev libncurses-dev
    ```
6.  **(Optional) OpenAI API Key:** Some underlying agent functionalities might require an OpenAI API Key. Set it as an environment variable if needed:
    ```bash
    export OPENAI_API_KEY="your_openai_api_key_here"
    ```

### 1. Clone the Repository

```bash
git clone https://github.com/jmanhype/CTaaS.git
cd CTaaS
```

### 2. Start NATS Server

Open a new terminal window and start the NATS server:

```bash
nats-server
```

Leave this terminal running.

### 3. Setup and Run the Backend (Phoenix/Elixir)

In a new terminal, navigate to the backend directory:

```bash
cd apps/a2a_agent_web/

# Install dependencies
mix deps.get

# (Optional) If you need to set the OpenAI API key for this session:
# export OPENAI_API_KEY="your_openai_api_key_here"

# Start the Phoenix server
mix phx.server
```

The backend API should now be running, typically on `http://localhost:4000`.

### 4. Setup and Run the Frontend (Next.js)

In another new terminal, navigate to the frontend directory:

```bash
cd ctaas_frontend/

# Install dependencies
pnpm install

# Start the Next.js development server
pnpm dev
```

The frontend application should now be running, typically on `http://localhost:3000` (or the next available port like 3001, 3002, etc., if 3000 is in use).

### Notes on Frontend Operation

*   The frontend attempts to connect to backend authentication endpoints (`/auth/login`, `/users/me/profile`) that are not currently defined in the backend router. The application has been modified to handle these missing endpoints more gracefully (e.g., by timing out API calls and falling back to an unauthenticated state) to prevent it from hanging indefinitely. This allows the login page to load.
*   Full authentication functionality would require implementing these corresponding endpoints in the Phoenix backend.

## API Endpoints

The backend exposes a variety of API endpoints under `/api/v1/` for managing:
*   Trials (`/trials`)
*   Protocols (`/trials/:trial_id/protocols`)
*   IRB Submissions (`/trials/:trial_id/irb-submissions`)
*   Sites (`/sites`, `/trials/:trial_id/sites`)
*   Patients (`/trials/:trial_id/patients`)
*   Data Monitoring (`/trials/:trial_id/monitoring`)
*   Regulatory Reports (`/trials/:trial_id/reports`)

Refer to `apps/a2a_agent_web/lib/a2a_agent_web_web/router.ex` for a detailed list of routes and controllers.

## Contributing

(Details to be added if contributions are open)

## License

(License information to be added - currently the repository has a MIT license associated with the Hypergraph Agents content)

