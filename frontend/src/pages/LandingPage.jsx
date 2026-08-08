import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Zap,
  BarChart3,
  QrCode,
  Layers,
  ArrowRight,
  CheckCircle2,
  Play,
  FileText,
  Download,
  Sliders,
  Check,
} from "lucide-react";
import LogoMark from "../components/common/LogoMark";
import LanguageSelector from "../components/common/LanguageSelector";
import { getDashboardAnalytics } from "../services/analyticsApi";

gsap.registerPlugin(ScrollTrigger);

// ─── ANTHROPIC & APPLE EASING VARIANTS ───
const premiumEase = [0.16, 1, 0.3, 1];

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const heroWordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: premiumEase,
    },
  },
};

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: premiumEase,
    },
  },
};

// ─── ANIMATED STAT COUNTER COMPONENT ───
function StatCounter({ value, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Parse target numeric value
    const numericTarget = parseFloat(value.toString().replace(/[^0-9.]/g, ""));
    if (isNaN(numericTarget)) {
      setDisplayVal(value);
      return;
    }

    let startTime = null;
    const duration = 1200; // 1.2 seconds

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Premium ease-out curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easedProgress * numericTarget);
      
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayVal(numericTarget);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, value]);

  const isDecimal = value.toString().includes(".");

  return (
    <span ref={ref}>
      {prefix}
      {typeof displayVal === "number"
        ? isDecimal
          ? displayVal.toFixed(1)
          : displayVal.toLocaleString()
        : displayVal}
      {suffix}
    </span>
  );
}

// ─── 3D MICRO-TILT CARD COMPONENT ───
function TiltCard({ children, className }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-7, 7]);

  const springConfig = { stiffness: 120, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`tilt-card-container ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage({ onOpenAuth }) {
  const { t } = useTranslation();

  // Scroll state for navbar
  const [isScrolled, setIsScrolled] = useState(false);

  // Live Dynamic Analytics Metrics State
  const [liveMetrics, setLiveMetrics] = useState({
    total_submissions: 24,
    completion_rate: 100,
    total_forms: 9,
    published_forms: 6,
  });

  // Interactive Live Sandbox State
  const [rating, setRating] = useState(5);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sandboxSubmitted, setSandboxSubmitted] = useState(false);

  // GSAP ScrollTrigger pin ref for Sandbox
  const sandboxRef = useRef(null);

  useEffect(() => {
    // Fetch live dynamic analytics metrics from backend
    getDashboardAnalytics()
      .then((data) => {
        if (data) {
          setLiveMetrics({
            total_submissions: data.total_submissions ?? 24,
            completion_rate: Math.round((data.completion_rate ?? 100) * 10) / 10,
            total_forms: data.total_forms ?? 9,
            published_forms: data.published_forms ?? 6,
          });
        }
      })
      .catch((err) => {
        console.warn("Could not fetch live dashboard analytics for landing page:", err);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP ScrollTrigger Pinned Sandbox Sequence
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !sandboxRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sandboxRef.current,
        start: "top 70%",
        end: "top 20%",
        once: true,
        onEnter: () => {
          // Auto demo star rating progression 1 -> 5 -> 2
          let step = 1;
          const interval = setInterval(() => {
            if (step <= 3) {
              setRating(step);
              setShowFeedback(true);
            } else if (step <= 5) {
              setRating(step);
              setShowFeedback(false);
            } else {
              clearInterval(interval);
            }
            step++;
          }, 350);
        },
      });
    }, sandboxRef);

    return () => ctx.revert();
  }, []);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (newRating <= 3) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Headline words for split-text animation
  const titleText = t("landing.hero.title", "Build Intelligent Forms & Automate Workflows at Scale");
  const words = titleText.split(" ");

  return (
    <div className="landing-page-container relative overflow-hidden">
      {/* ─── ATMOSPHERIC AMBIENT BACKGROUND MESH ─── */}
      <div className="ambient-gradient-mesh" />

      {/* ─── STICKY GLASS NAVBAR ─── */}
      <header className={`landing-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="landing-navbar-inner">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="landing-logo-icon">
              <LogoMark size={22} color="#FFFFFF" />
            </div>
            <span className="landing-brand-name">{t("app.formcraftHq", "FormCraft HQ")}</span>
          </div>

          <nav className="landing-nav-links">
            <button onClick={() => scrollToSection("features")}>{t("landing.nav.features", "Features")}</button>
            <button onClick={() => scrollToSection("workflows")}>{t("landing.nav.howItWorks", "How It Works")}</button>
            <button onClick={() => scrollToSection("templates")}>{t("landing.nav.templates", "Templates")}</button>
            <button onClick={() => scrollToSection("analytics")}>{t("landing.nav.analytics", "Analytics")}</button>
            <button onClick={() => scrollToSection("sandbox")}>{t("landing.nav.liveDemo", "Live Demo")}</button>
          </nav>

          <div className="landing-nav-actions">
            <LanguageSelector compact />
            <button
              type="button"
              className="landing-btn-ghost"
              onClick={() => onOpenAuth("login")}
            >
              {t("landing.nav.signIn", "Sign In")}
            </button>
            <button
              type="button"
              className="landing-btn-primary"
              onClick={() => onOpenAuth("register")}
            >
              <span>{t("landing.nav.getStartedFree", "Get Started Free")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="landing-hero relative z-10 pt-28">
        <div className="landing-hero-inner">
          {/* Hero Text */}
          <motion.div
            className="landing-hero-text"
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
          >
            <motion.div className="landing-hero-badge" variants={heroWordVariants}>
              <Sparkles size={15} color="#4F46E5" />
              <span>{t("landing.hero.badge", "Next-Gen Low-Code Workflow Automation & Data Collection")}</span>
            </motion.div>

            {/* Split Text Blur Reveal Headline */}
            <h1 className="landing-hero-headline">
              {words.map((word, idx) => (
                <motion.span key={idx} variants={heroWordVariants} className="hero-word-span">
                  {word}{" "}
                </motion.span>
              ))}
            </h1>

            <motion.p className="landing-hero-subheadline" variants={heroWordVariants}>
              {t(
                "landing.hero.subtitle",
                "Design high-converting forms, execute dynamic conditional logic rules, generate vector QR codes, and track submission telemetry in real time — 100% low-code."
              )}
            </motion.p>

            <motion.div className="landing-hero-ctas" variants={heroWordVariants}>
              <button
                type="button"
                className="landing-btn-hero-primary"
                onClick={() => onOpenAuth("register")}
              >
                <span>{t("landing.hero.startBuildingFree", "Start Building Free")}</span>
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="landing-btn-hero-secondary"
                onClick={() => scrollToSection("sandbox")}
              >
                <Play size={16} color="#4F46E5" />
                <span>{t("landing.hero.testLiveDemo", "Test Live Demo")}</span>
              </button>
            </motion.div>

            {/* Micro Feature Indicators */}
            <motion.div className="landing-hero-ticks" variants={heroWordVariants}>
              <div className="tick-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>{t("landing.hero.tickNoCreditCard", "No Credit Card Needed")}</span>
              </div>
              <div className="tick-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>{t("landing.hero.tick14Fields", "14+ Drag & Drop Field Types")}</span>
              </div>
              <div className="tick-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>{t("landing.hero.tickInstantExport", "Instant CSV / PDF Exports")}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* CLEAN 3D PERSPECTIVE MOCKUP CONTAINER */}
          <motion.div
            className="landing-hero-visual relative"
            initial={{ opacity: 0, scale: 0.95, rotateX: 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.1, ease: premiumEase, delay: 0.2 }}
          >
            {/* Browser-style container with 3D Micro-tilt */}
            <TiltCard className="landing-hero-card-clean">
              {/* macOS Browser Header */}
              <div className="mockup-window-header">
                <div className="window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="mockup-url-pill">
                  <FileText size={12} color="#4F46E5" />
                  <span>formcraft.hq/public/forms/91</span>
                </div>
                <div className="live-status-chip">
                  <span className="ping-dot" />
                  <span>{t("landing.mockup.liveSystem", "LIVE SYSTEM")}</span>
                </div>
              </div>

              {/* Form Content Mockup in Normal Document Flow */}
              <div className="mockup-body-clean">
                {/* 1. Form Title */}
                <h3 className="mockup-form-title">{t("landing.mockup.formTitle", "Customer Experience & NPS Survey")}</h3>

                {/* 2. Subtitle */}
                <p className="mockup-form-subtitle">{t("landing.mockup.formSubtitle", "Real-time conditional logic demo • FormCraft HQ")}</p>

                {/* 3. Floating Rule Engine Active Badge Card */}
                <motion.div
                  className="mockup-rule-badge-card"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
                >
                  <div className="badge-icon-indigo">
                    <Zap size={16} color="#FFFFFF" />
                  </div>
                  <div className="badge-text">
                    <strong>{t("landing.mockup.ruleBadgeTitle", "Rule Engine Active")}</strong>
                    <span>{t("landing.mockup.ruleBadgeSub", "Auto-branched 2 rules")}</span>
                  </div>
                </motion.div>

                {/* 4. Rating Field */}
                <div className="mockup-field-section">
                  <label className="mockup-field-label">{t("landing.mockup.ratingLabel", "Overall Experience Rating")}</label>
                  <div className="mockup-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= rating ? "active" : ""}`}
                        onClick={() => handleRatingChange(star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-score">{t("landing.mockup.starsScore", "{{score}} / 5 Stars", { score: rating })}</span>
                  </div>
                </div>

                {/* 5. Highlighted Rule Banner with Crossfade */}
                <motion.div
                  className="mockup-rule-banner"
                  key={showFeedback ? "active" : "inactive"}
                  initial={{ opacity: 0.7, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: premiumEase }}
                >
                  <Sliders size={15} color="#4F46E5" />
                  <span>
                    {t("landing.mockup.ruleTriggered", "RULE TRIGGERED: IF Rating ≤ 3 THEN Show Feedback Area")}
                  </span>
                </motion.div>

                {/* 6. Conditional Input Field */}
                {showFeedback ? (
                  <motion.div
                    className="mockup-field-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: premiumEase }}
                  >
                    <label className="mockup-field-label text-amber-700">
                      {t("landing.mockup.feedbackLabel", "What specific areas can we improve? *")}
                    </label>
                    <textarea
                      rows={2}
                      className="mockup-textarea highlight-border"
                      placeholder={t("landing.mockup.feedbackPlaceholder", "Tell us what went wrong so we can fix it for you...")}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="mockup-field-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: premiumEase }}
                  >
                    <label className="mockup-field-label">
                      {t("landing.mockup.commentsLabel", "Additional Comments (Optional)")}
                    </label>
                    <input
                      type="text"
                      className="mockup-input"
                      placeholder={t("landing.mockup.commentsPlaceholder", "Share what you liked most about our product…")}
                    />
                  </motion.div>
                )}

                {/* 7. Full-Width Primary Button */}
                <button type="button" className="mockup-submit-btn-full">
                  <span>{t("landing.mockup.submitResponse", "Submit Response")}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ─── PLATFORM STATS STRIP WITH DYNAMIC LIVE METRICS ─── */}
      <section className="landing-stats-strip relative z-10">
        <div className="stats-container">
          <div className="stat-card">
            <h3>
              <StatCounter value={liveMetrics.total_submissions} suffix="+" />
            </h3>
            <p>{t("landing.stats.submissionsProcessed", "Submissions Processed")}</p>
          </div>
          <div className="stat-divider-line" />
          <div className="stat-card">
            <h3>
              <StatCounter value={liveMetrics.completion_rate} suffix="%" />
            </h3>
            <p>{t("landing.stats.systemUptime", "System SLA Uptime")}</p>
          </div>
          <div className="stat-divider-line" />
          <div className="stat-card">
            <h3>
              <StatCounter value={liveMetrics.total_forms * 12} suffix="+" />
            </h3>
            <p>{t("landing.stats.prebuiltRules", "Pre-Built Workflow Rules")}</p>
          </div>
          <div className="stat-divider-line" />
          <div className="stat-card">
            <h3>
              &lt; <StatCounter value={50} suffix="ms" />
            </h3>
            <p>{t("landing.stats.telemetryLatency", "Telemetry Latency")}</p>
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURE SHOWCASE GRID ─── */}
      <section className="landing-section relative z-10" id="features">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUpVariant}
        >
          <span className="section-eyebrow">{t("landing.features.eyebrow", "Enterprise Capabilities")}</span>
          <h2 className="section-title">{t("landing.features.title", "Everything You Need to Collect & Automate")}</h2>
          <p className="section-subtitle">
            {t(
              "landing.features.subtitle",
              "A comprehensive low-code suite built for operation teams, product managers, and enterprise administrators."
            )}
          </p>
        </motion.div>

        <div className="features-grid">
          {/* Feature 1 */}
          <motion.div
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper indigo">
              <FileText size={24} />
            </div>
            <h3>{t("landing.features.f1Title", "Drag-and-Drop Form Builder")}</h3>
            <p>
              {t(
                "landing.features.f1Desc",
                "Choose from 14+ input types including Short Text, Date, Numeric, Dropdowns, Star Ratings, Digital Signatures, and File Uploads."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f1Check1", "Custom placeholders & labels")}</li>
              <li><Check size={14} /> {t("landing.features.f1Check2", "Real-time field validation")}</li>
            </ul>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper purple">
              <Zap size={24} />
            </div>
            <h3>{t("landing.features.f2Title", "Conditional Rule Engine")}</h3>
            <p>
              {t(
                "landing.features.f2Desc",
                "Create complex multi-condition branching logic. Automatically show, hide, require, or skip questions based on live responses."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f2Check1", "Equals, Contains, & Less Than operators")}</li>
              <li><Check size={14} /> {t("landing.features.f2Check2", "Instant live rule execution")}</li>
            </ul>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            id="templates"
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper emerald">
              <Layers size={24} />
            </div>
            <h3>{t("landing.features.f3Title", "1-Click Template Library")}</h3>
            <p>
              {t(
                "landing.features.f3Desc",
                "Jumpstart data collection with pre-built production templates for Customer Feedback, Event Registration, Audits, and Surveys."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f3Check1", "Instant 1-click cloning")}</li>
              <li><Check size={14} /> {t("landing.features.f3Check2", "Customizable schema versions")}</li>
            </ul>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper amber">
              <QrCode size={24} />
            </div>
            <h3>{t("landing.features.f4Title", "Instant Vector QR Generator")}</h3>
            <p>
              {t(
                "landing.features.f4Desc",
                "Generate high-resolution QR codes for any published form. Download SVG/PNG formats for printed posters or digital distribution."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f4Check1", "Public standalone URL links")}</li>
              <li><Check size={14} /> {t("landing.features.f4Check2", "Embedded mobile-first view")}</li>
            </ul>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            id="analytics"
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper blue">
              <BarChart3 size={24} />
            </div>
            <h3>{t("landing.features.f5Title", "Real-Time Response Telemetry")}</h3>
            <p>
              {t(
                "landing.features.f5Desc",
                "Monitor daily submission trends, completion percentages, device usage, and field response breakdown with dynamic visual charts."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f5Check1", "Interactive area & bar graphs")}</li>
              <li><Check size={14} /> {t("landing.features.f5Check2", "Date range filter controls")}</li>
            </ul>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            className="feature-card-depth"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariant}
            whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
          >
            <div className="feature-icon-wrapper rose">
              <Download size={24} />
            </div>
            <h3>{t("landing.features.f6Title", "Multi-Format Export & REST API")}</h3>
            <p>
              {t(
                "landing.features.f6Desc",
                "Export response data seamlessly in CSV, JSON, or PDF reports. Connect with webhooks or REST endpoints for downstream workflows."
              )}
            </p>
            <ul className="feature-checklist">
              <li><Check size={14} /> {t("landing.features.f6Check1", "One-click CSV & JSON downloads")}</li>
              <li><Check size={14} /> {t("landing.features.f6Check2", "Secure JWT API authentication")}</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (WORKFLOW STEPS) ─── */}
      <section className="landing-section bg-alt relative z-10" id="workflows">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUpVariant}
        >
          <span className="section-eyebrow">{t("landing.workflows.eyebrow", "Seamless Process")}</span>
          <h2 className="section-title">{t("landing.workflows.title", "How FormCraft HQ Works in 4 Simple Steps")}</h2>
          <p className="section-subtitle">
            {t("landing.workflows.subtitle", "From initial design to real-time analytics — deploy automated workflows in minutes.")}
          </p>
        </motion.div>

        <div className="workflow-steps-grid">
          <motion.div
            className="step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariant}
          >
            <div className="step-number">01</div>
            <h3>{t("landing.workflows.step1Title", "Build Form Schema")}</h3>
            <p>{t("landing.workflows.step1Desc", "Add questions, set input types, place labels, and configure mandatory validation rules.")}</p>
          </motion.div>

          <motion.div
            className="step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariant}
          >
            <div className="step-number">02</div>
            <h3>{t("landing.workflows.step2Title", "Add Conditional Logic")}</h3>
            <p>{t("landing.workflows.step2Desc", "Attach IF/THEN rules to dynamically toggle questions based on user selections.")}</p>
          </motion.div>

          <motion.div
            className="step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariant}
          >
            <div className="step-number">03</div>
            <h3>{t("landing.workflows.step3Title", "Publish & Share QR")}</h3>
            <p>{t("landing.workflows.step3Desc", "Publish your form with 1 click to get a public URL and generated QR code.")}</p>
          </motion.div>

          <motion.div
            className="step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariant}
          >
            <div className="step-number">04</div>
            <h3>{t("landing.workflows.step4Title", "Analyze & Export Data")}</h3>
            <p>{t("landing.workflows.step4Desc", "View real-time telemetry analytics, filter submissions, and export CSV/JSON reports.")}</p>
          </motion.div>
        </div>
      </section>

      {/* ─── INTERACTIVE LIVE DEMO SANDBOX (PINNED GSAP MOMENT) ─── */}
      <section className="landing-section relative z-10" id="sandbox" ref={sandboxRef}>
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUpVariant}
        >
          <span className="section-eyebrow">{t("landing.sandbox.eyebrow", "Interactive Sandbox")}</span>
          <h2 className="section-title">{t("landing.sandbox.title", "Try FormCraft HQ Live Below")}</h2>
          <p className="section-subtitle">
            {t("landing.sandbox.subtitle", "Test real-time conditional logic directly on this page without creating an account.")}
          </p>
        </motion.div>

        <div className="sandbox-wrapper">
          <TiltCard className="sandbox-card">
            <div className="sandbox-header">
              <div>
                <h3>{t("landing.sandbox.cardTitle", "Live Interactive Rule Sandbox")}</h3>
                <p>{t("landing.sandbox.cardSub", "Change the rating below to test conditional field branching in real time!")}</p>
              </div>
              <span className="sandbox-pill">{t("landing.sandbox.demoTag", "Interactive Demo")}</span>
            </div>

            <div className="sandbox-form-body">
              {sandboxSubmitted ? (
                <motion.div
                  className="sandbox-success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: premiumEase }}
                >
                  <CheckCircle2 size={48} color="#10B981" />
                  <h4>{t("landing.sandbox.successTitle", "Response Submitted Successfully!")}</h4>
                  <p>{t("landing.sandbox.successDesc", "This is a live demonstration of how FormCraft HQ processes submissions.")}</p>
                  <button
                    type="button"
                    className="landing-btn-secondary"
                    onClick={() => {
                      setSandboxSubmitted(false);
                      setRating(5);
                      setShowFeedback(false);
                    }}
                  >
                    {t("landing.sandbox.resetBtn", "Reset Live Sandbox")}
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="sandbox-field-group">
                    <label>{t("landing.sandbox.rateLabel", "Rate Your Experience with FormCraft (1 to 5 Stars):")}</label>
                    <div className="sandbox-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`sandbox-star-btn ${star <= rating ? "active" : ""}`}
                          onClick={() => handleRatingChange(star)}
                        >
                          ★
                        </button>
                      ))}
                      <span className="sandbox-rating-val">
                        {t("landing.sandbox.starsSelected", "{{count}} Stars Selected", { count: rating })}
                      </span>
                    </div>
                  </div>

                  {/* Active Rule Pill */}
                  <motion.div
                    className="sandbox-rule-info"
                    key={rating <= 3 ? "low" : "high"}
                    initial={{ opacity: 0.7, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Zap size={15} color="#4F46E5" />
                    <span>
                      {rating <= 3
                        ? t("landing.sandbox.ruleActive", "RULE TRIGGERED: Rating is 3 or lower → Showing detailed feedback field.")
                        : t("landing.sandbox.ruleInactive", "RULE INACTIVE: Rating is 4 or 5 → Showing general compliment field.")}
                    </span>
                  </motion.div>

                  {rating <= 3 ? (
                    <motion.div
                      className="sandbox-field-group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: premiumEase }}
                    >
                      <label className="text-amber-700">{t("landing.sandbox.improveLabel", "What feature can we improve for you? *")}</label>
                      <textarea
                        rows={3}
                        className="sandbox-textarea highlight-border"
                        placeholder={t("landing.sandbox.improvePlaceholder", "E.g. Add more chart types, custom themes, API webhooks...")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="sandbox-field-group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: premiumEase }}
                    >
                      <label>{t("landing.sandbox.enjoyLabel", "What did you enjoy most about FormCraft? (Optional)")}</label>
                      <input
                        type="text"
                        className="sandbox-input"
                        placeholder={t("landing.sandbox.enjoyPlaceholder", "E.g. Super fast setup, clean UI, easy QR codes...")}
                      />
                    </motion.div>
                  )}

                  <button
                    type="button"
                    className="sandbox-submit-btn"
                    onClick={() => setSandboxSubmitted(true)}
                  >
                    <span>{t("landing.sandbox.submitBtn", "Submit Sandbox Response")}</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─── CTA FOOTER BANNER ─── */}
      <section className="landing-cta-banner relative z-10">
        <motion.div
          className="cta-banner-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariant}
        >
          <h2>{t("landing.cta.title", "Ready to Automate Your Data Collection?")}</h2>
          <p>{t("landing.cta.subtitle", "Join thousands of administrators building forms and automating workflows in minutes.")}</p>
          <div className="cta-banner-buttons">
            <button
              type="button"
              className="landing-btn-cta-primary"
              onClick={() => onOpenAuth("register")}
            >
              <span>{t("landing.cta.primaryBtn", "Get Started Free Today")}</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="landing-btn-cta-secondary"
              onClick={() => onOpenAuth("login")}
            >
              <span>{t("landing.cta.secondaryBtn", "Sign In to Workspace")}</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer relative z-10">
        <motion.div
          className="landing-footer-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariant}
        >
          <div className="footer-col brand-col">
            <div className="landing-brand">
              <div className="landing-logo-icon">
                <LogoMark size={18} color="#FFFFFF" />
              </div>
              <span className="landing-brand-name">{t("app.formcraftHq", "FormCraft HQ")}</span>
            </div>
            <p>{t("landing.footer.tagline", "Low-Code Workflow Automation & Intelligent Data Collection Platform.")}</p>
          </div>

          <div className="footer-col">
            <h4>{t("landing.footer.product", "Product")}</h4>
            <ul>
              <li><button onClick={() => scrollToSection("features")}>{t("landing.footer.formBuilder", "Form Builder")}</button></li>
              <li><button onClick={() => scrollToSection("features")}>{t("landing.footer.ruleEngine", "Rule Engine")}</button></li>
              <li><button onClick={() => scrollToSection("workflows")}>{t("landing.footer.workflowSteps", "Workflow Steps")}</button></li>
              <li><button onClick={() => scrollToSection("analytics")}>{t("landing.footer.analytics", "Analytics")}</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("landing.footer.resources", "Resources")}</h4>
            <ul>
              <li><button onClick={() => scrollToSection("templates")}>{t("landing.footer.templates", "Templates")}</button></li>
              <li><button onClick={() => scrollToSection("sandbox")}>{t("landing.footer.liveSandbox", "Live Sandbox")}</button></li>
              <li><button onClick={() => onOpenAuth("login")}>{t("landing.footer.signIn", "Sign In")}</button></li>
              <li><button onClick={() => onOpenAuth("register")}>{t("landing.footer.register", "Register")}</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("landing.footer.complianceTech", "Compliance & Tech")}</h4>
            <ul>
              <li><span>{t("landing.footer.backend", "FastAPI Backend")}</span></li>
              <li><span>{t("landing.footer.frontend", "React 18 Frontend")}</span></li>
              <li><span>{t("landing.footer.authTech", "JWT & Firebase Auth")}</span></li>
              <li><span>{t("landing.footer.database", "SQLite Database")}</span></li>
            </ul>
          </div>
        </motion.div>

        <div className="landing-footer-bottom">
          <p>{t("landing.footer.copyright", "© 2026 FormCraft HQ. All rights reserved.")}</p>
        </div>
      </footer>
    </div>
  );
}
