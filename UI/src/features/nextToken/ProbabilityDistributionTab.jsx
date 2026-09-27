import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  BarChart2,
  Plus,
  RotateCcw,
  Undo2,
  Play,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Hash,
  Sliders,
  Cpu,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  fetchProbabilityDistribution,
  setDistributionPrompt,
  setDistributionTopK,
  setSelectedModelId,
  addTokenToPrompt,
  undoLastToken,
  clearDistributionTrail,
  clearDistributionPredictions,
  appendTokenToPrompt,
} from './nextTokenSlice';

const PRESET_PROMPTS = [
  'The cat is',
  'The cat is sleep',
  'Artificial intelligence will',
  'The future of programming is',
  'Once upon a time in a',
  'The best way to learn is',
];

const TOP_K_OPTIONS = [5, 8, 10, 15, 20];

/**
 * ProbabilityDistributionTab Component
 *
 * Demonstrates interactive autoregressive next-token prediction
 * with live probability distributions, space-aware token appending,
 * and step-by-step text generation.
 */
const ProbabilityDistributionTab = () => {
  const dispatch = useDispatch();

  const {
    models,
    modelsLoading,
    selectedModelId,
    distribution,
  } = useSelector((state) => state.nextToken);

  const {
    prompt,
    topK,
    predictions,
    loading,
    error,
    latency,
    historyTrail,
  } = distribution;

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showExplainer, setShowExplainer] = useState(true);
  const textareaRef = useRef(null);

  // Active model config
  const activeModel =
    models.find((m) => m.model_id === selectedModelId) ||
    models[0] || { model_id: 1, model_name: 'gpt-4o' };

  // Calculate estimated tokens (approx 4 chars per token in English)
  const estimatedTokens =
    prompt.trim().length > 0 ? Math.max(1, Math.ceil(prompt.trim().length / 4)) : 0;

  // Trigger probability distribution prediction
  const handlePredict = (targetPrompt) => {
    const textToPredict = targetPrompt !== undefined ? targetPrompt : prompt;
    if (loading) return;

    dispatch(
      fetchProbabilityDistribution({
        prompt: textToPredict,
        topK,
        model_id: activeModel.model_id,
      })
    );
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter to predict
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePredict();
    }
  };

  // Handle clicking [Add] on a candidate token
  const handleAddToken = (token) => {
    if (loading) return;

    // 1. Calculate new prompt using space-aware token joining
    const newPrompt = appendTokenToPrompt(prompt, token);

    // 2. Dispatch Redux action to update prompt and history trail
    dispatch(addTokenToPrompt(token));

    // 3. Immediately request next-word probability distribution
    handlePredict(newPrompt);

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Step Forward: automatically pick the #1 (highest probability) token
  const handleStepForward = () => {
    if (predictions.length > 0 && !loading) {
      handleAddToken(predictions[0].token);
    }
  };

  // Undo last added token
  const handleUndo = () => {
    if (historyTrail.length > 0 && !loading) {
      const last = historyTrail[historyTrail.length - 1];
      dispatch(undoLastToken());
      handlePredict(last.previousPrompt);
    }
  };

  // Clear prompt and predictions
  const handleClear = () => {
    dispatch(setDistributionPrompt(''));
    dispatch(clearDistributionPredictions());
    dispatch(clearDistributionTrail());
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Pre-fetch probability distribution on initial mount if empty
  useEffect(() => {
    if (predictions.length === 0 && prompt.trim() && !loading) {
      handlePredict(prompt);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. Header & Educational Callout                                   */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '0.5rem',
            }}
          >
            <BarChart2 size={13} color="var(--accent-success)" />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-success)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Interactive Probability Distribution
            </span>
          </div>

          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            Next-Token Probability Explorer
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Inspect candidate tokens predicted by the language model, visualize their softmax
            probability distribution, and compose text token by token.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExplainer(!showExplainer)}
          className="btn btn-outline"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          <HelpCircle size={14} />
          <span>{showExplainer ? 'Hide Guide' : 'How It Works'}</span>
        </button>
      </div>

      {/* Explainer Accordion Card */}
      {showExplainer && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} color="var(--accent-primary)" />
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              How Autoregressive Next-Token Prediction Works
            </strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Language models generate text by predicting a probability distribution over their entire
            vocabulary for the <em>single next token</em>. Tokens starting with a space (e.g.{' '}
            <code style={{ background: '#0f172a', padding: '2px 5px', borderRadius: '4px' }}>
              &quot; sleeping&quot;
            </code>
            ) represent whole words, while tokens without spaces (e.g.{' '}
            <code style={{ background: '#0f172a', padding: '2px 5px', borderRadius: '4px' }}>
              &quot;ing&quot;
            </code>
            ) represent subword continuations. Click <strong>[Add]</strong> to append any candidate and
            immediately recalculate probabilities for the next step!
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. Three Inputs Section: Prompt, Model_id, Number of Top K        */}
      {/* ------------------------------------------------------------------ */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Input Prompt & Controls</span>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try:</span>
            {PRESET_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  dispatch(setDistributionPrompt(sample));
                  handlePredict(sample);
                }}
                disabled={loading}
                style={{
                  background: prompt === sample ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: prompt === sample ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                &quot;{sample}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* Input Prompt Multi-Line Textarea */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem',
            }}
          >
            <label className="form-label" htmlFor="distribution-prompt" style={{ margin: 0 }}>
              1) Input Prompt <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{prompt.length} characters</span>
              <span>•</span>
              <span>~{estimatedTokens} tokens</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-primary)' }}>Ctrl/Cmd + Enter to predict</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            id="distribution-prompt"
            className="form-textarea"
            rows={4}
            placeholder="Enter a sentence and see what the language model predicts next..."
            value={prompt}
            onChange={(e) => dispatch(setDistributionPrompt(e.target.value))}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              fontFamily: 'var(--font-sans)',
              minHeight: '100px',
              border: '1px solid var(--border-color)',
              background: '#0a0f1d',
            }}
          />
        </div>

        {/* Controls Grid: Model_id & Number of Predictions (Top K) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
          }}
        >
          {/* Input 2: Number of next word predict / Top K */}
          <div className="form-group" style={{ margin: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label className="form-label" htmlFor="top-k-select" style={{ margin: 0 }}>
                2) Number of Next Candidates (Top K)
              </label>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                Top {topK}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TOP_K_OPTIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    dispatch(setDistributionTopK(val));
                    if (prompt.trim()) {
                      dispatch(
                        fetchProbabilityDistribution({
                          prompt,
                          topK: val,
                          model_id: activeModel.model_id,
                        })
                      );
                    }
                  }}
                  className={topK === val ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    flex: '1 1 auto',
                  }}
                  disabled={loading}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Input 3: Model_id from /get-models-id */}
          <div className="form-group" style={{ margin: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label className="form-label" htmlFor="model-id-select" style={{ margin: 0 }}>
                3) Model_id (from /get-models-id)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Internal ID: #{activeModel.model_id}
              </span>
            </div>

            <select
              id="model-id-select"
              className="form-select"
              value={selectedModelId}
              onChange={(e) => {
                const newModelId = Number(e.target.value);
                dispatch(setSelectedModelId(newModelId));
                if (prompt.trim()) {
                  dispatch(
                    fetchProbabilityDistribution({
                      prompt,
                      topK,
                      model_id: newModelId,
                    })
                  );
                }
              }}
              disabled={modelsLoading || loading}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
            >
              {models.map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  Model #{m.model_id} — {m.model_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 300px' }}>
            <button
              type="button"
              onClick={() => handlePredict()}
              disabled={loading || !prompt.trim()}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <span className="pulse-dot online" style={{ width: '8px', height: '8px' }} />
                  <span>Calculating Probabilities...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Predict Next Token (POST /api/predict-next-token)</span>
                </>
              )}
            </button>

            {predictions.length > 0 && (
              <button
                type="button"
                onClick={handleStepForward}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1rem' }}
                title="Automatically append top predicted token (#1) and calculate next"
              >
                <Play size={15} />
                <span>Auto-Step (#1)</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {historyTrail.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={loading}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                title="Undo last added token"
              >
                <Undo2 size={14} />
                <span>Undo</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyPrompt}
              disabled={!prompt}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
              title="Copy current prompt text"
            >
              {copiedPrompt ? <Check size={14} color="var(--accent-success)" /> : <Copy size={14} />}
              <span>{copiedPrompt ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
              title="Clear prompt and results"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Trail of Tokens Added */}
        {historyTrail.length > 0 && (
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginRight: '0.3rem',
              }}
            >
              Tokens Added:
            </span>
            {historyTrail.map((item, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span>+{JSON.stringify(item.token)}</span>
                {idx < historyTrail.length - 1 && (
                  <ChevronRight size={12} color="var(--text-muted)" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Probability Distribution Section                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title">
              <BarChart2 size={18} color="var(--accent-success)" />
              <span>Next Token Predictions & Probability Distribution</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Candidate next tokens sorted by probability descending. Click <strong>[Add]</strong> to
              append a token and predict the next.
            </p>
          </div>

          {latency && (
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              Computed in {latency}ms ({activeModel.model_name})
            </span>
          )}
        </div>

        {/* Error message display */}
        {error && (
          <div
            style={{
              background: 'var(--accent-danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              color: 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {/* Loading state indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-success)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Evaluating Token Probabilities...
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Calculating softmax probabilities over vocabulary for &quot;{prompt}&quot;
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && predictions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Sparkles size={36} color="var(--border-color)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              No Predictions Yet
            </h4>
            <p style={{ fontSize: '0.85rem', maxWidth: '350px', margin: '0 auto' }}>
              Enter a prompt above and click &quot;Predict Next Token&quot; to see the model&apos;s
              predicted probability distribution.
            </p>
          </div>
        )}

        {/* Predictions Table / List */}
        {!loading && predictions.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
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
                  <th style={{ padding: '0.75rem 1rem', width: '70px' }}>Rank</th>
                  <th style={{ padding: '0.75rem 1rem', width: '220px' }}>Word / Token</th>
                  <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Probability</th>
                  <th style={{ padding: '0.75rem 1rem', width: '100px' }}>Percentage</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Visual Distribution Bar</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '110px' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((item, index) => {
                  const rank = index + 1;
                  const prob = Number(item.probability) || 0;
                  const percentage = (prob * 100).toFixed(2);
                  const startsWithSpace = /^\s/.test(item.token);
                  const isSuffix = /^(ing|ed|s|es|ly|er|est|tion|ment|ful|ness|able|ible|y)\b/i.test(item.token);

                  // Rank color class for visual distinction
                  const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

                  return (
                    <tr
                      key={`${item.token}-${index}`}
                      style={{
                        borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                        transition: 'background-color 0.15s ease',
                        background: rank === 1 ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          rank === 1 ? 'rgba(16, 185, 129, 0.04)' : 'transparent';
                      }}
                    >
                      {/* Rank Column */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color:
                              rank === 1
                                ? 'var(--accent-success)'
                                : rank === 2
                                ? 'var(--accent-primary)'
                                : rank === 3
                                ? 'var(--accent-info)'
                                : 'var(--text-muted)',
                          }}
                        >
                          #{rank}
                        </span>
                      </td>

                      {/* Token / Word Column */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="token-pill">
                            {startsWithSpace && (
                              <span className="token-space-marker" title="Leading space (BPE word boundary)">
                                ␣
                              </span>
                            )}
                            <span>{item.token.trim()}</span>
                          </span>

                          {isSuffix && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: '#f59e0b',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}
                            >
                              suffix
                            </span>
                          )}

                          {rank === 1 && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: '#10b981',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                fontWeight: 700,
                              }}
                            >
                              Top Choice
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Raw Probability Float */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {prob.toFixed(4)}
                      </td>

                      {/* Probability Percentage */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <strong
                          style={{
                            color: rank === 1 ? 'var(--accent-success)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {percentage}%
                        </strong>
                      </td>

                      {/* Visual Probability Distribution Bar */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div className="prob-bar-container">
                          <div
                            className={`prob-bar-fill ${rankClass}`}
                            style={{
                              width: `${Math.max(2, Math.min(100, prob * 100))}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Action Button: [ Add ] */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleAddToken(item.token)}
                          disabled={loading}
                          className="btn btn-primary"
                          style={{
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.8rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          title={`Append "${item.token}" to prompt and recalculate`}
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProbabilityDistributionTab;
