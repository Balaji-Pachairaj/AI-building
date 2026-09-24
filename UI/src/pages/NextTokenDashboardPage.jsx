import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  Cpu,
  History,
  Clock,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
  Sliders,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';
import {
  fetchModels,
  fetchHistory,
  generateNextTokens,
  setSelectedModelId,
  clearGeneration,
} from '../features/nextToken/nextTokenSlice';

const PRESET_PROMPTS = [
  'The weather today is',
  'Artificial intelligence will',
  'The key to successful software engineering is',
  'In the future, technology will enable',
  'Deep learning algorithms can',
];

const NextTokenDashboardPage = () => {
  const dispatch = useDispatch();

  const {
    models,
    modelsLoading,
    selectedModelId,
    generation,
    history,
  } = useSelector((state) => state.nextToken);

  const { status: healthStatus, duration: healthDuration } = useSelector(
    (state) => state.health
  );

  // Local form state
  const [inputText, setInputText] = useState('The weather today is');
  const [tokensCount, setTokensCount] = useState(2);
  const [copiedContinuation, setCopiedContinuation] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Initial data loading on mount
  useEffect(() => {
    dispatch(fetchModels());
    dispatch(fetchHistory({ page: 1, limit: history.limit }));
  }, [dispatch]);

  // Selected model details
  const activeModel =
    models.find((m) => m.model_id === selectedModelId) ||
    models[0] || { model_id: 1, model_name: 'gpt-5' };

  // Handle generation submit
  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    dispatch(
      generateNextTokens({
        input: inputText.trim(),
        tokens: Number(tokensCount),
        model_id: activeModel.model_id,
      })
    );
  };

  // Copy helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'continuation') {
      setCopiedContinuation(true);
      setTimeout(() => setCopiedContinuation(false), 2000);
    } else {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    }
  };

  // Reuse prompt from history
  const handleReusePrompt = (item) => {
    setInputText(item.input);
    setTokensCount(item.tokens_requested || 2);
    if (item.model_id) {
      dispatch(setSelectedModelId(item.model_id));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= history.totalPages) {
      dispatch(fetchHistory({ page: newPage, limit: history.limit }));
    }
  };

  // Filter history items by search
  const filteredHistory = history.items.filter(
    (item) =>
      item.input.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.output.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.model_name.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* ---------------------------------------------------- */}
      {/* 1. Header & Metrics Bar                              */}
      {/* ---------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} color="var(--accent-primary)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              LLM Inference Engine
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            Next Token Prediction
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginTop: '0.35rem',
            }}
          >
            Predict and generate the next sequence of tokens using OpenAI models with full audit history.
          </p>
        </div>

        <button
          onClick={() => {
            dispatch(fetchModels());
            dispatch(fetchHistory({ page: history.page, limit: history.limit }));
          }}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          title="Refresh models and history"
        >
          <RotateCcw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Total Generations */}
        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Total Predictions</span>
            <History size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">{history.total}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Logged in MongoDB collection
          </span>
        </div>

        {/* Selected Model */}
        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Selected Model</span>
            <Cpu size={16} color="var(--text-muted)" />
          </div>
          <div
            className="stat-value"
            style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}
          >
            {activeModel.model_name || 'Loading...'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Internal ID: #{activeModel.model_id} ({models.length} available)
          </span>
        </div>

        {/* Requested Tokens */}
        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Tokens to Generate</span>
            <Sliders size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">{tokensCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Controlled by OpenAI max_completion_tokens
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. Interactive Playground & Result Display          */}
      {/* ---------------------------------------------------- */}
      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2.5rem' }}>
        {/* Left Column: Playground Form */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">
              <Zap size={18} color="var(--accent-primary)" />
              <span>Token Prediction Playground</span>
            </h2>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              GET /get-next-token
            </span>
          </div>

          <form onSubmit={handleGenerate}>
            {/* Model Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="model-select">
                Choose Model (sorted by cost)
              </label>
              <select
                id="model-select"
                className="form-select"
                value={selectedModelId}
                onChange={(e) => dispatch(setSelectedModelId(e.target.value))}
                disabled={modelsLoading}
              >
                {models.map((m) => (
                  <option key={m.model_id} value={m.model_id}>
                    #{m.model_id} — {m.model_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Prompt Chips */}
            <div style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                Quick Prompt Starters:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(preset)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {preset}...
                  </button>
                ))}
              </div>
            </div>

            {/* Input Sequence Textarea */}
            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <label className="form-label" htmlFor="input-sequence" style={{ margin: 0 }}>
                  Input Text Sequence
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {inputText.length} chars
                </span>
              </div>
              <textarea
                id="input-sequence"
                className="form-textarea"
                rows={3}
                placeholder="Type your beginning sentence or phrase here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ fontFamily: 'var(--font-sans)', minHeight: '85px' }}
                required
              />
            </div>

            {/* Tokens Count Slider & Input */}
            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <label className="form-label" htmlFor="tokens-slider" style={{ margin: 0 }}>
                  Number of Tokens to Predict: <strong style={{ color: 'var(--accent-primary)' }}>{tokensCount}</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Limit: 1 - 50 tokens
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  id="tokens-slider"
                  type="range"
                  min="1"
                  max="50"
                  value={tokensCount}
                  onChange={(e) => setTokensCount(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--accent-primary)',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tokensCount}
                  onChange={(e) => setTokensCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="form-input"
                  style={{ width: '70px', textAlign: 'center', padding: '0.4rem' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={generation.loading || !inputText.trim()}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem 1.25rem' }}
              >
                {generation.loading ? (
                  <>
                    <span className="pulse-dot online" style={{ width: '8px', height: '8px' }} />
                    <span>Predicting Tokens...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Next Tokens</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  dispatch(clearGeneration());
                }}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1rem' }}
                title="Clear input and result"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Generation Result Panel */}
        <div className="card" style={{ marginBottom: 0, minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h2 className="card-title">
              <FileText size={18} color="var(--accent-success)" />
              <span>Prediction Result</span>
            </h2>
            {generation.result && (
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                Generated in {generation.latency || '~'}ms
              </span>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Loading State */}
            {generation.loading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--accent-primary)',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Invoking OpenAI Model...
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Generating {tokensCount} continuation token(s) using {activeModel.model_name}
                </p>
              </div>
            )}

            {/* Error State */}
            {!generation.loading && generation.error && (
              <div
                style={{
                  background: 'var(--accent-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  color: 'var(--accent-danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <strong style={{ fontSize: '0.95rem' }}>Generation Failed</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {generation.error}
                </p>
              </div>
            )}

            {/* Success State */}
            {!generation.loading && !generation.error && generation.result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Result Display Box */}
                <div
                  style={{
                    background: '#090d16',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {generation.result.input}{' '}
                  </span>
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.25)',
                      color: '#a5b4fc',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    {generation.result.output}
                  </span>
                </div>

                {/* Metadata Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Model: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {generation.result.model_name}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Tokens: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {generation.result.tokens_requested}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Saved to: </span>
                    <strong style={{ color: 'var(--accent-success)' }}>MongoDB</strong>
                  </div>
                </div>

                {/* Copy Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(generation.result.output, 'continuation')}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    {copiedContinuation ? (
                      <>
                        <Check size={14} color="var(--accent-success)" />
                        <span>Copied Tokens!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${generation.result.input} ${generation.result.output}`,
                        'full'
                      )
                    }
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    {copiedFull ? (
                      <>
                        <Check size={14} color="var(--accent-success)" />
                        <span>Copied All!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Full Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!generation.loading && !generation.error && !generation.result && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Sparkles size={36} color="var(--border-color)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Awaiting Input
                </h4>
                <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
                  Select a model, enter your input text sequence, and click "Generate Next Tokens" to see predictions live.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. Token Generation History Log                      */}
      {/* ---------------------------------------------------- */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">
              <History size={18} color="var(--accent-info)" />
              <span>Token Generation History</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Historical queries retrieved from MongoDB (`GET /get-next-token-history`)
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search history..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* History Table */}
        {history.loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-info)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 0.75rem',
              }}
            />
            <span>Loading history from MongoDB...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={32} color="var(--border-color)" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              No Generation Records Found
            </h4>
            <p style={{ fontSize: '0.85rem' }}>
              {historySearch
                ? `No records matching "${historySearch}"`
                : 'Generate your first next-token prediction to see historical records here.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Model</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tokens</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Input Sequence</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Generated Output</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Timestamp */}
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem',
                      }}
                    >
                      {item.created_at
                        ? new Date(item.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : '—'}
                    </td>

                    {/* Model */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span
                        className="badge badge-info"
                        style={{ fontSize: '0.75rem', padding: '2px 7px' }}
                      >
                        {item.model_name || `ID #${item.model_id}`}
                      </span>
                    </td>

                    {/* Tokens */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      <strong>{item.tokens_requested}</strong>
                    </td>

                    {/* Input */}
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--text-primary)',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.input}
                    >
                      {item.input}
                    </td>

                    {/* Output */}
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.output}
                    >
                      <span
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#a5b4fc',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {item.output}
                      </span>
                    </td>

                    {/* Reuse Button */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleReusePrompt(item)}
                        className="btn btn-outline"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Load this prompt and model into the playground"
                      >
                        <span>Reuse</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {history.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              marginTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Page {history.page} of {history.totalPages} ({history.total} total)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handlePageChange(history.page - 1)}
                disabled={history.page <= 1 || history.loading}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <button
                onClick={() => handlePageChange(history.page + 1)}
                disabled={history.page >= history.totalPages || history.loading}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextTokenDashboardPage;
