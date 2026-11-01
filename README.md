# 🚀 RivalRadar — AI-Powered Competitor Intelligence

**Know Your Competition. Stay Ahead.**

RivalRadar is an AI-powered competitor intelligence platform that researches company websites, extracts relevant business information, and generates actionable competitive insights using autonomous web agents and AI analysis.

## ✨ Features

- **Autonomous Website Research:** Uses TinyFish to browse and research live company websites.
- **Multi-Competitor Analysis:** Analyze your company alongside up to three competitors.
- **Market Intelligence:** Extract company descriptions, products, services, and target customers.
- **Pricing Intelligence:** Organize publicly available pricing information.
- **Change Detection:** Identify recent company updates and announcements.
- **AI-Powered Analysis:** Uses Google Gemini to generate insights through four specialist agents:
  - Market Scout
  - Pricing Analyst
  - Change Detector
  - Strategy Analyst
- **Interactive Dashboard:** Explore research results through dedicated sections for overview, products, pricing, recent changes, and recommendations.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| Web Automation | TinyFish |
| AI Analysis | Google Gemini |
| API Communication | REST API |

## 🏗️ Architecture

1. The user enters their company website and competitor URLs.
2. The React frontend sends the request to the FastAPI backend.
3. The backend validates the submitted URLs.
4. TinyFish autonomously researches the websites and extracts structured information.
5. Gemini analyzes the collected research through four specialist agents.
6. The backend returns the intelligence report.
7. The frontend displays the results in the RivalRadar dashboard.

## 📂 Project Structure

```text
RivalRadar/
│
├── backend/
│   ├── agents.py
│   ├── analyzer.py
│   ├── config.py
│   ├── main.py
│   ├── orchestrator.py
│   ├── schemas.py
│   ├── tinyfish_client.py
│   └── requirements.txt
│
├── src/
│   └── App.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js and npm
- TinyFish API key
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Sandhya46-ux/RivalRadar.git
cd RivalRadar
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
TINYFISH_API_KEY=your_tinyfish_api_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Replace the placeholders with your own API credentials.

### 3. Start the backend

From the `backend` directory:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

### 4. Start the frontend

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome endpoint |
| GET | `/health` | Backend health check |
| POST | `/api/investigate` | Start competitor investigation |

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## 🔐 Security

- API credentials are stored in environment variables.
- The `.env` file must never be committed to GitHub.
- Private and non-public IP addresses are rejected during URL validation.
- Only public HTTPS website URLs are accepted.

## 🚧 Current Scope and Future Enhancements

Potential improvements include:

- Historical competitor tracking.
- Automated competitor monitoring and alerts.
- Exportable intelligence reports.
- More detailed pricing comparisons.
- Scheduled research and change notifications.
- Deployment as a publicly accessible web application.

## 👩‍💻 Author

**Sandhya**

B.Tech — Computer Science and Engineering

[GitHub Repository](https://github.com/Sandhya46-ux/RivalRadar)

---

*RivalRadar — Turn competitive research into actionable intelligence.*