import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

const emptyForm = {
  customer_name: "",
  product_name: "",
  batch_number: "",
  complaint_category: "",
  complaint_description: "",
  date_received: "",
  reported_via: "",
};

const emptyCopilot = {
  risk_level: null,
  risk_score: null,
  risk_justification: null,
  is_adverse_event: null,
  completeness_status: null,
  missing_fields: null,
  ai_summary: null,
  root_cause_hint: null,
  capa_recommendation: null,
};

export const analyzeText = createAsyncThunk(
  "complaint/analyzeText",
  async (text) => api.analyzeText(text)
);

export const analyzeFile = createAsyncThunk(
  "complaint/analyzeFile",
  async (file) => api.analyzeFile(file)
);

export const saveComplaint = createAsyncThunk(
  "complaint/save",
  async (_, { getState }) => {
    const { form, copilot, rawText } = getState().complaint;
    return api.createComplaint({ ...form, ...copilot, raw_input_text: rawText });
  }
);

export const fetchLog = createAsyncThunk("complaint/fetchLog", async () =>
  api.listComplaints()
);

const complaintSlice = createSlice({
  name: "complaint",
  initialState: {
    rawText: "",
    form: emptyForm,
    copilot: emptyCopilot,
    log: [],
    status: "idle", // idle | analyzing | ready | saving | error
    error: null,
  },
  reducers: {
    setRawText(state, action) {
      state.rawText = action.payload;
    },
    updateField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm(state) {
      state.form = emptyForm;
      state.copilot = emptyCopilot;
      state.rawText = "";
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeText.pending, (state) => {
        state.status = "analyzing";
        state.error = null;
      })
      .addCase(analyzeFile.pending, (state) => {
        state.status = "analyzing";
        state.error = null;
      })
      .addCase(analyzeText.fulfilled, applyAnalysis)
      .addCase(analyzeFile.fulfilled, applyAnalysis)
      .addCase(analyzeText.rejected, applyError)
      .addCase(analyzeFile.rejected, applyError)
      .addCase(saveComplaint.pending, (state) => {
        state.status = "saving";
      })
      .addCase(saveComplaint.fulfilled, (state) => {
        state.status = "idle";
        state.form = emptyForm;
        state.copilot = emptyCopilot;
        state.rawText = "";
      })
      .addCase(saveComplaint.rejected, applyError)
      .addCase(fetchLog.fulfilled, (state, action) => {
        state.log = action.payload;
      });
  },
});

function applyAnalysis(state, action) {
  const result = action.payload;
  state.status = "ready";
  state.form = {
    customer_name: result.customer_name || "",
    product_name: result.product_name || "",
    batch_number: result.batch_number || "",
    complaint_category: result.complaint_category || "",
    complaint_description: result.complaint_description || "",
    date_received: result.date_received || "",
    reported_via: result.reported_via || "",
  };
  state.copilot = {
    risk_level: result.risk_level,
    risk_score: result.risk_score,
    risk_justification: result.risk_justification,
    is_adverse_event: result.is_adverse_event,
    completeness_status: result.completeness_status,
    missing_fields: result.missing_fields,
    ai_summary: result.ai_summary,
    root_cause_hint: result.root_cause_hint,
    capa_recommendation: result.capa_recommendation,
  };
}

function applyError(state, action) {
  state.status = "error";
  state.error = action.error.message || "Something went wrong";
}

export const { setRawText, updateField, resetForm } = complaintSlice.actions;
export default complaintSlice.reducer;
