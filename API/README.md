# Express.js + MongoDB (Mongoose) Boilerplate API

A modular, production-ready Express boilerplate featuring MongoDB integration via Mongoose, CORS, Body-Parser, Hit Logging, and organized directory architecture.

---

## 📁 Folder Structure

```
api/
├── src/
│   ├── config/
│   │   └── db.js                        # MongoDB connection logic using Mongoose
│   ├── controllers/
│   │   ├── buildingStuffs.controller.js # Building stuffs logic & hit integration
│   │   └── log.controller.js            # Hit recorder & log query logic
│   ├── middlewares/
│   │   ├── errorHandler.js              # 404 & global error handling middleware
│   │   └── requestLogger.js             # Optional automated hit logging middleware
│   ├── models/
│   │   └── log.model.js                 # Mongoose Log schema (hitTime, hitBody, metadata)
│   ├── routes/
│   │   ├── index.js                     # Root router aggregator (/api)
│   │   ├── buildingStuffs.routes.js     # "building stuffs" route handlers
│   │   └── log.routes.js                # Log and hit route handlers
│   └── app.js                           # Express application configuration (cors, body-parser)
├── .env                                 # Environment configuration file
├── .env.example                         # Environment configuration template
├── .gitignore                           # Git ignore rules
├── package.json                         # NPM dependencies and scripts
├── server.js                            # HTTP server entry point
└── README.md                            # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24+)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 2. Environment Variables
Check or edit the `.env` file in the `api` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/express_boilerplate_db
CORS_ORIGIN=*
```

### 3. Running the Server

- **Development Mode (with auto-reload via Nodemon):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

---

## 🔌 API Endpoints

### 1. General & Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and endpoint directory |
| `GET` | `/api/health` | Health check endpoint |

### 2. Next Token Prediction (`/get-models-id`, `/get-next-token`, `/get-next-token-history`, `/api/predict-next-token`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/get-models-id` | List available models ordered cheaper to costly (IDs 1-7) |
| `GET` | `/get-next-token` | Generate next N tokens (`?input=...&tokens=2&model_id=1`) |
| `GET` | `/get-next-token-history` | Fetch paginated history from MongoDB (`?page=1&limit=20`) |
| `POST` | `/api/predict-next-token` | Predict softmax probability distribution of next tokens/words |
| `GET` | `/api/predict-next-token` | GET variant for next-token probability distribution |

### 3. Building Stuffs (`/building-stuffs` & `/api/building-stuffs`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/building-stuffs` | Get all building stuffs items |
| `GET` | `/building-stuffs/:id` | Get specific building stuff item by ID |
| `POST` | `/building-stuffs` | Create new building stuff item |
| `POST` | `/building-stuffs/hit` | Register a hit directly on building stuffs (saves hitTime & hitBody to DB) |

### 4. Hit Logger & Logs (`/api/hit` & `/api/logs`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hit` | Logs `hitTime` & `hitBody` into MongoDB `Log` collection |
| `POST` | `/api/logs/hit` | Alias for hit logging |
| `GET` | `/api/logs` | Fetch all recorded hit logs (supports `?page=1&limit=20`) |
| `GET` | `/api/logs/:id` | Fetch specific log entry by MongoDB `_id` |
| `DELETE`| `/api/logs` | Clear all logs |

---

## 📬 Postman Collection Import

A complete, production-ready Postman v2.1.0 collection and environment configuration are included directly in the `API/` directory:

- **Collection File**: `next-token-api.postman_collection.json` (also mirrored at `postman_collection.json`)
- **Environment File**: `postman_environment.json`

### How to Import into Postman:
1. Open **Postman**.
2. Click the **Import** button in the top left header (or press `Ctrl + O` / `Cmd + O`).
3. Drag & drop or select `next-token-api.postman_collection.json`.
4. (Optional) Import `postman_environment.json` to configure the `base_url` variable (`http://localhost:5000`).
5. Select the imported collection or environment and start executing requests!

---

## 📝 Example Requests

### Record a Hit (POST `/api/hit`)
```bash
curl -X POST http://localhost:5000/api/hit \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test_button_clicked",
    "userId": "user_12345",
    "details": {
      "feature": "Express Boilerplate",
      "status": "Awesome"
    }
  }'
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Hit logged successfully",
  "data": {
    "_id": "6648...",
    "hitTime": "2026-09-24T18:08:00.000Z",
    "hitBody": {
      "action": "test_button_clicked",
      "userId": "user_12345",
      "details": {
        "feature": "Express Boilerplate",
        "status": "Awesome"
      }
    },
    "endpoint": "/api/hit",
    "method": "POST",
    "ip": "::1",
    "userAgent": "curl/8.x",
    "createdAt": "2026-09-24T18:08:00.000Z",
    "updatedAt": "2026-09-24T18:08:00.000Z"
  }
}
```

### Hit Building Stuffs (POST `/building-stuffs/hit`)
```bash
curl -X POST http://localhost:5000/building-stuffs/hit \
  -H "Content-Type: application/json" \
  -d '{
    "buildingType": "Residential",
    "location": "Sector 4",
    "floors": 12
  }'
```

### View All Recorded Logs (GET `/api/logs`)
```bash
curl http://localhost:5000/api/logs
```
