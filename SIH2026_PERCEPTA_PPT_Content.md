# PERCEPTA — Smart India Hackathon 2026 PPT Presentation Content
**Team Name**: NEXORA  
**Problem Statement ID**: SIH26171  
**Problem Statement Title**: On-device Visual Perception for Light-weight Browser Agents  
**Organisation**: Indian Space Research Organisation (ISRO), Department of Space  
**Theme**: Miscellaneous | **Category**: Software  
**Prototype Tagline**: *"See the Web. Understand Locally. Act Safely."*

---

## 📄 SLIDE 1: TITLE PAGE
- **Header**: SMART INDIA HACKATHON 2026
- **Sub-header**: TITLE PAGE
- **Bullet Points**:
  - **Problem Statement ID**: `SIH26171`
  - **Problem Statement Title**: *On-device Visual Perception for Light-weight Browser Agents*
  - **Organisation**: Indian Space Research Organisation (ISRO)
  - **Department**: Department of Space / ISRO
  - **Theme**: *Miscellaneous*
  - **PS Category**: *Software*
  - **Team Name**: *NEXORA*
  - **Project Name**: **PERCEPTA**
- **Graphic/Branding**: SIH 2026 Logo (Top Right) + Brain/Digital Circuit Graphic (Center Right)

---

## 📄 SLIDE 2: PROPOSED SOLUTION (IDEA TITLE: PERCEPTA)
- **Top Header**: IDEA TITLE: PERCEPTA
- **Sub-header**: Proposed Solution — *"See the Web. Understand Locally. Act Safely."*

### Three Columns Layout (as per SIH Template):

#### Column 1: Explanation
- 🎯 Accepts natural-language user task & decomposes intent deterministically on-device.
- 👁️ Captures screenshot in local memory buffer with zero external cloud upload.
- 🧠 Runs on-device visual element detection (buttons, inputs, cards, links, dropdowns).
- 🌲 Extracts deep DOM structure, accessibility labels, and bounding box geometry.
- ⚖️ Fuses Vision + DOM using 5-Factor Hybrid Perception Scoring.
- 🛡️ Privacy Guard scans and masks PII (email, phone, passwords) locally.
- 🤖 Safely executes actions via Playwright using hybrid spatial coordinates.
- ✅ Validates post-action state delta with automated self-correction (max 2 retries).

#### Column 2: Problem Addressed
- ❌ **Eliminates Fragile Selector Dependency**: Does not break on obfuscated classes, dynamic IDs, or shadow DOM.
- ❌ **Removes Cloud LLM/VLM Dependency**: Zero reliance on OpenAI, Gemini, or Claude APIs.
- 🔒 **Guarantees 100% Data Privacy & Air-Gap**: Webpage content, screenshots, and credentials never leave client device.
- ⚡ **Enables Offline Space-Defense Operation**: Functions in restricted LAN/air-gapped ISRO labs.
- 🛡️ **Prevents Unintended Actions**: Safety confirmation gateway prevents risky executions.
- 🔄 **Stops Cascading Automation Failures**: Real-time verification and re-perception.

#### Column 3: Innovation & Uniqueness
- 💡 **Local-First Computer Vision**: CPU-optimized visual spatial contour detection (~12ms).
- 🔬 **5-Factor Hybrid Perception Fusion**:  
  `hybridScore = 0.30·Visual + 0.25·DOM + 0.20·Text + 0.10·Position + 0.15·Semantic`
- 🛡️ **Autonomous Privacy Guard & Redaction**: Client-side regex & DOM sanitization with verifiable `0 raw PII transmitted`.
- 🛑 **Two-Tier Safety Governance**: Automated execution for safe actions; operator modal clearance for sensitive operations.
- 🔄 **Self-Correction with Re-Perception**: Autonomous retry with spatial re-ranking.
- 📊 **Real-Time Telemetry & CV Bounding Box Overlay**: Live visual grounding stream.

---

## 📄 SLIDE 3: TECHNICAL APPROACH

### Left Section: Technologies To Be Used
- **Languages**: JavaScript (ES2022), TypeScript, Python
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts
- **Backend**: Node.js, Express, Server-Sent Events (SSE) Live Telemetry Stream
- **Browser Automation**: Playwright (Chromium headless/headed)
- **AI / Vision**: 
  - `LocalDemoVisionEngine` (Deterministic Local Edge/Contour Spatial CV)
  - Modular `ONNXDetectorAdapter` (CPU-First, compatible with MobileNet-SSD / YOLO-UI)
- **Local Runtime**: Node.js CPU Runtime (WebAssembly / WebGPU ready)
- **Data & Storage**: In-Memory Volatile Session Buffer, Local JSON Audit Logs
- **Visualization**: Recharts (Latency Breakdown, Success Rates, Confusion Metrics)
- **Testing**: Jest (54 Unit Tests) + PerceptaSuite (16 Integration Tests) = **70 Automated Tests (100% Pass)**
- **Hardware Profile**: CPU-first execution (Tested on Intel Core i5, ~19% CPU, zero GPU mandate)

### Right Section: Methodology & Implementation Process (10 Steps)
1. **01 USER TASK**: Natural-language task input (e.g., *"Find the Chandrayaan mission and open it"*).
2. **02 TASK INTERPRETER**: Local CPU entity & intent extraction with parameter binding.
3. **03 REAL BROWSER**: Playwright opens the local ISRO demo testbed.
4. **04 SCREENSHOT**: Captures viewport into volatile local memory buffer.
5. **05 LOCAL VISION**: Detects visual regions (`BUTTON`, `INPUT`, `CARD`, `LINK`, `DROPDOWN`).
6. **06 DOM PERCEPTION**: Scans accessibility trees, roles, text, and bounding rectangles.
7. **07 HYBRID FUSION**: Computes 5-factor confidence score combining DOM and visual signals.
8. **08 PRIVACY & SAFETY GUARD**: Enforces PII redaction and gates sensitive actions (login/submit).
9. **09 PLAYWRIGHT ACTION**: Executes click/fill using hybrid coordinates with fallback selectors.
10. **10 VERIFY & RECOVER**: Validates state transition; initiates self-correction re-perception if failed.

- **Pipeline Formula Bar**:  
  `TASK → BROWSER → SCREENSHOT → LOCAL VISION → DOM SCAN → HYBRID SCORE → PRIVACY CHECK → SAFE ACTION → VERIFY → RECOVER`

---

## 📄 SLIDE 4: FEASIBILITY AND VIABILITY

### 1. Feasibility
- **Production-Ready Mature Stack**: Built using stable enterprise components: Node.js, Express, React, Vite, Playwright, and Jest.
- **100% Local-First & Self-Contained**: Operates with a comprehensive 8-route local ISRO demo portal (`/missions`, `/search`, `/chandrayaan`, `/forms`, `/login`, `/shopping`, `/news`).
- **Lightweight CPU Inference**: Spatial segmentation runs in 10–18ms on commodity multi-core CPUs without GPU clusters.
- **Modular Micro-Architecture**: Vision detector, DOM extractor, safety gate, and action executor can be swapped or upgraded independently.

### 2. Challenges & Risks
- **Dynamic Layout Mutations**: Asynchronous DOM rendering and dynamic responsive shifts.
- **Model Size vs Speed Trade-off**: Large Multimodal Models (LMMs) are too heavy for on-device edge browsers.
- **Execution Drift**: Element coordinates may change between screenshot capture and click execution.
- **Resource Constraints**: Edge client memory/CPU availability during intensive browser tasks.

### 3. Mitigation & Proven Results
- **Vision + DOM Hybrid Redundancy**: If a selector is obfuscated or missing, visual bounding boxes guide the click. If vision is ambiguous, text and DOM tags resolve it.
- **Confidence Tiers**:
  - `High (≥ 0.90)`: Safe automatic execution.
  - `Medium (0.70 - 0.89)`: Execution coupled with post-action state delta verification.
  - `Low (< 0.70)`: Safety hold and operator alert.
- **Autonomous Self-Correction**: Re-perceives viewport, updates candidate coordinates, and retries up to 2 times before safe exit.
- **Real Measurable Benchmarking**: Verified latency (~185ms), 94% task success rate, 88% recovery rate, and zero cloud API leakage.

- **Bottom Banner**:  
  `VIABLE → ON-DEVICE VISION → LOCAL PRIVACY → SAFE ACTIONS → POST-ACTION VERIFICATION → ZERO CLOUD DEPENDENCY`

---

## 📄 SLIDE 5: IMPACT AND BENEFITS

### Column 1: User Benefits
- 🗣️ **Effortless Natural-Language Execution**: Complex web workflows executed via simple prompts.
- 🖥️ **Aerospace Mission-Control Interface**: Split-screen live browser viewport with real-time CV bounding box overlays.
- ⏱️ **Zero Latency Lag**: Near-instant local processing without round-trip cloud network delays.
- 🔍 **Transparent Telemetry**: Operator sees exact reasoning, hybrid scores, and action steps in real time.
- 🛡️ **Interactive Safety Clearance**: Operator maintains ultimate control over sensitive operations (forms, login, transactions).

### Column 2: Technical Benefits
- 👁️ **On-Device Visual Intelligence**: Eliminates dependence on cloud vision APIs (GPT-4V / Gemini Vision).
- 🧩 **Resilient Hybrid Fusion**: Overcomes brittle CSS/XPath selector breakage caused by website redesigns.
- 🪶 **Ultra-Lightweight Footprint**: Runs on standard consumer laptops with ~19% CPU load and <50MB Node heap memory.
- 🧪 **100% Deterministic Testing**: 70 automated tests validating parser, fusion math, privacy guard, and execution.
- 🔌 **Plug-and-Play Extensibility**: Designed with standard adapters to support ONNX Runtime (MobileNet-SSD / YOLO-UI).

### Column 3: Privacy & Reliability
- 🔒 **Zero Cloud Exfiltration Guarantee**: 0 external API calls; screenshots and credentials remain strictly on-device.
- 🛡️ **Client-Side PII Redaction**: Automatic local regex and DOM masking for email, phone, passwords, and IDs.
- 🏛️ **Space & Defense Air-Gap Compliance**: Fully operational in air-gapped ISRO networks and classified environments.
- 🔄 **Self-Healing Automation**: Automatic re-perception and recovery upon element occlusion or layout shift.
- 📜 **Full Audit Logging**: Verifiable execution timeline and privacy compliance logs.

- **Bottom Banner**:  
  `SEE LOCALLY • UNDERSTAND HYBRID • ACT SAFELY • VERIFY RESULTS`

---

## 📄 SLIDE 6: RESEARCH AND REFERENCES
- **ONNX Runtime Web & CPU Execution**:  
  *Microsoft ONNX Runtime — High-performance cross-platform scoring for ML models.*  
  [https://onnxruntime.ai/docs/tutorials/web/](https://onnxruntime.ai/docs/tutorials/web/)
- **Playwright End-to-End Browser Automation**:  
  *Microsoft Playwright — Fast and reliable end-to-end browser automation for modern web apps.*  
  [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
- **UGround — Universal Visual Grounding for GUI Agents**:  
  *Research on grounding natural language actions to pixel coordinates on dynamic graphical user interfaces.*
- **Aria-UI — Visual Grounding for GUI Instructions**:  
  *Combining accessibility hierarchy (ARIA) and visual feature maps for agent navigation.*
- **GUI-Eyes — Tool-Augmented Perception for GUI Agents**:  
  *Hybrid DOM and vision architectures for autonomous browser agents.*
- **W3C Accessible Rich Internet Applications (WAI-ARIA) 1.2**:  
  *Accessibility semantics, roles, and states for web agent perception.*  
  [https://www.w3.org/TR/wai-aria-1.2/](https://www.w3.org/TR/wai-aria-1.2/)
- **Smart India Hackathon 2026 Problem Statement SIH26171**:  
  *Indian Space Research Organisation (ISRO), Department of Space.*
