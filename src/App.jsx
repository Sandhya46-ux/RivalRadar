import React, { useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  Bell, Bot, Building2, Check, CheckCircle2, ChevronDown, CircleHelp,
  Clock3, FileText, Globe2, Lightbulb, Plus, Radar, Search, Settings,
  ShieldAlert, Sparkles, Tag, Target, TrendingUp, X, Layers3, Menu
} from "lucide-react";

const initialCompetitors = ["https://competitor1.com", "https://competitor2.com"];
const tabs = ["Overview", "Product & Features", "Pricing", "Recent Changes", "Recommendations"];

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".");
  } catch { return false; }
}

function App() {
  const [company, setCompany] = useState("");
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [competitorDraft, setCompetitorDraft] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [scanState, setScanState] = useState("idle");
  const [error, setError] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const companyCount = competitors.length + (company.trim() ? 1 : 0);
  const scanLabel = scanState === "scanning" ? "Scanning…" : "Start Intelligence Scan";

  function addCompetitor() {
    setError("");
    const value = competitorDraft.trim();
    if (!value) return;
    if (!validHttpUrl(value)) {
      setError("Enter a valid competitor URL beginning with https://");
      return;
    }
    if (competitors.includes(value) || value === company.trim()) {
      setError("That website is already included.");
      return;
    }
    if (competitors.length >= 3) {
      setError("You can compare up to 3 competitors at a time.");
      return;
    }
    setCompetitors([...competitors, value]);
    setCompetitorDraft("");
  }

  function startScan() {
    setError("");
    if (!validHttpUrl(company.trim())) {
      setError("Enter a valid company website beginning with https://");
      return;
    }
    if (competitors.length === 0) {
      setError("Add at least one competitor website.");
      return;
    }
    if (competitors.some((url) => !validHttpUrl(url))) {
      setError("One or more competitor URLs are invalid.");
      return;
    }
    setScanState("scanning");
    window.setTimeout(() => setScanState("complete"), 1800);
  }

  const navItems = [
    ["Dashboard", Activity], ["New Analysis", Plus], ["Reports", FileText],
    ["Tracked Companies", Building2], ["Alerts", Bell], ["Settings", Settings]
  ];

  const pageTitle = activeNav === "Dashboard" ? "Know Your Competition. Stay Ahead." : activeNav;
  const pageSubtitle = activeNav === "Dashboard"
    ? "AI agents that research, track and analyze your competitors across the web."
    : `Explore your ${activeNav.toLowerCase()} workspace and competitor intelligence.`;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Radar size={27} /></div>
          <div><strong>RivalRadar</strong><span>Competitor Intelligence Agent</span></div>
        </div>
        <nav className="nav-list">
          {navItems.map(([label, Icon]) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => { setActiveNav(label); setMenuOpen(false); }}>
              <Icon size={18} /><span>{label}</span>
              {label === "Alerts" && <b className="nav-count">3</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-promo">
          <div className="bot-orb"><Bot size={42} /></div>
          <h3>AI Agents at Work</h3>
          <p>Autonomously browse, extract and analyze competitor data using TinyFish.</p>
          <div className="powered"><Sparkles size={15} /> Powered by TinyFish</div>
        </div>
        <div className="sidebar-footer">RivalRadar <span>v1.0 demo</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19}/></button>
          <div className="breadcrumb">Workspace <span>/</span> {activeNav}</div>
          <div className="top-actions">
            <button className="icon-button notification" onClick={() => setShowAlerts(!showAlerts)} aria-label="Notifications">
              <Bell size={19}/><i />
            </button>
            <button className="profile" onClick={() => setShowAlerts(!showAlerts)}>S</button>
            <ChevronDown size={15} className="muted"/>
          </div>
          {showAlerts && <div className="notification-pop"><b>Recent alerts</b><p>Competitor pricing changed</p><p>New product feature detected</p></div>}
        </header>

        <div className="content">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span className="pulse-dot"/> COMPETITIVE INTELLIGENCE</div>
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>
            <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><Radar size={90}/><span className="spark spark-a">✦</span><span className="spark spark-b">✧</span></div>
          </section>

          <section className="analysis-card panel">
            <div className="section-heading"><div className="heading-icon"><Target size={19}/></div><div><h2>Start a Competitor Analysis</h2><p>Enter your website and up to 3 competitors to begin.</p></div></div>
            <div className="form-grid">
              <label className="field-group">
                <span>Your Company Website</span>
                <div className="url-input"><Globe2 size={17}/><input value={company} onChange={e => setCompany(e.target.value)} placeholder="https://yourcompany.com"/></div>
              </label>
              <div className="field-group">
                <span>Competitor Websites <small>(up to 3)</small></span>
                <div className="competitor-list">
                  {competitors.map((url, index) => <div className="competitor-chip" key={`${url}-${index}`}><Globe2 size={15}/><span title={url}>{url}</span><button onClick={() => setCompetitors(competitors.filter((_, i) => i !== index))} aria-label="Remove competitor"><X size={14}/></button></div>)}
                  {competitors.length < 3 && <div className="add-competitor"><input value={competitorDraft} onChange={e => setCompetitorDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompetitor()} placeholder="Add competitor URL"/><button onClick={addCompetitor}><Plus size={15}/> Add</button></div>}
                </div>
              </div>
              <button className="primary-button scan-button" onClick={startScan} disabled={scanState === "scanning"}><Sparkles size={17}/>{scanLabel}<ArrowRight size={16}/></button>
            </div>
            {error && <div className="error-message"><AlertTriangle size={15}/>{error}</div>}
            {scanState === "complete" && <div className="success-message"><CheckCircle2 size={16}/> Demo scan completed. The dashboard below is showing illustrative sample intelligence.</div>}
          </section>

          <section className="scan-status panel">
            <div className="scan-left">
              <div className={`scan-ring ${scanState === "scanning" ? "spinning" : ""}`}><Radar size={23}/></div>
              <div className="scan-copy"><h3>{scanState === "scanning" ? "Intelligence Scan in Progress…" : scanState === "complete" ? "Demo Intelligence Scan Complete" : "Ready to Investigate"}</h3><p>{scanState === "scanning" ? "Preparing the research workflow and agent tasks." : "Your AI agents will browse competitor websites, extract data and analyze insights."}</p>
                <div className="progress-track"><div className="progress-fill" style={{width: scanState === "complete" ? "100%" : scanState === "scanning" ? "68%" : "0%"}}/></div>
              </div>
              <strong className="progress-number">{scanState === "complete" ? "100%" : scanState === "scanning" ? "68%" : "—"}</strong>
            </div>
            <div className="agent-status">
              <div className="agent-title"><Sparkles size={15}/> 4 AI Agents</div>
              <div className="agent-pills">
                {["Market Scout", "Pricing Analyst", "Change Detector", "Strategy Analyst"].map((name, i) => <span className={scanState === "complete" ? "done" : scanState === "scanning" && i < 2 ? "working" : ""} key={name}>{scanState === "complete" ? <CheckCircle2 size={14}/> : scanState === "scanning" && i < 2 ? <Activity size={14}/> : <span className="agent-dot"/>}{name}</span>)}
              </div>
            </div>
          </section>

          <section className="metrics-grid">
            <Metric icon={<Building2/>} value={companyCount.toString().padStart(2,"0")} label="Companies in this scan" tone="purple"/>
            <Metric icon={<Layers3/>} value="14" label="Key updates found" change="+40%" tone="blue"/>
            <Metric icon={<Lightbulb/>} value="05" label="Opportunities" change="+25%" tone="yellow"/>
            <Metric icon={<ShieldAlert/>} value="03" label="Potential threats" change="+50%" tone="red"/>
          </section>

          <section className="workspace-grid">
            <div className="workspace-main">
              <div className="tabs panel">
                {tabs.map((tab, i) => <button key={tab} className={activeTab === tab ? "selected" : ""} onClick={() => setActiveTab(tab)}>
                  {i === 0 ? <Activity/> : i === 1 ? <Layers3/> : i === 2 ? <Tag/> : i === 3 ? <TrendingUp/> : <Lightbulb/>}{tab}
                </button>)}
              </div>
              {activeTab === "Overview" && <Overview />}
              {activeTab === "Product & Features" && <FeatureDetails />}
              {activeTab === "Pricing" && <PricingDetails />}
              {activeTab === "Recent Changes" && <Changes />}
              {activeTab === "Recommendations" && <Recommendations />}
            </div>
            <aside className="insights panel">
              <div className="insights-head"><Sparkles size={17}/><h3>AI Insights</h3><span className="live-label">DEMO</span></div>
              <Insight icon={<TrendingUp/>} tone="green" title="New Feature Launch" text="Competitor 1 launched an AI summarization feature recently."/>
              <Insight icon={<Tag/>} tone="yellow" title="Pricing Change" text="Competitor 2 reduced its Pro plan price by 20%."/>
              <Insight icon={<Lightbulb/>} tone="purple" title="Opportunity" text="A mobile collaboration feature gap may be worth exploring."/>
              <button className="report-button" onClick={() => setActiveTab("Recommendations")}>View Full Report <ArrowRight size={16}/></button>
            </aside>
          </section>
          <footer className="disclaimer"><CircleHelp size={14}/> Sample dashboard data is illustrative. Live research will be connected through the TinyFish backend.</footer>
        </div>
      </main>
    </div>
  );
}

function Metric({icon, value, label, change, tone}) {
  return <div className="metric-card panel"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-data"><strong>{value}</strong><span>{label}</span></div>{change && <small className="metric-change"><ArrowUpRight size={13}/>{change}</small>}</div>;
}
function Insight({icon, tone, title, text}) {
  return <div className="insight-item"><div className={`insight-icon ${tone}`}>{icon}</div><div><b>{title}</b><p>{text}</p></div></div>;
}
function Overview() {
  const features = [["AI Assistant",86,58],["Team Collaboration",67,95],["Integrations",73,61],["Analytics",73,42],["Mobile App",47,54]];
  return <div className="overview-grid">
    <div className="panel chart-card"><div className="card-title"><h3>Feature Comparison</h3><span>Illustrative score</span></div><div className="bar-chart">{features.map(([name, a, b])=><div className="bar-row" key={name}><label>{name}</label><div className="bars"><div className="bar purple-bar" style={{width:`${a}%`}}/><div className="bar cyan-bar" style={{width:`${b}%`}}/></div></div>)}</div><div className="legend"><span><i className="purple-dot"/> Your Company</span><span><i className="blue-dot"/> Competitor 1</span></div></div>
    <div className="panel pricing-card"><div className="card-title"><h3>Pricing Comparison</h3><span>Monthly plans</span></div><div className="price-plans">
      <PricePlan name="Your Company" price="$19" items={["Core features","Team (up to 5)","Basic analytics"]} featured/>
      <PricePlan name="Competitor 1" price="$24" items={["More integrations","Team (up to 10)","Advanced analytics"]}/>
      <PricePlan name="Competitor 2" price="$29" items={["Full feature set","Unlimited team","AI automation"]}/>
    </div></div>
  </div>;
}
function PricePlan({name, price, items, featured}) {
  return <div className={`price-plan ${featured ? "featured-plan" : ""}`}><b>{name}</b><strong>{price}<small>/mo</small></strong>{items.map(item=><span key={item}><Check size={13}/>{item}</span>)}</div>;
}
function FeatureDetails() {
  return <div className="panel detail-panel"><div className="card-title"><h3>Product & Feature Intelligence</h3><span>Sample comparison</span></div><div className="data-table"><div className="table-row table-head"><span>Capability</span><span>Your company</span><span>Competitor 1</span><span>Competitor 2</span></div>{[["AI Assistant","Available","Available","Advanced"],["Team Collaboration","Basic","Advanced","Advanced"],["Integrations","12 tools","18 tools","24 tools"],["Mobile Application","In roadmap","Available","Available"],["Analytics","Basic","Advanced","Advanced"]].map(row=><div className="table-row" key={row[0]}>{row.map((v,i)=><span key={i}>{i===0?v:<em className={v==="Available"||v==="Advanced"?"positive":""}>{v}</em>}</span>)}</div>)}</div></div>;
}
function PricingDetails() {
  return <div className="panel detail-panel"><div className="card-title"><h3>Pricing Intelligence</h3><span>Illustrative monthly prices</span></div><div className="price-plans expanded"><PricePlan name="Your Company" price="$19" items={["Core features","Team (up to 5)","Basic analytics"]} featured/><PricePlan name="Competitor 1" price="$24" items={["More integrations","Team (up to 10)","Advanced analytics"]}/><PricePlan name="Competitor 2" price="$29" items={["Full feature set","Unlimited team","AI automation"]}/></div><p className="note">Prices and plan details are placeholders for the interface demo. A live scan must verify currency, billing period and source URL.</p></div>;
}
function Changes() {
  const events = [["Competitor 1","Launched AI summarization feature","Product update","2 days ago","green"],["Competitor 2","Reduced Pro plan price by 20%","Pricing change","5 days ago","yellow"],["Competitor 1","Published enterprise integration page","Website update","1 week ago","blue"],["Competitor 2","Added customer story to homepage","Marketing","2 weeks ago","purple"]];
  return <div className="panel detail-panel"><div className="card-title"><h3>Recent Competitor Changes</h3><span>Sample activity feed</span></div><div className="timeline">{events.map(e=><div className="timeline-item" key={e[1]}><div className={`timeline-dot ${e[4]}`}/><div className="timeline-content"><b>{e[1]}</b><p>{e[0]} · {e[2]}</p></div><time>{e[3]}</time></div>)}</div></div>;
}
function Recommendations() {
  const recs = [["Explore mobile collaboration","Competitors appear to offer stronger mobile collaboration. Validate demand before prioritizing.","High opportunity"],["Review Pro plan positioning","A competitor price reduction may affect perceived value. Compare feature limits and target segments.","Monitor"],["Strengthen AI feature messaging","Competitor AI positioning is becoming more prominent. Clarify your differentiated use case.","Medium opportunity"]];
  return <div className="panel detail-panel"><div className="card-title"><h3>Strategic Recommendations</h3><span>AI-generated demo suggestions</span></div><div className="recommendations">{recs.map((r,i)=><div className="recommendation" key={r[0]}><div className="rec-number">0{i+1}</div><div><b>{r[0]}</b><p>{r[1]}</p><span>{r[2]}</span></div></div>)}</div></div>;
}
export default App;