# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

PaiAgent is an AI Agent Workflow Platform - a visual workflow builder for creating AI podcast generation pipelines. It consists of a React frontend for visual workflow editing and a Spring Boot backend for workflow execution.

## Repository Structure

```
/mnt/f/PaiAgent-One/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api/      # API clients (axios-based)
│   │   ├── components/  # React components (nodes, canvas, panels)
│   │   ├── store/    # Zustand state management
│   │   └── types/    # TypeScript type definitions
│   └── package.json
└── backend/          # Spring Boot Java backend
    ├── src/main/java/com/paiagent/
    │   ├── config/   # Spring configuration
    │   ├── controller/  # REST API controllers
    │   ├── engine/   # Workflow execution engine
    │   ├── model/    # Entity and DTO classes
    │   └── service/  # Business logic services
    └── pom.xml
```

## Development Commands

### Frontend (from `frontend/` directory)

```bash
# Install dependencies
npm install

# Start development server (runs on port 5173, proxies API to :8080)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

### Backend (from `backend/` directory)

```bash
# Run Spring Boot application (requires Java 17)
./mvnw spring-boot:run

# Build the project
./mvnw clean package

# Run tests
./mvnw test
```

## Architecture

### Frontend Architecture

The frontend uses **React Flow** (`@xyflow/react`) for the visual node-based workflow editor:

- **State Management**: Zustand store in `src/store/workflowStore.ts` manages nodes, edges, and workflow metadata
- **Node Types**: Custom node components in `src/components/nodes/` (UserInputNode, LLMNode, TTSNode, EndNode)
- **API Layer**: Axios-based client in `src/api/client.ts` with workflow API methods in `src/api/workflowApi.ts`
- **Vite Proxy**: Configured to proxy `/api` and `/audio` requests to backend at `http://localhost:8080`

Key patterns:
- Node data format uses `WorkflowNodeData` with `label`, `nodeType`, and `config` fields
- Nodes are mapped between React Flow format and backend format in `App.tsx`

### Backend Architecture

The backend is a **Spring Boot** application with a workflow execution engine:

**Workflow Engine** (`engine/` package):
- `WorkflowEngineService`: Orchestrates workflow execution using topological sort to determine node execution order
- `NodeExecutor`: Interface for node type implementations
- `ExecutionEventEmitter`: SSE (Server-Sent Events) emitter for real-time execution updates
- `ExecutionContext`: Holds execution state and node outputs

**Node Executors**:
- `UserInputNodeExecutor`: Captures initial input text
- `LLMNodeExecutor`: Calls LLM providers via `LLMService`
- `TTSNodeExecutor`: Text-to-speech synthesis via `TTSService`
- `EndNodeExecutor`: Workflow termination

**Data Flow**:
1. Workflow definition saved/loaded via `WorkflowController` (`/api/workflows`)
2. Execution started via `ExecutionController` (`/api/executions`)
3. Execution events streamed via SSE at `/api/executions/{id}/events`
4. Audio files served from `/audio/{filename}`

**LLM Integration**:
- Configured via `LLMProviderConfig` for multiple providers
- Falls back to mock response if API key not configured
- Supports OpenAI-compatible API format

### Database

Uses **H2 in-memory database** with JPA repositories:
- `Workflow` entity: Stores workflow definitions as JSON
- `ExecutionRecord` entity: Tracks execution status and results

## Key Conventions

- Frontend uses TypeScript with strict typing for workflow types
- Backend uses Lombok for boilerplate reduction
- Node types: `user-input`, `llm-node`, `tts-node`, `end-node`
- All API calls from frontend go through `/api` proxy to backend
