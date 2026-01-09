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
  width: calc(100% - 80px);        /* horizontal margin */
  min-height: calc(100vh - 160px); /* still tall, but less push down */
  margin: 80px auto 40px auto;     /* MOVE UP */
  text-align: center;
  padding: 48px 48px;
  background: #EBEBEB;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
}



  .best-title {
    font-size: 2.1rem;
    color: #113F67;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .best-subtitle {
    color: #6B7280;
    margin-bottom: 28px;
    font-size: 0.95rem;
  }

  .best-controls {
    margin-bottom: 24px;
    color: #374151;
    font-weight: 500;
  }

  .best-controls select {
    margin-left: 10px;
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
    color: #113F67;
    background: #ffffff;
    cursor: pointer;
  }

  .loading,
  .no-data {
    color: #6B7280;
    font-style: italic;
    margin-top: 20px;
  }

  .best-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
    margin-top: 32px;
  }

  .best-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    padding: 24px 20px;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .best-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  }

  .rank-badge {
    position: absolute;
    top: -14px;
    left: -14px;
    background: #113F67;
    color: #ffffff;
    font-weight: 700;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }

  .item-name {
    font-size: 1.1rem;
    margin-bottom: 6px;
    color: #113F67;
    font-weight: 600;
  }

  .item-qty {
    color: #374151;
    font-size: 0.9rem;
  }
    @media (max-width: 768px) {
  .best-container {
    width: calc(100% - 32px);
    margin: 96px auto 24px auto;
    padding: 32px 20px;
    border-radius: 16px;
  }
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
