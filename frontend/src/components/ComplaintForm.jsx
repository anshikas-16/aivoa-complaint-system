import { useDispatch, useSelector } from "react-redux";
import { updateField, saveComplaint, fetchLog } from "../store/complaintSlice";

const CATEGORIES = ["Quality", "Packaging", "Efficacy", "Adverse Event", "Delivery", "Documentation", "Other"];
const CHANNELS = ["Email", "Phone", "Portal", "PDF", "Other"];

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const { form, status } = useSelector((s) => s.complaint);

  const set = (field) => (e) =>
    dispatch(updateField({ field, value: e.target.value }));

  const canSave = form.customer_name || form.product_name || form.complaint_description;

  const handleSave = async () => {
    await dispatch(saveComplaint());
    dispatch(fetchLog());
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="num">2</span> Log Customer Complaint
      </div>

      <div className="field-pair">
        <div className="field-row">
          <label>Customer Name</label>
          <input value={form.customer_name} onChange={set("customer_name")} placeholder="—" />
        </div>
        <div className="field-row">
          <label>Product</label>
          <input value={form.product_name} onChange={set("product_name")} placeholder="—" />
        </div>
      </div>

      <div className="field-pair">
        <div className="field-row mono">
          <label>Batch Number</label>
          <input value={form.batch_number} onChange={set("batch_number")} placeholder="—" />
        </div>
        <div className="field-row">
          <label>Category</label>
          <select value={form.complaint_category} onChange={set("complaint_category")}>
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <label>Complaint Description</label>
        <textarea value={form.complaint_description} onChange={set("complaint_description")} />
      </div>

      <div className="field-pair">
        <div className="field-row">
          <label>Date Received</label>
          <input value={form.date_received} onChange={set("date_received")} placeholder="YYYY-MM-DD" />
        </div>
        <div className="field-row">
          <label>Reported Via</label>
          <select value={form.reported_via} onChange={set("reported_via")}>
            <option value="">—</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className="btn-primary"
        disabled={!canSave || status === "saving"}
        onClick={handleSave}
        style={{ width: "100%", marginTop: 6 }}
      >
        {status === "saving" ? "Saving..." : "Save Complaint Record"}
      </button>
    </div>
  );
}
