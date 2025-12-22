# Helium Public API - Comprehensive Endpoint Documentation

## Overview

The Helium Public API provides a simplified interface for external devices (wearables, widgets, mobile apps, web applications) to interact with the Helium AI agent system. It supports both task creation/execution and response retrieval with comprehensive file handling and streaming capabilities.

## Authentication

The API supports two authentication methods:

### 1. API Key Authentication (Recommended)
```bash
-X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. JWT Token Authentication
```bash
Authorization: Bearer <jwt_token>
```

---

## 1. Quick Action Endpoint

### **POST** `/api/v1/public/quick-action`

Creates a new task/project and automatically executes the prompt. This is a simplified interface for external integrations.

#### Authentication
- Required: API Key or JWT Token
- Billing validation: User must have sufficient credits

#### Request Body (Supports both JSON and multipart/form-data)

**JSON Request:**
```json
{
  "prompt": "Create a website from this design",
  "agent_id": "optional-agent-id",
  "model_name": "optional-model-name",
  "enable_thinking": false,
  "reasoning_effort": "low",
  "enable_context_manager": false,
  "source": "web_widget",
  "metadata": {
    "device_id": "device-123",
    "app_version": "1.0.0"
  }
}
```

**Form-Data Request (multipart/form-data):**
```bash
# Fields
prompt=Analyze this image and create a website
agent_id=optional-agent-id
model_name=optional-model-name
enable_thinking=true
reasoning_effort=medium
enable_context_manager=false
source=web_widget
metadata={"device_id": "device-123"}
# Files
files=@/path/to/image.png
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `prompt` | string | Yes* | - | 1-5000 chars | Task prompt to execute (*required if no files provided) |
| `agent_id` | string | No | - | - | Specific agent ID to use |
| `model_name` | string | No | - | - | Model override |
| `enable_thinking` | boolean | No | false | - | Enable thinking mode |
| `reasoning_effort` | string | No | "low" | low/medium/high | Reasoning effort level |
| `enable_context_manager` | boolean | No | false | - | Enable context manager |
| `source` | string | No | - | - | Source device/platform for tracking |
| `metadata` | object/string | No | - | - | Additional metadata (JSON object or string) |
| `files` | file array | No | - | Max 10 files, 200MB total | File uploads |

#### Supported File Types
- **Images**: .png, .jpg, .jpeg, .gif, .bmp, .svg, .webp, .ico
- **Documents**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .csv
- **Text Files**: .txt, .json, .xml, .md, .markdown
- **Audio Files**: .mp3, .wav, .flac, .aac, .ogg, .m4a
- **Archives**: .zip, .rar, .7z

**File Limits:**
- Maximum file size: 50MB per file
- Maximum total size: 200MB for all files combined
- Maximum file count: 10 files per upload

#### cURL Examples

**JSON Request:**
```bash
curl -X POST "https://api.he2.site/api/v1/public/quick-action" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a website from this design",
    "source": "web_widget",
    "enable_thinking": true,
    "reasoning_effort": "medium"
  }'
```

**Form-Data Request with Files:**
```bash
curl -X POST "https://api.he2.site/api/v1/public/quick-action" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -F "prompt=Analyze this image and create a website" \
  -F "source=web_widget" \
  -F "enable_thinking=true" \
  -F "reasoning_effort=medium" \
  -F "files=@/path/to/image.png"
```

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "project_id": "proj_123",
  "thread_id": "thread_456",
  "agent_run_id": "run_789",
  "message": "Task created and execution started"
}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid input parameters | Empty prompt, unsupported model, too many files, file too large |
| 401 | Unauthorized | Missing/invalid API key or JWT | Invalid credentials, expired token |
| 402 | Payment Required | Billing limit reached | Insufficient credits, subscription limits exceeded |
| 404 | Not Found | Agent not found | Invalid `agent_id` provided |
| 422 | Unprocessable Entity | Validation error | Prompt too long/short, invalid metadata JSON |
| 500 | Internal Server Error | Failed to execute quick action | System error during execution |

---

## 2. Thread Response Endpoint

### **GET** `/api/v1/public/threads/{thread_id}/response`

Fetches the latest agent response for a thread with automatic wait-for-completion logic.

#### Authentication
- Required: API Key or JWT Token

#### URL Structure
```
GET /api/v1/public/threads/{thread_id}/response?project_id={project_id}&realtime=false&include_file_content=false&timeout=300&page=1&page_size=100
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `thread_id` | string | Yes | - | - | Thread identifier (path parameter) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |
| `realtime` | boolean | No | false | - | Enable Redis-based real-time streaming |
| `include_file_content` | boolean | No | false | - | Include inline file content |
| `timeout` | integer | No | 300 | 0-600 | Max wait time in seconds |
| `page` | integer | No | 1 | 1+ | Page number for pagination |
| `page_size` | integer | No | 100 | 1-1000 | Items per page |

#### Response Modes

1. **Standard Mode** (default): Returns complete JSON response after completion
2. **Real-Time Streaming Mode** (`realtime=true`): Redis-based streaming with immediate message chunks

#### cURL Examples

**Standard Mode:**
```bash
curl -X GET "https://api.he2.site/api/v1/public/threads/thread_456/response?project_id=proj_123&timeout=300" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Real-Time Streaming Mode:**
```bash
curl -X GET "https://api.he2.site/api/v1/public/threads/thread_456/response?project_id=proj_123&realtime=true" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Accept: text/event-stream"
```

#### Response Format

**Standard Mode Response (200 OK):**
```json
{
  "success": true,
  "thread_id": "thread_456",
  "project_id": "proj_123",
  "agent_run_id": "run_789",
  "status": "completed",
  "response": {
    "role": "assistant",
    "content": "Here is your answer...",
    "message_id": "msg_1",
    "created_at": "2024-01-01T10:00:30Z",
    "metadata": {},
    "type": "assistant"
  },
  "has_code": false,
  "has_files": true,
  "code_blocks": [],
  "files": [
    {
      "file_id": "file_1",
      "file_name": "result.txt",
      "file_path": "result.txt",
      "file_size": 1024,
      "file_type": "text/plain",
      "included_inline": true,
      "content": "Hello World!",
      "encoding": "utf-8"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 100,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "waited_seconds": 12.5,
  "message": null
}
```

**Streaming Response Events:**
```
data: {"type": "status", "status": "running", "agent_run_id": "run_789", "elapsed": 0}
data: {"type": "content", "content": "First chunk...", "chunk_id": 1}
data: {"type": "content", "content": "Second chunk...", "chunk_id": 2}
data: {"type": "status", "status": "completed", "elapsed": 25.3}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid parameters | Bad timeout/page values, project_id mismatch |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 403 | Forbidden | Authorization failed | User doesn't own thread/project |
| 404 | Not Found | Thread/project not found | Invalid thread_id or project_id |
| 422 | Unprocessable Entity | Validation error | Bad query parameter types/ranges |
| 500 | Internal Server Error | Failed to fetch response | System error during processing |

---

## 3. Thread Follow-up Endpoint

### **POST** `/api/v1/public/threads/{thread_id}/response`

Adds a new user message to an existing thread and starts a new agent run.

#### Authentication
- Required: API Key or JWT Token
- Billing validation: User must have sufficient credits

#### URL Structure
```
POST /api/v1/public/threads/{thread_id}/response?project_id={project_id}
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `thread_id` | string | Yes | - | - | Thread identifier (path parameter) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |
| `prompt` | string | Yes* | - | 1-5000 chars | User message to append (*required if no files) |
| `files` | file array | No | - | Max 10 files, 200MB total | File uploads |

#### cURL Examples

**JSON Request:**
```bash
curl -X POST "https://api.he2.site/api/v1/public/threads/thread_456/response?project_id=proj_123" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add pricing details to the website"
  }'
```

**Form-Data Request with Files:**
```bash
curl -X POST "https://api.he2.site/api/v1/public/threads/thread_456/response?project_id=proj_123" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -F "prompt=Analyze this additional file" \
  -F "files=@/path/to/document.pdf"
```

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "agent_run_id": "run_123",
  "status": "running",
  "message": "Follow-up accepted; poll GET /threads/{thread_id}/response for updates."
}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid input or project_id mismatch | Empty prompt, invalid project_id |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 404 | Not Found | Thread not found | Invalid thread_id |
| 422 | Unprocessable Entity | Validation error | Bad prompt format |
| 500 | Internal Server Error | Failed to continue thread | System error during processing |

---

## 4. Stop Thread Agent Endpoint

### **POST** `/api/v1/public/threads/{thread_id}/agent/stop`

Stops the currently running agent for a thread (idempotent).

#### Authentication
- Required: API Key or JWT Token

#### URL Structure
```
POST /api/v1/public/threads/{thread_id}/agent/stop?project_id={project_id}
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `thread_id` | string | Yes | - | - | Thread identifier (path parameter) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |

#### cURL Example

```bash
curl -X POST "https://api.he2.site/api/v1/public/threads/thread_456/agent/stop?project_id=proj_123" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "agent_run_id": "run_123",
  "status": "stopped"
}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid project_id or parameters | Project ID mismatch |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 404 | Not Found | Thread not found | Invalid thread_id |
| 500 | Internal Server Error | Failed to stop thread agent | System error during processing |

---

## 5. Thread History Endpoint

### **GET** `/api/v1/public/threads/{thread_id}/history`

Fetches the full conversation history (oldest → newest) with pagination.

#### Authentication
- Required: API Key or JWT Token

#### URL Structure
```
GET /api/v1/public/threads/{thread_id}/history?project_id={project_id}&include_file_content=false&include_status_messages=false&compact=false&page=1&page_size=100
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `thread_id` | string | Yes | - | - | Thread identifier (path parameter) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |
| `include_file_content` | boolean | No | false | - | Include inline file content |
| `include_status_messages` | boolean | No | false | - | Include heartbeat/progress messages |
| `compact` | boolean | No | false | - | Return minimal message fields only |
| `page` | integer | No | 1 | 1+ | Page number for pagination |
| `page_size` | integer | No | 100 | 1-1000 | Messages per page |

#### cURL Example

```bash
curl -X GET "https://api.he2.site/api/v1/public/threads/thread_456/history?project_id=proj_123&page=1&page_size=50" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "thread_id": "thread_456",
  "project_id": "proj_123",
  "messages": [
    {
      "message_id": "msg_1",
      "role": "user",
      "content": "Create a simple website",
      "created_at": "2024-01-01T10:00:00Z",
      "type": "user"
    },
    {
      "message_id": "msg_2",
      "role": "assistant",
      "content": "Here is your HTML...",
      "created_at": "2024-01-01T10:00:30Z",
      "type": "assistant",
      "has_code": true,
      "code_blocks": [
        {
          "language": "html",
          "code": "<!DOCTYPE html>...",
          "file_path": "index.html"
        }
      ],
      "has_files": true,
      "files": [
        {
          "file_id": "file_1",
          "file_name": "index.html",
          "file_size": 1024,
          "file_type": "text/html",
          "included_inline": true,
          "content": "<!DOCTYPE html>...",
          "encoding": "utf-8"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 50,
    "total_items": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "message": null
}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid parameters | Bad page/page_size values, project_id mismatch |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 403 | Forbidden | Authorization failed | User doesn't own thread/project |
| 404 | Not Found | Thread/project not found | Invalid thread_id or project_id |
| 422 | Unprocessable Entity | Validation error | Bad query parameter types/ranges |
| 500 | Internal Server Error | Failed to fetch history | System error during processing |

---

## 6. Thread Files Endpoint

### **GET** `/api/v1/public/threads/{thread_id}/files`

Lists all generated files for a thread (metadata-only) with pagination.

#### Authentication
- Required: API Key or JWT Token

#### URL Structure
```
GET /api/v1/public/threads/{thread_id}/files?project_id={project_id}&page=1&page_size=100
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `thread_id` | string | Yes | - | - | Thread identifier (path parameter) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |
| `page` | integer | No | 1 | 1+ | Page number for pagination |
| `page_size` | integer | No | 100 | 1-1000 | Items per page |

#### cURL Example

```bash
curl -X GET "https://api.he2.site/api/v1/public/threads/thread_456/files?project_id=proj_123&page=1&page_size=50" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "thread_id": "thread_456",
  "project_id": "proj_123",
  "files": [
    {
      "file_id": "file_1",
      "file_name": "result.txt",
      "file_path": "result.txt",
      "file_size": 1024,
      "file_type": "text/plain"
    },
    {
      "file_id": "file_2",
      "file_name": "image.png",
      "file_path": "images/image.png",
      "file_size": 524288,
      "file_type": "image/png"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 50,
    "total_items": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid parameters | Bad page/page_size values |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 403 | Forbidden | Authorization failed | User doesn't own thread/project |
| 404 | Not Found | Thread/project not found | Invalid thread_id or project_id |
| 500 | Internal Server Error | Failed to fetch files | System error during processing |

---

## 7. File Content Endpoint

### **GET** `/api/v1/public/files/{file_id}`

Fetches a specific file's metadata/inline content or raw bytes.

#### Authentication
- Required: API Key or JWT Token

#### URL Structure
```
GET /api/v1/public/files/{file_id}?project_id={project_id}&thread_id={thread_id}&download=false
```

#### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `file_id` | string | Yes | - | - | File identifier (path parameter, supports slashes) |
| `project_id` | string | Yes | - | - | Project ID for authorization (query parameter) |
| `thread_id` | string | Yes | - | - | Thread ID associated with the file (query parameter) |
| `download` | boolean | No | false | - | If true, return raw file bytes; otherwise return JSON |

#### cURL Examples

**JSON Response (metadata + inline content):**
```bash
curl -X GET "https://api.he2.site/api/v1/public/files/thread_456:/workspace/result.txt?project_id=proj_123&thread_id=thread_456&download=false" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Raw File Download:**
```bash
curl -X GET "https://api.he2.site/api/v1/public/files/thread_456:/workspace/result.txt?project_id=proj_123&thread_id=thread_456&download=true" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --output result.txt
```

#### Response Format

**JSON Response (download=false, 200 OK):**
```json
{
  "success": true,
  "project_id": "proj_123",
  "thread_id": "thread_456",
  "file": {
    "file_id": "thread_456:/workspace/result.txt",
    "file_name": "result.txt",
    "file_path": "result.txt",
    "file_size": 1024,
    "file_type": "text/plain",
    "included_inline": true,
    "content": "Hello World!",
    "encoding": "utf-8"
  }
}
```

**Download Response (download=true):** Raw file bytes with appropriate Content-Type header.

#### Error Codes and Exceptions

| Status Code | Error Type | Description | Common Causes |
|-------------|------------|-------------|---------------|
| 400 | Bad Request | Invalid parameters | Missing required query parameters |
| 401 | Unauthorized | Authentication required | Missing/invalid API key or JWT |
| 403 | Forbidden | Authorization failed | User doesn't own thread/project |
| 404 | Not Found | File/thread/project not found | Invalid file_id, thread_id, or project_id |
| 500 | Internal Server Error | Failed to fetch file | System error during processing |

---

## 8. Agent Run Stream Endpoint

### **GET** `/api/v1/public/agent-run/{agent_run_id}/stream`

**Note: This endpoint is referenced in the overview but not currently implemented in the Public API.** It exists in the internal Agent API but is not exposed through the public endpoints.

For streaming agent run responses, use the Thread Response endpoint with `realtime=true` parameter instead.

---

## Rate Limiting

All endpoints inherit rate limiting from the existing API middleware:

| Tier | Requests/Hour |
|------|---------------|
| Free | 100 |
| Pro | 10,000 |
| Enterprise | Custom |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## File Handling

### Hybrid File Content Approach

Files are handled using an intelligent hybrid approach:

**Small Files (< 1MB):**
- Included inline in JSON responses
- Text files: UTF-8 encoded strings
- Binary files: Base64 encoded strings

**Large Files (≥ 1MB):**
- Provided via download URLs
- Pre-signed URLs with expiration
- Thumbnail URLs for images/videos

### Supported File Types

- **Images**: .png, .jpg, .jpeg, .gif, .bmp, .svg, .webp, .ico
- **Documents**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .csv
- **Text Files**: .txt, .json, .xml, .md, .markdown
- **Audio Files**: .mp3, .wav, .flac, .aac, .ogg, .m4a
- **Archives**: .zip, .rar, .7z

## Error Handling Best Practices

1. **Check Status Codes**: Always handle all documented error codes
2. **Parse Error Responses**: Error details are provided in response bodies
3. **Implement Retry Logic**: Use exponential backoff for transient errors (5xx)
4. **Validate Inputs**: Check parameters before making requests
5. **Handle Timeouts**: Set appropriate timeout values for your use case

## Response Status Values

| Status | Description |
|--------|-------------|
| `completed` | Agent run finished successfully |
| `running` | Agent run still in progress |
| `failed` | Agent run encountered an error |
| `stopped` | Agent run was manually stopped |
| `no_run` | No agent run exists for this thread |

## Pagination

Endpoints supporting pagination use consistent parameters:

- `page`: Page number (1-based)
- `page_size`: Items per page (1-1000)
- Pagination metadata includes total counts and navigation flags

## Code Block Extraction

The API automatically extracts code blocks from markdown responses:

- Detects `` ```language\ncode\n``` `` patterns
- Preserves code formatting and indentation
- Optionally detects file paths from comments
- Returns structured data with language identification

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **HTTPS Only**: All requests must use HTTPS in production
3. **Input Validation**: All inputs are validated server-side
4. **Rate Limiting**: Respect rate limits to avoid throttling
5. **Error Handling**: Don't expose sensitive information in error messages

---

*This documentation is automatically generated from the API implementation. Last updated: December 17, 2025*
