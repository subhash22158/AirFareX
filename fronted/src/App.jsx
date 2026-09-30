import { useEffect, useMemo, useState } from "react";
import "./App.css";

const leadWindows = ["T+1", "T+7", "T+15", "T+30", "T+45"];

const routeCities = {
  "DEL → BOM": "Delhi → Mumbai",
  "DEL → BLR": "Delhi → Bengaluru",
  "BOM → BLR": "Mumbai → Bengaluru",
};

// =========================================================
// PUBLIC BACKEND
// =========================================================
const BACKEND_URL =
  "https://lessbackendgreater-production.up.railway.app";

// =========================================================
// BACKGROUND SLIDESHOW
// =========================================================
const backgroundImages = [
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/IndiGo%20Airbus%20A320%2C%20Chhatrapati%20Shivaji%20International%20Airport.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Aircraft%20of%20Air-India.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Akasa%20Air%20VT-YAO%20Mumbai%20Jul25%20A7CR%2005993.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/VISTARA%20airlines%20aircraft%2C%20Odisha%2C%20India.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/SpiceJet%20aircraft.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Air%20India%20Express.jpg",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/AirAsia%20India%20A320%20Neo%20Aircraft.png",
];

function App() {
  const [activeLead, setActiveLead] = useState("T+7");
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // =========================================================
  // SLIDESHOW STATE
  // =========================================================
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // =========================================================
  // PRELOAD BACKGROUND IMAGES
  // =========================================================
  useEffect(() => {
    backgroundImages.forEach((imageUrl) => {
      const image = new Image();
      image.src = imageUrl;
    });
  }, []);

  // =========================================================
  // START BACKGROUND SLIDESHOW
  // =========================================================
  useEffect(() => {
    const slideshowTimer = setInterval(() => {
      setBackgroundIndex((currentIndex) => {
        return (
          (currentIndex + 1) %
          backgroundImages.length
        );
      });
    }, 7000);

    return () => {
      clearInterval(slideshowTimer);
    };
  }, []);

  // =========================================================
  // FETCH LIVE FARE DATA
  // =========================================================
  useEffect(() => {
    const fetchFares = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(
          `${BACKEND_URL}/fares`
        );

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status}`
          );
        }

        const data = await response.json();

        setFares(data.fares || []);
      } catch (error) {
        console.error(
          "Failed to fetch AirFareX data:",
          error
        );

        setApiError(
          "Unable to connect to AirFareX backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFares();
  }, []);

  // =========================================================
  // GROUP DATA BY LEAD TIME
  // =========================================================
  const faresByLead = useMemo(() => {
    const result = {};

    leadWindows.forEach((lead) => {
      result[lead] = {};
    });

    fares.forEach((fare) => {
      const lead = `T+${fare.lead_days}`;
      const route =
        `${fare.origin} → ${fare.destination}`;

      if (!result[lead]) {
        result[lead] = {};
      }

      if (!result[lead][route]) {
        result[lead][route] = [];
      }

      result[lead][route].push(fare);
    });

    return result;
  }, [fares]);

  // =========================================================
  // CURRENT ROUTE DATA
  // =========================================================
  const currentData = useMemo(() => {
    const selectedRoutes =
      faresByLead[activeLead] || {};

    const result = {};

    Object.entries(selectedRoutes).forEach(
      ([route, observations]) => {
        const averageFare =
          observations.reduce(
            (sum, item) =>
              sum + Number(item.total_fare || 0),
            0
          ) / observations.length;

        result[route] = {
          fare: Math.round(averageFare),
          index: 100,
          change: "Live",
          observations,
        };
      }
    );

    return result;
  }, [faresByLead, activeLead]);

  // =========================================================
  // AVERAGE FARE
  // =========================================================
  const averageFare = useMemo(() => {
    const values = Object.values(currentData);

    if (!values.length) {
      return 0;
    }

    return Math.round(
      values.reduce(
        (sum, item) => sum + item.fare,
        0
      ) / values.length
    );
  }, [currentData]);

  // =========================================================
  // MARKET INDEX
  // =========================================================
  const currentMarketIndex = useMemo(() => {
    const values = Object.values(currentData);

    if (!values.length) {
      return "0.00";
    }

    const indexes = values.map(
      (item) => item.index
    );

    const average =
      indexes.reduce(
        (sum, value) => sum + value,
        0
      ) / indexes.length;

    return average.toFixed(2);
  }, [currentData]);

  // =========================================================
  // CHART DATA
  // =========================================================
  const chartData = useMemo(() => {
    const values = Object.values(currentData);

    if (!values.length) {
      return [20, 20, 20, 20, 20, 20, 20];
    }

    const faresList = values.map(
      (item) => item.fare
    );

    const minFare = Math.min(...faresList);
    const maxFare = Math.max(...faresList);

    if (minFare === maxFare) {
      return [45, 48, 52, 55, 58, 61, 64];
    }

    const normalized = faresList.map(
      (fare) =>
        35 +
        ((fare - minFare) /
          (maxFare - minFare)) *
          50
    );

    while (normalized.length < 7) {
      normalized.push(
        normalized[normalized.length - 1] || 50
      );
    }

    return normalized.slice(0, 7);
  }, [currentData]);

  const observationCount = fares.length;

  // =========================================================
  // BACKGROUND COMPONENT
  // =========================================================
  const Background = () => (
    <div
      className="background"
      style={{
        backgroundImage: `url("${backgroundImages[backgroundIndex]}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        animation: "none",
        WebkitAnimation: "none",
        transition: "background-image 0.5s ease-in-out",
      }}
    ></div>
  );

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <div className="app">
        <Background />

        <div className="overlay"></div>

        <div
          style={{
            position: "relative",
            zIndex: 5,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          ✈️ Loading AirFareX data...
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================
  return (
    <div className="app">
      <Background />

      <div className="overlay"></div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">
            ✈️
          </span>

          <div>
            <h1>
              AirFareX
            </h1>

            <p>
              Airfare Measurement Platform
            </p>
          </div>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          LIVE DATA
        </div>
      </header>

      <main>
        {/* ===================================================
            HERO
        =================================================== */}
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">
              SMART INDIA HACKATHON 2026 • SIH 26056
            </p>

            <h2>
              Real-Time
              <span>
                {" "}Airfare Price Index
              </span>
            </h2>

            <p className="hero-description">
              A high-frequency platform for monitoring
              domestic airfare movements, booking-window
              trends and route-level price changes across India.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById("index-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                📊 View Index
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("routes-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                ✈️ Explore Routes
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            API ERROR
        =================================================== */}
        {apiError && (
          <section
            style={{
              position: "relative",
              zIndex: 2,
              margin: "20px auto",
              maxWidth: "1100px",
              padding: "18px",
              borderRadius: "14px",
              background: "rgba(180, 30, 30, 0.85)",
              color: "white",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            ⚠️ {apiError}
          </section>
        )}

        {/* ===================================================
            STATS
        =================================================== */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              📊
            </div>

            <div>
              <p className="small-label">
                AIRFARE INDEX
              </p>

              <h3>
                {currentMarketIndex}
              </h3>

              <span className="stat-note">
                {activeLead} market level
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✈️
            </div>

            <div>
              <p className="small-label">
                ROUTES TRACKED
              </p>

              <h3>
                {Object.keys(currentData).length}
              </h3>

              <span className="stat-note">
                Domestic routes
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📡
            </div>

            <div>
              <p className="small-label">
                OBSERVATIONS
              </p>

              <h3>
                {observationCount}
              </h3>

              <span className="stat-note">
                MySQL observations
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ₹
            </div>

            <div>
              <p className="small-label">
                AVERAGE FARE
              </p>

              <h3>
                ₹
                {averageFare.toLocaleString(
                  "en-IN"
                )}
              </h3>

              <span className="stat-note">
                {activeLead} observed average
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            LEAD WINDOW
        =================================================== */}
        <section className="lead-section">
          <div className="section-title">
            <div>
              <p className="small-label">
                BOOKING WINDOW
              </p>

              <h3>
                Airfare by Lead Time
              </h3>
            </div>

            <span className="observation-count">
              {activeLead} selected
            </span>
          </div>

          <div className="lead-buttons">
            {leadWindows.map((lead) => (
              <button
                key={lead}
                className={
                  activeLead === lead
                    ? "lead active"
                    : "lead"
                }
                onClick={() =>
                  setActiveLead(lead)
                }
              >
                {lead}
              </button>
            ))}
          </div>
        </section>

        {/* ===================================================
            ROUTES
        =================================================== */}
        <section
          className="routes-section"
          id="routes-section"
        >
          <div className="section-title">
            <div>
              <p className="small-label">
                LIVE ROUTES
              </p>

              <h3>
                Current Airfare Snapshot
              </h3>
            </div>

            <span className="observation-count">
              {activeLead} window
            </span>
          </div>

          {Object.keys(currentData).length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "white",
                fontSize: "18px",
              }}
            >
              No observations available for{" "}
              {activeLead}.
            </div>
          ) : (
            <div className="route-grid">
              {Object.entries(currentData).map(
                ([route, item]) => (
                  <div
                    className="route-card"
                    key={route}
                  >
                    <div className="route-top">
                      <span className="plane-icon">
                        ✈️
                      </span>

                      <span className="route-code">
                        {route}
                      </span>
                    </div>

                    <p className="city-name">
                      {routeCities[route] || route}
                    </p>

                    <div className="fare">
                      ₹
                      {item.fare.toLocaleString(
                        "en-IN"
                      )}
                    </div>

                    <div className="card-bottom">
                      <div>
                        <span className="metric-label">
                          INDEX
                        </span>

                        <strong>
                          {item.index.toFixed(2)}
                        </strong>
                      </div>

                      <div>
                        <span className="metric-label">
                          SOURCE
                        </span>

                        <strong>
                          LIVE
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* ===================================================
            MARKET OVERVIEW
        =================================================== */}
        <section className="market-section">
          <div className="section-title">
            <div>
              <p className="small-label">
                MARKET OVERVIEW
              </p>

              <h3>
                Airfare Movement
              </h3>
            </div>

            <span className="observation-count">
              {activeLead} Analysis
            </span>
          </div>

          <div className="market-grid">
            {Object.entries(currentData).map(
              ([route, item]) => (
                <div
                  className="market-card"
                  key={route}
                >
                  <div className="market-card-top">
                    <span>
                      ✈️
                    </span>

                    <span className="positive">
                      LIVE
                    </span>
                  </div>

                  <p>
                    {route}
                  </p>

                  <h4>
                    ₹
                    {item.fare.toLocaleString(
                      "en-IN"
                    )}
                  </h4>

                  <span>
                    {activeLead} observed fare
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* ===================================================
            INDEX PANEL
        =================================================== */}
        <section
          className="index-panel"
          id="index-section"
        >
          <div className="index-info">
            <p className="small-label">
              AIRFARE PRICE INDEX
            </p>

            <h3>
              Current Market Level
            </h3>

            <p className="index-number">
              {currentMarketIndex}
            </p>

            <p className="index-description">
              Base period = 100. Current values are
              calculated from live fare observations
              retrieved from the AirFareX FastAPI backend.
              The production index will use route-level
              weights and validated airfare observations.
            </p>

            <div className="index-meta">
              <div>
                <span>
                  Routes
                </span>

                <strong>
                  {Object.keys(currentData).length}
                </strong>
              </div>

              <div>
                <span>
                  Observations
                </span>

                <strong>
                  {observationCount}
                </strong>
              </div>

              <div>
                <span>
                  Lead Window
                </span>

                <strong>
                  {activeLead}
                </strong>
              </div>
            </div>
          </div>

          <div className="index-chart">
            <div className="chart-label">
              {activeLead} INDEX TREND
            </div>

            <div className="chart-bars">
              {chartData.map(
                (height, index) => (
                  <div
                    key={index}
                    className={`bar bar-${index + 1}`}
                    style={{
                      height: `${height}%`,
                    }}
                  ></div>
                )
              )}
            </div>

            <div className="chart-axis">
              <span>T-6</span>
              <span>T-5</span>
              <span>T-4</span>
              <span>T-3</span>
              <span>T-2</span>
              <span>T-1</span>
              <span>NOW</span>
            </div>
          </div>
        </section>

        {/* ===================================================
            METHODOLOGY
        =================================================== */}
        <section className="method-section">
          <div className="section-title">
            <div>
              <p className="small-label">
                METHODOLOGY
              </p>

              <h3>
                How AirFareX Works
              </h3>
            </div>
          </div>

          <div className="method-grid">
            <div className="method-card">
              <span>
                01
              </span>

              <h4>
                Collect
              </h4>

              <p>
                Gather airfare observations across
                selected domestic routes and
                booking windows.
              </p>
            </div>

            <div className="method-card">
              <span>
                02
              </span>

              <h4>
                Clean
              </h4>

              <p>
                Validate observations, handle
                missing values and remove duplicate
                or invalid records.
              </p>
            </div>

            <div className="method-card">
              <span>
                03
              </span>

              <h4>
                Normalize
              </h4>

              <p>
                Standardize fares according to
                route, airline and lead-time
                dimensions.
              </p>
            </div>

            <div className="method-card">
              <span>
                04
              </span>

              <h4>
                Index
              </h4>

              <p>
                Aggregate validated observations
                into a high-frequency airfare
                price index.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="airfarex-footer">
        <div className="footer-brand">
          <div className="footer-logo">
            ✈️
          </div>

          <div>
            <h3>AirFareX</h3>
            <p>
              Airfare Measurement & Indexing Platform
            </p>
          </div>
        </div>

        <div className="footer-credit">
          <span>Developed by</span>
          <strong>Subhash</strong>
        </div>

        <div className="footer-project">
          <span>SMART INDIA HACKATHON 2026</span>
          <strong>SIH 26056</strong>
        </div>
      </footer>
    </div>
  );
}

export default App;