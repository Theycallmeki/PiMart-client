import React, { useEffect, useState } from "react";

const BestSellers = () => {
  const [period, setPeriod] = useState("7");
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const route =
          period === "30"
            ? "https://smart-inventory-software.onrender.com/api/ai/best-sellers-30"
            : "https://smart-inventory-software.onrender.com/api/ai/best-sellers";

        const res = await fetch(route);
        const data = await res.json();
        setBestSellers(data.data || []);
      } catch (err) {
        console.error("Error loading best sellers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [period]);

  return (
    <div className="best-container">
      <style>{`
        .best-container {
          max-width: 1000px;
          margin: 120px auto;
          text-align: center;
          padding: 30px;
          background: #f9f9fb;
          border-radius: 16px;
        }

        .best-title {
          font-size: 2rem;
          color: #007bff;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .best-subtitle {
          color: #555;
          margin-bottom: 25px;
          font-size: 1rem;
        }

        .best-controls {
          margin-bottom: 20px;
        }

        .best-controls select {
          margin-left: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }

        .loading,
        .no-data {
          color: #555;
          font-style: italic;
        }

        .best-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .best-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .best-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
        }

        .rank-badge {
          position: absolute;
          top: -10px;
          left: -10px;
          background: #007bff;
          color: white;
          font-weight: bold;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-name {
          font-size: 1.2rem;
          margin-bottom: 8px;
          color: #333;
        }

        .item-qty {
          color: #555;
          margin-bottom: 12px;
        }
      `}</style>

      <h1 className="best-title">🔥 Best Sellers</h1>
      <p className="best-subtitle">
        Discover our most popular products — trusted and loved by our customers.
      </p>

      <div className="best-controls">
        <label htmlFor="period">Show top sellers from: </label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading best sellers...</p>
      ) : bestSellers.length === 0 ? (
        <p className="no-data">No best sellers available at the moment.</p>
      ) : (
        <div className="best-grid">
          {bestSellers.slice(0, 5).map((item, index) => (
            <div key={index} className="best-card">
              <div className="rank-badge">#{index + 1}</div>
              <div className="item-info">
                <h2 className="item-name">{item.item}</h2>
                <p className="item-qty">
                  Estimated Sales: <strong>{item.predictedNext || item.quantity}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSellers;
