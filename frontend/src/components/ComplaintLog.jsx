import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLog } from "../store/complaintSlice";

export default function ComplaintLog() {
  const dispatch = useDispatch();
  const { log } = useSelector((s) => s.complaint);

  useEffect(() => {
    dispatch(fetchLog());
  }, [dispatch]);

  return (
    <div className="panel log-section">
      <div className="panel-title">Complaint Log ({log.length})</div>
      {log.length === 0 ? (
        <div className="empty-copilot">No complaints logged yet.</div>
      ) : (
        <table className="log-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Batch</th>
              <th>Category</th>
              <th>Risk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {log.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: "var(--font-data)" }}>#{c.id}</td>
                <td>{c.customer_name || "—"}</td>
                <td>{c.product_name || "—"}</td>
                <td style={{ fontFamily: "var(--font-data)" }}>{c.batch_number || "—"}</td>
                <td>{c.complaint_category || "—"}</td>
                <td>
                  {c.risk_level ? (
                    <span className={`tag-risk ${c.risk_level}`}>{c.risk_level}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{c.completeness_status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
