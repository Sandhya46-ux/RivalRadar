import React, { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, Bell, Bot, Building2,
  CheckCircle2, ChevronDown, CircleHelp, FileText, Globe2,
  Lightbulb, Plus, Radar, Settings, ShieldAlert, Sparkles,
  Tag, Target, TrendingUp, X, Layers3, Menu, Search
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const TABS = [
  "Overview",
  "Product & Features",
  "Pricing",
  "Recent Changes",
  "Recommendations"
];

const AGENTS = [
  "Market Scout",
  "Pricing Analyst",
  "Change Detector",
  "Strategy Analyst"
];

function validHttpUrl(value) {
  try {
    const url = new URL(value.trim());
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

// Save the latest session in browser storage.
const STORAGE_KEY = "rivalradar-session-v1";

function readSavedSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

function App() {
  const [savedSession] = useState(readSavedSession);

  const [company, setCompany] = useState(savedSession.company || "");
  const [competitors, setCompetitors] = useState(
    savedSession.competitors || []
  );

  const [competitorDraft, setCompetitorDraft] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeNav, setActiveNav] = useState("Dashboard");

  const [scanState, setScanState] = useState(
    savedSession.scanResult ? "complete" : "idle"
  );

  const [scanResult, setScanResult] = useState(
    savedSession.scanResult || null
  );

  const [error, setError] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Automatically save company, competitors and scan results.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          company,
          competitors,
          scanResult
        })
      );
    } catch (storageError) {
      console.warn(
        "Could not save RivalRadar session:",
        storageError
      );
    }
  }, [company, competitors, scanResult]);

  const companyCount =
    competitors.length + (company.trim() ? 1 : 0);

  function addCompetitor() {
    setError("");

    const value = competitorDraft.trim();

    if (!value) return;

    if (!validHttpUrl(value)) {
      setError(
        "Enter a valid competitor URL beginning with https://"
      );
      return;
    }

    if (
      competitors.some(
        url =>
          url.replace(/\/$/, "") === value.replace(/\/$/, "")
      ) ||
      value.replace(/\/$/, "") ===
        company.trim().replace(/\/$/, "")
    ) {
      setError("This website is already included.");
      return;
    }

    if (competitors.length >= 3) {
      setError("You can compare up to 3 competitors.");
      return;
    }

    setCompetitors([...competitors, value]);
    setCompetitorDraft("");
  }

  async function startScan() {
    setError("");

    if (!validHttpUrl(company)) {
      setError(
        "Enter a valid company website beginning with https://"
      );
      return;
    }

    if (competitors.length === 0) {
      setError("Add at least one competitor website.");
      return;
    }

    if (competitors.some(url => !validHttpUrl(url))) {
      setError("One or more competitor URLs are invalid.");
      return;
    }

    // Do not clear the previous scan result here.
    // It stays visible until the new scan succeeds.

    setScanState("scanning");

    try {
      const response = await fetch(
        `${API_URL}/api/investigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            company_url: company.trim(),
            competitor_urls: competitors
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Investigation failed. Check the backend."
        );
      }

      setScanResult(data);
      setScanState("complete");
      setActiveTab("Overview");

    } catch (err) {
      setScanState("idle");

      setError(
        err.message ||
        "Cannot connect to RivalRadar. Make sure the backend is running."
      );
    }
  }

  const navItems = [
    ["Dashboard", Activity],
    ["New Analysis", Plus],
    ["Reports", FileText],
    ["Tracked Companies", Building2],
    ["Alerts", Bell],
    ["Settings", Settings]
  ];

  const pageTitle =
    activeNav === "Dashboard"
      ? "Know Your Competition. Stay Ahead."
      : activeNav;

  const pageSubtitle =
    activeNav === "Dashboard"
      ? "AI agents that research, track and analyze your competitors across the web."
      : `Explore your ${activeNav.toLowerCase()} workspace and competitor intelligence.`;

  const research = scanResult?.research || [];

  const totalProducts = research.reduce(
    (total, item) =>
      total +
      (
        item.data?.products_services?.length ||
        item.data?.products_and_services?.length ||
        0
      ),
    0
  );

  const totalUpdates = research.reduce(
    (total, item) =>
      total + (item.data?.recent_updates?.length || 0),
    0
  );

  const failedCount =
    scanResult?.failed_websites?.length || 0;

  return (
    <div className="app-shell">

      {/* Sidebar */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            <Radar size={27} />
          </div>

          <div>
            <strong>RivalRadar</strong>
            <span>Competitor Intelligence Agent</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${
                activeNav === label ? "active" : ""
              }`}
              onClick={() => {
                setActiveNav(label);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-promo">
          <div className="bot-orb">
            <Bot size={42} />
          </div>

          <h3>AI Agents at Work</h3>

          <p>
            Autonomously browse, extract and analyze competitor data
            using TinyFish.
          </p>

          <div className="powered">
            <Sparkles size={15} />
            Powered by TinyFish
          </div>
        </div>

        <div className="sidebar-footer">
          RivalRadar <span>v1.0</span>
        </div>
      </aside>

      {/* Main Area */}

      <main className="main-area">

        {/* Topbar */}

        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={19} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> {activeNav}
          </div>

          <div className="top-actions">
            <button
              className="icon-button notification"
              onClick={() => setShowAlerts(!showAlerts)}
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <button
              className="profile"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              S
            </button>

            <ChevronDown size={15} className="muted" />
          </div>

          {showAlerts && (
            <div className="notification-pop">
              <b>Notifications</b>

              <p>
                {scanResult
                  ? "Your latest research is available."
                  : "No completed research yet."}
              </p>
            </div>
          )}
        </header>

        <div className="content">

          {/* Hero Section */}

          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="pulse-dot" />
                COMPETITIVE INTELLIGENCE
              </div>

              <h1>{pageTitle}</h1>

              <p>{pageSubtitle}</p>
            </div>

            <div className="hero-art">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />

              <Radar size={90} />

              <span className="spark spark-a">✦</span>
              <span className="spark spark-b">✧</span>
            </div>
          </section>

          {/* Analysis Form */}

          <section className="analysis-card panel">

            <div className="section-heading">
              <div className="heading-icon">
                <Target size={19} />
              </div>

              <div>
                <h2>Start a Competitor Analysis</h2>
                <p>
                  Enter your website and up to 3 competitors to begin.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <label className="field-group">
                <span>Your Company Website</span>

                <div className="url-input">
                  <Globe2 size={17} />

                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="https://yourcompany.com"
                    disabled={scanState === "scanning"}
                  />
                </div>
              </label>

              <div className="field-group">
                <span>
                  Competitor Websites <small>(up to 3)</small>
                </span>

                <div className="competitor-list">

                  {competitors.map((url, index) => (
                    <div
                      className="competitor-chip"
                      key={`${url}-${index}`}
                    >
                      <Globe2 size={15} />

                      <span title={url}>{url}</span>

                      <button
                        onClick={() =>
                          setCompetitors(
                            competitors.filter(
                              (_, i) => i !== index
                            )
                          )
                        }
                        disabled={scanState === "scanning"}
                        aria-label="Remove competitor"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {competitors.length < 3 && (
                    <div className="add-competitor">
                      <input
                        value={competitorDraft}
                        onChange={e =>
                          setCompetitorDraft(e.target.value)
                        }
                        onKeyDown={e =>
                          e.key === "Enter" && addCompetitor()
                        }
                        placeholder="Add competitor URL"
                        disabled={scanState === "scanning"}
                      />

                      <button
                        onClick={addCompetitor}
                        disabled={scanState === "scanning"}
                      >
                        <Plus size={15} /> Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="primary-button scan-button"
                onClick={startScan}
                disabled={scanState === "scanning"}
              >
                <Sparkles size={17} />

                {scanState === "scanning"
                  ? "Scanning..."
                  : "Start Intelligence Scan"}

                <ArrowRight size={16} />
              </button>
            </div>

            {error && (
              <div className="error-message">
                <AlertTriangle size={15} />
                {error}
              </div>
            )}

            {scanState === "complete" && scanResult && (
              <div className="success-message">
                <CheckCircle2 size={16} />

                Research completed for{" "}
                {scanResult.websites_researched} website(s).
              </div>
            )}
          </section>

          {/* Scan Status */}

          <section className="scan-status panel">
            <div className="scan-left">

              <div
                className={`scan-ring ${
                  scanState === "scanning" ? "spinning" : ""
                }`}
              >
                <Radar size={23} />
              </div>

              <div className="scan-copy">
                <h3>
                  {scanState === "scanning"
                    ? "Intelligence Scan in Progress..."
                    : scanState === "complete"
                    ? "Intelligence Scan Complete"
                    : "Ready to Investigate"}
                </h3>

                <p>
                  {scanState === "scanning"
                    ? "TinyFish is researching websites and Gemini is analyzing the findings."
                    : scanState === "complete"
                    ? `${scanResult?.websites_researched || 0} websites researched successfully.`
                    : "Your AI agents are ready to investigate your competitors."}
                </p>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        scanState === "complete"
                          ? "100%"
                          : scanState === "scanning"
                          ? "50%"
                          : "0%"
                    }}
                  />
                </div>
              </div>

              <strong className="progress-number">
                {scanState === "complete"
                  ? "100%"
                  : scanState === "scanning"
                  ? "..."
                  : "—"}
              </strong>
            </div>

            <div className="agent-status">
              <div className="agent-title">
                <Sparkles size={15} />
                4 AI Agents
              </div>

              <div className="agent-pills">
                {AGENTS.map(name => (
                  <span
                    className={
                      scanState === "complete" ? "done" : ""
                    }
                    key={name}
                  >
                    {scanState === "complete"
                      ? <CheckCircle2 size={14} />
                      : <span className="agent-dot" />}

                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Metrics */}

          <section className="metrics-grid">
            <Metric
              icon={<Building2 />}
              value={
                scanResult
                  ? String(scanResult.websites_researched)
                  : "—"
              }
              label="Websites researched"
              tone="purple"
            />

            <Metric
              icon={<Layers3 />}
              value={
                scanResult
                  ? String(totalProducts)
                  : "—"
              }
              label="Products & services"
              tone="blue"
            />

            <Metric
              icon={<Lightbulb />}
              value={
                scanResult
                  ? String(totalUpdates)
                  : "—"
              }
              label="Verified updates"
              tone="yellow"
            />

            <Metric
              icon={<ShieldAlert />}
              value={
                scanResult
                  ? String(failedCount)
                  : "—"
              }
              label="Failed websites"
              tone="red"
            />
          </section>

          {/* Workspace */}

          <section className="workspace-grid">

            <div className="workspace-main">

              <div className="tabs panel">
                {TABS.map((tab, index) => (
                  <button
                    key={tab}
                    className={
                      activeTab === tab ? "selected" : ""
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {index === 0
                      ? <Activity />
                      : index === 1
                      ? <Layers3 />
                      : index === 2
                      ? <Tag />
                      : index === 3
                      ? <TrendingUp />
                      : <Lightbulb />}

                    {tab}
                  </button>
                ))}
              </div>

              {!scanResult ? (
                <div className="panel detail-panel">
                  <h3>No live research available yet</h3>

                  <p>
                    Enter your company website and at least one
                    competitor website to start your first investigation.
                  </p>
                </div>
              ) : (
                <LiveResults
                  result={scanResult}
                  activeTab={activeTab}
                />
              )}
            </div>

            {/* AI Insights */}

            <aside className="insights panel">
              <div className="insights-head">
                <Sparkles size={17} />

                <h3>AI Insights</h3>

                <span className="live-label">
                  {scanResult ? "LIVE" : "WAITING"}
                </span>
              </div>

              {!scanResult ? (
                <p>
                  Insights will appear after a successful investigation.
                </p>
              ) : (
                <>
                  <Insight
                    icon={<Building2 />}
                    tone="green"
                    title="Research completed"
                    text={`${scanResult.websites_researched} websites successfully researched.`}
                  />

                  <Insight
                    icon={<Lightbulb />}
                    tone="purple"
                    title="Verified updates"
                    text={`${totalUpdates} website updates were identified.`}
                  />

                  <Insight
                    icon={<AlertTriangle />}
                    tone="yellow"
                    title="Research status"
                    text={`${failedCount} websites could not be researched.`}
                  />

                  <button
                    className="report-button"
                    onClick={() =>
                      setActiveTab("Recommendations")
                    }
                  >
                    View Full Report <ArrowRight size={16} />
                  </button>
                </>
              )}
            </aside>

          </section>

          {/* Disclaimer */}

          <footer className="disclaimer">
            <CircleHelp size={14} />

            Research findings are based on retrieved website evidence.
            Missing information is not assumed.
          </footer>

        </div>
      </main>
    </div>
  );
}

// Metric Card

function Metric({ icon, value, label, tone }) {
  return (
    <div className="metric-card panel">
      <div className={`metric-icon ${tone}`}>
        {icon}
      </div>

      <div className="metric-data">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

// Insight Card

function Insight({ icon, tone, title, text }) {
  return (
    <div className="insight-item">
      <div className={`insight-icon ${tone}`}>
        {icon}
      </div>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

// Live Results

function LiveResults({ result, activeTab }) {
  const research = result.research || [];
  const analysis = result.analysis || {};

  // Product & Features Tab

  if (activeTab === "Product & Features") {
    return (
      <div className="panel detail-panel">
        <div className="card-title">
          <h3>Product & Feature Intelligence</h3>
          <span>Retrieved website evidence</span>
        </div>

        {research.map((item, index) => (
          <div key={index}>
            <h4>
              {item.data?.company_name || item.url}
            </h4>

            <p>
              {item.data?.description ||
                item.data?.company_description ||
                "Description unavailable."}
            </p>

            <ul>
              {(
                item.data?.products_services ||
                item.data?.products_and_services ||
                []
              ).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <SourceLink url={item.url} />
          </div>
        ))}
      </div>
    );
  }

  // Overview Tab

  if (activeTab === "Overview") {
    const report = analysis["Market Scout"];

    return (
      <div className="panel detail-panel">
        <div className="card-title">
          <h3>Market Scout — Company Research</h3>
          <span>Research overview</span>
        </div>

        {report && <JsonReport data={report} />}

        {research.map((item, index) => (
          <div key={index}>
            <h4>
              {item.data?.company_name || item.url}
            </h4>

            <p>
              {item.data?.description ||
                item.data?.company_description ||
                "No description found."}
            </p>

            <b>Target customers</b>

            <ul>
              {(item.data?.target_customers || []).map(
                (customer, i) => (
                  <li key={i}>{customer}</li>
                )
              )}
            </ul>

            <SourceLink url={item.url} />
          </div>
        ))}
      </div>
    );
  }

  // Pricing Tab

  if (activeTab === "Pricing") {
    return (
      <div className="panel detail-panel">
        <div className="card-title">
          <h3>Pricing Intelligence</h3>
          <span>Verified pricing only</span>
        </div>

        {research.map((item, index) => {
          const pricing =
            item.data?.pricing ||
            item.data?.pricing_information ||
            [];

          return (
            <div key={index}>
              <h4>
                {item.data?.company_name || item.url}
              </h4>

              {pricing.length === 0 ? (
                <p>No verified pricing information found.</p>
              ) : (
                pricing.map((plan, i) => (
                  typeof plan === "string" ? (
                    <p key={i}>{plan}</p>
                  ) : (
                    <div key={i}>
                      <b>{plan.plan}</b>

                      <h3>
                        {plan.price}{" "}
                        <small>{plan.billing_period}</small>
                      </h3>

                      <ul>
                        {(plan.features || []).map(
                          (feature, j) => (
                            <li key={j}>{feature}</li>
                          )
                        )}
                      </ul>

                      {plan.source_url && (
                        <SourceLink url={plan.source_url} />
                      )}
                    </div>
                  )
                ))
              )}
            </div>
          );
        })}

        <JsonReport data={analysis["Pricing Analyst"]} />
      </div>
    );
  }

  // Recent Changes Tab

  if (activeTab === "Recent Changes") {
    return (
      <div className="panel detail-panel">
        <div className="card-title">
          <h3>Recent Competitor Changes</h3>
          <span>Retrieved announcements</span>
        </div>

        {research.map((item, index) => (
          <div key={index}>
            <h4>
              {item.data?.company_name || item.url}
            </h4>

            {(item.data?.recent_updates || []).length === 0 ? (
              <p>No verified recent updates found.</p>
            ) : (
              item.data.recent_updates.map((update, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot blue" />

                  <div className="timeline-content">
                    <b>
                      {typeof update === "string"
                        ? update
                        : update.title}
                    </b>

                    {typeof update !== "string" && (
                      <p>{update.description}</p>
                    )}

                    {typeof update !== "string" && (
                      <>
                        <time>
                          {update.date || "Date unavailable"}
                        </time>

                        {update.source_url && (
                          <SourceLink url={update.source_url} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}

        <JsonReport data={analysis["Change Detector"]} />
      </div>
    );
  }

  // Recommendations Tab

  return (
    <div className="panel detail-panel">
      <div className="card-title">
        <h3>Strategic Recommendations</h3>
        <span>Gemini analysis</span>
      </div>

      <JsonReport data={analysis["Strategy Analyst"]} />

      <h4>All specialist reports</h4>

      {Object.entries(analysis).map(([name, report]) => (
        <details key={name}>
          <summary>{name}</summary>
          <JsonReport data={report} />
        </details>
      ))}
    </div>
  );
}

// JSON Report Component

function JsonReport({ data }) {
  if (!data) {
    return <p>No report available for this agent.</p>;
  }

  if (data.status === "error") {
    return (
      <p className="error-message">
        Analysis unavailable: {data.message}
      </p>
    );
  }

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontFamily: "inherit",
        fontSize: "13px"
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// Source Link Component

function SourceLink({ url }) {
  return (
    <p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        View source website <ArrowRight size={13} />
      </a>
    </p>
  );
}

export default App;