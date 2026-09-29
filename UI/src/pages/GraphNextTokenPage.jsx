import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Plus,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Cpu,
  Info,
  Layers,
  Share2,
} from 'lucide-react';
import { setActiveTab, appendTokenToPrompt, fetchModels } from '../features/nextToken/nextTokenSlice';
import nextTokenApi from '../api/nextTokenApi';
import CosmicStarfield from '../features/nextToken/CosmicStarfield';
import WhiteSun from '../features/nextToken/WhiteSun';
import TokenGraphWire from '../features/nextToken/TokenGraphWire';
import '../styles/graphNextToken.css';

const PROMPT_SUGGESTIONS = [
  'The universe is expanding into',
  'Deep space exploration reveals',
  'Artificial intelligence will evolve to',
  'Quantum computers will soon solve',
  'Across the cosmos, distant stars',
];

/**
 * Play harmonic cosmic synthesizer chime
 */
const playCosmicChime = (freq = 520, duration = 0.3, isMuted = false) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Autoplay policy or audio context disabled
  }
};

const GraphNextTokenPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { models, selectedModelId } = useSelector((state) => state.nextToken);

  // Form & Interaction state
  const [prompt, setPrompt] = useState('The universe is');
  const [modelId, setModelId] = useState(selectedModelId || 1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [addedIndex, setAddedIndex] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Apply suggestion text to input prompt (just adds the text)
  const handleApplySuggestion = (suggestionText) => {
    if (!prompt.trim() || prompt === 'The universe is') {
      setPrompt(suggestionText);
    } else {
      const cleanPrompt = prompt.trimEnd();
      setPrompt(`${cleanPrompt} ${suggestionText}`);
    }
    playCosmicChime(784, 0.2, isAudioMuted);
    showToast(`Added suggestion to prompt`);
  };

  // Predictions state: top 5 next token candidates
  const [predictions, setPredictions] = useState([
    { token: ' expanding', probability: 0.3124 },
    { token: ' vast', probability: 0.2748 },
    { token: ' infinite', probability: 0.1935 },
    { token: ' a', probability: 0.1127 },
    { token: ' not', probability: 0.1066 },
  ]);

  // Loading & Animation states
  const [loading, setLoading] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [revealedCount, setRevealedCount] = useState(5); // 0 to 5 revealed tokens
  const [error, setError] = useState(null);

  // Timeouts tracking for staggered animations
  const timeoutsRef = useRef([]);

  const clearStaggerTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearStaggerTimeouts();
  }, []);

  // DOM node references for pixel-perfect dynamic wire connections
  const stageRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const targetNodeRef0 = useRef(null);
  const targetNodeRef1 = useRef(null);
  const targetNodeRef2 = useRef(null);
  const targetNodeRef3 = useRef(null);
  const targetNodeRef4 = useRef(null);

  const targetRefs = [
    targetNodeRef0,
    targetNodeRef1,
    targetNodeRef2,
    targetNodeRef3,
    targetNodeRef4,
  ];

  // Generate Button mouse-following border light tracking
  const generateBtnRef = useRef(null);
  const [btnHovered, setBtnHovered] = useState(false);

  // Generate Button mouse-following border light & directional shadow tracking
  const handleBtnMouseMove = (e) => {
    if (!generateBtnRef.current) return;
    const rect = generateBtnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = ((x / rect.width) - 0.5) * 22;
    const dy = ((y / rect.height) - 0.5) * 14;
    generateBtnRef.current.style.setProperty('--mouse-x', `${x}px`);
    generateBtnRef.current.style.setProperty('--mouse-y', `${y}px`);
    generateBtnRef.current.style.setProperty('--shadow-dx', `${dx}px`);
    generateBtnRef.current.style.setProperty('--shadow-dy', `${dy}px`);
  };

  // Textarea caret-tracking border shadow state & handlers
  const textareaRef = useRef(null);
  const textareaWrapperRef = useRef(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [textareaHovered, setTextareaHovered] = useState(false);

  // Calculates exact pixel coordinate of text typing caret inside textarea
  const updateCaretPosition = () => {
    const textarea = textareaRef.current;
    const wrapper = textareaWrapperRef.current;
    if (!textarea || !wrapper) return;

    const caretPos = textarea.selectionEnd ?? textarea.value.length;

    let mirror = document.getElementById('cosmic-textarea-mirror');
    if (!mirror) {
      mirror = document.createElement('div');
      mirror.id = 'cosmic-textarea-mirror';
      mirror.style.position = 'fixed';
      mirror.style.top = '-9999px';
      mirror.style.left = '-9999px';
      mirror.style.visibility = 'hidden';
      mirror.style.pointerEvents = 'none';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.wordWrap = 'break-word';
      mirror.style.overflowWrap = 'break-word';
      document.body.appendChild(mirror);
    }

    const computed = window.getComputedStyle(textarea);
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.fontWeight = computed.fontWeight;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.padding = computed.padding;
    mirror.style.border = computed.border;
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.width = `${textarea.clientWidth}px`;

    const textBeforeCaret = textarea.value.substring(0, caretPos);
    mirror.textContent = textBeforeCaret;

    const marker = document.createElement('span');
    marker.textContent = '|';
    mirror.appendChild(marker);

    const caretX = Math.max(14, Math.min(textarea.clientWidth - 14, marker.offsetLeft - textarea.scrollLeft));
    const caretY = Math.max(14, Math.min(textarea.clientHeight - 14, marker.offsetTop - textarea.scrollTop));

    wrapper.style.setProperty('--caret-x', `${caretX}px`);
    wrapper.style.setProperty('--caret-y', `${caretY}px`);

    // Border shadow moves towards where user is typing
    const dx = ((caretX / textarea.clientWidth) - 0.5) * 18;
    const dy = ((caretY / textarea.clientHeight) - 0.5) * 14;
    wrapper.style.setProperty('--caret-shadow-dx', `${dx}px`);
    wrapper.style.setProperty('--caret-shadow-dy', `${dy}px`);
  };

  const handleTextareaMouseMove = (e) => {
    if (!textareaWrapperRef.current) return;
    const rect = textareaWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    textareaWrapperRef.current.style.setProperty('--mouse-x', `${x}px`);
    textareaWrapperRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // Sync caret position when prompt changes externally (e.g. suggestions / token addition)
  useEffect(() => {
    updateCaretPosition();
  }, [prompt]);

  // Set browser website title & lock body scrollbars for full-screen cosmic view
  useEffect(() => {
    document.title = 'Graph The Next Token';
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch models if not already in store
  useEffect(() => {
    if (!models || models.length === 0) {
      dispatch(fetchModels());
    }
  }, [dispatch, models]);

  // Active model config
  const activeModel =
    models.find((m) => m.model_id === Number(modelId)) ||
    models[0] || { model_id: 1, model_name: 'gpt-4o' };

  // Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  /**
   * Main Generation Handler
   * 1. Clear text and numbers in next token boxes
   * 2. Calls OpenAI API for top 5 probabilities
   * 3. Top-to-bottom loading: loads first box, after 0.2s loads second, etc.
   */
  const handleGenerate = async (targetPrompt) => {
    const textToPredict = targetPrompt !== undefined ? targetPrompt : prompt;
    if (!textToPredict.trim() || loading) return;

    // 1. Immediately clear the text and numbers in the next token boxes
    setIsCleared(true);
    setRevealedCount(0);
    setLoading(true);
    setError(null);

    try {
      // 2. Call backend OpenAI API
      const result = await nextTokenApi.predictProbabilityDistribution({
        prompt: textToPredict.trim(),
        topK: 5,
        model_id: activeModel.model_id,
      });

      const nextPredictions = (result.data?.predictions || []).slice(0, 5);

      if (nextPredictions.length === 0) {
        throw new Error('No candidate tokens received from language model');
      }

      setPredictions(nextPredictions);
      setLoading(false);

      // 3. Staggered Top-to-Bottom Loading:
      // Option 1 loads immediately, option 2 after 0.2s, option 3 after 0.4s, etc.
      const chimes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C5, D5, E5, F5, G5

      clearStaggerTimeouts();
      setIsCleared(false);

      // Load box 1 immediately
      setRevealedCount(1);
      playCosmicChime(chimes[0], 0.25, isAudioMuted);

      // Load box 2 (+0.2s)
      const t1 = setTimeout(() => {
        setRevealedCount(2);
        playCosmicChime(chimes[1], 0.25, isAudioMuted);
      }, 200);

      // Load box 3 (+0.4s)
      const t2 = setTimeout(() => {
        setRevealedCount(3);
        playCosmicChime(chimes[2], 0.25, isAudioMuted);
      }, 400);

      // Load box 4 (+0.6s)
      const t3 = setTimeout(() => {
        setRevealedCount(4);
        playCosmicChime(chimes[3], 0.25, isAudioMuted);
      }, 600);

      // Load box 5 (+0.8s)
      const t4 = setTimeout(() => {
        setRevealedCount(5);
        playCosmicChime(chimes[4], 0.35, isAudioMuted);
      }, 800);

      timeoutsRef.current = [t1, t2, t3, t4];
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to predict next tokens');
      // If error occurs, restore existing predictions
      setIsCleared(false);
      setRevealedCount(5);
    }
  };

  /**
   * Handle Click on Add Button ("+")
   * Appends the selected token to the input text area and predicts next token autoregressively
   */
  const handleAddToken = (token, index) => {
    if (!token || loading) return;

    const newPrompt = appendTokenToPrompt(prompt, token);
    setPrompt(newPrompt);
    setAddedIndex(index);
    playCosmicChime(880, 0.2, isAudioMuted);
    showToast(`Added "${token}" to prompt text`);

    // Autoregressively fetch next token probabilities for the updated prompt
    handleGenerate(newPrompt);

    setTimeout(() => {
      setAddedIndex(null);
    }, 1000);
  };

  /**
   * Top-left Back button handler
   * Redirects user back to Probability Distribution page
   */
  const handleBack = () => {
    dispatch(setActiveTab('distribution'));
    navigate('/next_token');
  };

  return (
    <div className="cosmic-page-root">
      {/* 1. Full-screen HTML5 Starfield (Facing realistic starry night sky) */}
      <CosmicStarfield />

      {/* 2. White Sun in Top-Left Cosmic Sky */}
      <WhiteSun />

      {/* ------------------------------------------------------------------ */}
      {/* Top Bar: Back Button (Left), Website Title (Center), Controls (Right) */}
      {/* ------------------------------------------------------------------ */}
      <header className="cosmic-top-bar">
        {/* Top-left Corner Button to redirect to Probability Distribution page */}
        <div className="cosmic-top-left">
          <button
            onClick={handleBack}
            className="cosmic-back-btn"
            title="Return to Probability Distribution Explorer"
          >
            <ArrowLeft size={16} />
            <span>Back to Probability Distribution</span>
          </button>
        </div>

        {/* Website Title (Amarante Font) */}
        <div className="cosmic-top-center">
          <h1 className="cosmic-website-title">Graph The Next Token</h1>
          <span className="cosmic-website-subtitle">Autoregressive Language Model Explorer</span>
        </div>

        {/* Right Cosmic Status Indicators & Model Switcher */}
        <div className="cosmic-top-actions">
          {/* Model Switcher Pill */}
          <div className="cosmic-model-pill">
            <Cpu size={14} color="#a855f7" />
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="cosmic-model-select"
            >
              {models && models.length > 0 ? (
                models.map((m) => (
                  <option
                    key={m.model_id}
                    value={m.model_id}
                    style={{ background: '#0f172a', color: '#fff' }}
                  >
                    {m.model_name}
                  </option>
                ))
              ) : (
                <option value="1" style={{ background: '#0f172a', color: '#fff' }}>
                  gpt-4o
                </option>
              )}
            </select>
          </div>

          {/* Audio Chime Mute Toggle */}
          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="cosmic-icon-btn"
            title={isAudioMuted ? 'Unmute cosmic chimes' : 'Mute cosmic chimes'}
          >
            {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main Interactive Stage: Prompt Card, Wires, and 5 Token Boxes       */}
      {/* ------------------------------------------------------------------ */}
      <main className="cosmic-stage" ref={stageRef}>
        {/* SVG Dynamic Wires linking the prompt box to the 5 token boxes */}
        <TokenGraphWire
          stageRef={stageRef}
          sourceRef={sourceNodeRef}
          targetRefs={targetRefs}
          isLoading={loading}
          activeIndices={Array.from({ length: revealedCount }, (_, i) => i)}
        />

        {/* ---------------------------------------------------------------- */}
        {/* ---------------------------------------------------------------- */}
        {/* Left Column: Input Prompt Card (Center of screen in left side)   */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="cosmic-input-card-wrapper"
          onMouseEnter={() => setShowSuggestions(true)}
          onMouseLeave={() => setShowSuggestions(false)}
        >
          {/* Individual Floating Suggestion Boxes in Space Above Prompt Box (Just text, no titles/icons) */}
          <div
            className={`cosmic-floating-space-container ${
              showSuggestions ? 'visible' : ''
            }`}
          >
            <div className="cosmic-floating-boxes-cloud">
              {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`cosmic-suggestion-chip cosmic-float-${idx % 3}`}
                  onClick={() => handleApplySuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="cosmic-input-card">
            {/* Wire Origin Connector Pin */}
            <div className="terminal-node source" ref={sourceNodeRef} title="Token Branch Output" />

            {/* Card Header */}
            <div className="cosmic-card-header">
              <div className="cosmic-card-title-group">
                <Zap size={15} color="#38bdf8" />
                <h2 className="cosmic-card-title">Prompt Text</h2>
              </div>
            </div>

            {/* Text Area to Enter Prompt with Caret-Tracking Border Light & Shadow */}
            <div
              ref={textareaWrapperRef}
              className={`cosmic-textarea-wrapper ${isTextareaFocused ? 'focused' : ''} ${textareaHovered ? 'hovered' : ''}`}
              onMouseMove={handleTextareaMouseMove}
              onMouseEnter={(e) => {
                setTextareaHovered(true);
                handleTextareaMouseMove(e);
              }}
              onMouseLeave={() => setTextareaHovered(false)}
            >
              {/* Caret-Following Border Shadow & Aura */}
              <span className="cosmic-textarea-aura" aria-hidden="true" />

              <div className="cosmic-textarea-inner">
                <textarea
                  ref={textareaRef}
                  className="cosmic-textarea"
                  placeholder="Enter prompt text here..."
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setTimeout(updateCaretPosition, 0);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerate();
                      return;
                    }
                    setTimeout(updateCaretPosition, 0);
                  }}
                  onKeyUp={updateCaretPosition}
                  onClick={updateCaretPosition}
                  onSelect={updateCaretPosition}
                  onFocus={() => {
                    setIsTextareaFocused(true);
                    setTimeout(updateCaretPosition, 10);
                  }}
                  onBlur={() => setIsTextareaFocused(false)}
                  rows={3}
                />
                <div className="cosmic-textarea-footer">
                  <span>{prompt.length} chars</span>
                </div>
              </div>
            </div>

            {/* Error Message if API fails */}
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.75rem',
                  color: '#fca5a5',
                }}
              >
                {error}
              </div>
            )}

            {/* Generate Next Token Button with Mouse-Tracking Border Light */}
            <button
              ref={generateBtnRef}
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className={`cosmic-generate-btn ${btnHovered ? 'hovered' : ''}`}
              onMouseMove={handleBtnMouseMove}
              onMouseEnter={(e) => {
                setBtnHovered(true);
                handleBtnMouseMove(e);
              }}
              onMouseLeave={() => setBtnHovered(false)}
            >
              {/* Backlight Aura that follows mouse in space */}
              <span className="cosmic-btn-aura" aria-hidden="true" />
              {/* Inner Pill Body */}
              <span className="cosmic-btn-inner">
                {loading ? (
                  <>
                    <Sparkles size={14} className="animate-spin" />
                    <span>SIMULATING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>GENERATE NEXT TOKEN</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right Column: 5 Next Token Boxes with Probabilities & Add Button */}
        {/* ---------------------------------------------------------------- */}
        <div className="cosmic-tokens-column">
          {predictions.map((pred, index) => {
            const isRevealed = !isCleared && index < revealedCount;
            const percentage = (pred.probability * 100).toFixed(1);
            const startsWithSpace = /^\s/.test(pred.token);

            return (
              <div
                key={`token-box-${index}`}
                className={`cosmic-token-card ${
                  isRevealed ? 'token-stagger-active' : 'token-stagger-enter'
                }`}
              >
                {/* Wire Destination Connector Pin */}
                <div
                  className="terminal-node target"
                  ref={targetRefs[index]}
                  title={`Connection Node #${index + 1}`}
                />

                {/* Left Side: Meta & Token Value */}
                <div className="cosmic-token-main">
                  {/* Metadata Row: Probability Display (without #1, #2, #3) */}
                  <div className="cosmic-token-meta-row">
                    <span style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      Probability
                    </span>

                    {/* Probability Number (cleared when generating, revealed top-to-bottom) */}
                    <div className="cosmic-prob-number">
                      {isRevealed ? (
                        <>
                          <span className="cosmic-prob-percent">{percentage}%</span>
                          <span style={{ color: '#64748b', marginLeft: '5px', fontSize: '0.72rem' }}>
                            ({pred.probability.toFixed(4)})
                          </span>
                        </>
                      ) : (
                        <div
                          style={{
                            width: '75px',
                            height: '12px',
                            borderRadius: '4px',
                            background: 'rgba(51, 65, 85, 0.4)',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Probability Bar Meter */}
                  <div className="cosmic-prob-track">
                    <div
                      className="cosmic-prob-bar"
                      style={{
                        width: isRevealed ? `${Math.max(5, Math.min(100, pred.probability * 100))}%` : '0%',
                      }}
                    />
                  </div>

                  {/* Token Text Display (cleared when generating, revealed top-to-bottom) */}
                  <div className="cosmic-token-text">
                    {isRevealed ? (
                      <>
                        {startsWithSpace && (
                          <span className="space-indicator" title="Preceded by a space character">
                            ␣
                          </span>
                        )}
                        <span>{pred.token}</span>
                      </>
                    ) : (
                      <div className="cosmic-skeleton-slot" style={{ width: '130px' }} />
                    )}
                  </div>
                </div>

                {/* Right Side: Add Button ("+") */}
                <button
                  type="button"
                  onClick={() => handleAddToken(pred.token, index)}
                  disabled={!isRevealed || loading}
                  className={`cosmic-add-btn ${addedIndex === index ? 'added-success' : ''}`}
                  title={`Append "${pred.token}" to prompt text`}
                >
                  {addedIndex === index ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="cosmic-toast">
          <Check size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default GraphNextTokenPage;
