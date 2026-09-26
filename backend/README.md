# Shirva Community Assistance Platform: Backend Documentation

## 1. Overview and Vision
This backend service acts as the central nervous system for the Shirva Community Assistance platform. It connects elderly citizens (who may only speak Tulu) with verified local volunteers. 

Because AI speech-to-text models cannot reliably process complex Tulu dialects, this backend operates on a **Human-in-the-Loop** model. It does not attempt to transcribe audio; instead, it acts as an ultra-fast router—receiving categorized audio-grams and text messages, securely storing them, and dispatching them to the appropriate local volunteers.

---

## 2. Technical Architecture

### Tech Stack
*   **Runtime:** Node.js
*   **Web Framework:** Express.js
*   **Audio Handling:** Multer (multipart/form-data)
*   **Future Database:** PostgreSQL (via Prisma ORM)
*   **Future Push Notifications:** Firebase Cloud Messaging (FCM)

### The Data Flow
1. **The Request:** The Senior App sends a `multipart/form-data` request containing an audio file (`.m4a`), a category ID (e.g., `medical`), and an optional text message.
2. **Storage:** The Express server intercepts the request using `multer` and saves the raw audio file to the local disk (later transitioning to AWS S3/Supabase Storage).
3. **Database Entry:** A new "Task" record is created in the database containing the file URL, category, and timestamps.
4. **Broadcast:** The backend triggers an FCM push notification specifically to volunteers subscribed to the requested category.

### Key Architecture Decisions
Only document meaningful decisions. Avoid generic claims such as 'scalable', 'secure', or 'industry standard' without explaining the concrete choice.

| ID | Decision | Reason | Trade-off / Limitation |
| :--- | :--- | :--- | :--- |
| **AD-01** | **Human-in-the-Loop Audio Routing** | AI Speech-to-Text and LLMs perform extremely poorly on undocumented Tulu dialects, leading to dangerous false positives in an elderly care context. | Requires volunteers to actively listen to audio files (slower than text parsing) and prevents the system from doing automated, granular triage based on content. |
| **AD-02** | **Hardware-Bypassed Emergency Protocol** | The "Emergency" function entirely bypasses this backend and uses native `tel:` OS links. Ensures seniors can contact dispatch even if the backend is down or they lack 4G internet. | The backend has no log or record of when an emergency was triggered, preventing central analytics on emergency response times. |
| **AD-03** | **Monolithic Express.js Router** | A single service handles file uploads, database writes, and push notifications. Chosen for maximum developer velocity for a hyper-local (single town) user base. | High volume of simultaneous audio uploads could block the event loop, potentially delaying the dispatch of push notifications for text-only requests. |

---

## 3. API Reference

### `GET /health`
Used to verify that the backend is online and responding.
*   **URL:** `/health`
*   **Method:** `GET`
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:** `{ "status": "ok", "message": "Shirva App Backend is running" }`

### `POST /api/tasks/upload`
The core endpoint used by the Senior App to submit a request for help.
*   **URL:** `/api/tasks/upload`
*   **Method:** `POST`
*   **Content-Type:** `multipart/form-data`
*   **Body Parameters:**
    *   `audio` (File, Optional): The raw `.m4a` audio recording.
    *   `category` (String, Required): The ID of the category (e.g., `medical`, `essential`, `travel`, `volunteer`, `other`).
    *   `textMessage` (String, Optional): A text fallback if the user chose to type instead of record.
*   **Success Response:**
    *   **Code:** 201 Created
    *   **Content:**
        ```json
        {
            "message": "Request received successfully.",
            "file": "voice-note-169876543210-987654321.m4a",
            "category": "medical",
            "text": "Need blood pressure meds",
            "taskId": "task_169876543210"
        }
        ```
*   **Error Responses:**
    *   **Code:** 400 Bad Request (If neither audio nor text is provided).

---

## 4. Proposed Database Schema (PostgreSQL)

To support the routing engine, we will implement the following relational models:

### `Seniors` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `phone_number`| String | Used for authentication / contact |
| `address` | String | Used by volunteers for delivery |

### `Volunteers` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `name` | String | Full name |
| `phone_number`| String | Used for contact |
| `is_verified` | Boolean | True if vetted by local Panchayat/Police |
| `categories` | Array[String]| e.g., `['medical', 'travel']` |

### `Tasks` Table (Help Requests)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `senior_id` | UUID (FK) | Links to the Senior who requested it |
| `category` | String | e.g., `essential` |
| `audio_url` | String | URL to the stored voice note (can be null) |
| `text_msg` | String | Text fallback (can be null) |
| `status` | Enum | `PENDING`, `ACCEPTED`, `COMPLETED` |
| `volunteer_id`| UUID (FK) | Links to the Volunteer handling it (null if PENDING) |
| `created_at` | Timestamp | When the request was made |

---

## 5. Developer Setup Instructions

1. **Clone & Install:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `backend` directory:
   ```env
   PORT=3000
   # Database connection string will go here
   # DATABASE_URL="postgresql://user:password@localhost:5432/shirva"
   ```

3. **Run the Server:**
   ```bash
   npm start
   # or run with auto-reload during development:
   # npm run dev (requires nodemon)
   ```
