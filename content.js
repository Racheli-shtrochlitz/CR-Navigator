let historyStack = [];
let enabled = true;

chrome.storage?.local.get("enabled", (data) => {
  if (data && data.enabled === false) {
    enabled = false;
  }
});

function scrollToElement(el) {
  historyStack.push(window.scrollY);
  const rect = el.getBoundingClientRect();
  const elementTop = window.scrollY + rect.top;
  const elementHeight = rect.height;
  const viewportHeight = window.innerHeight;
  
  // Calculate target position to center the element in the viewport
  const targetTop = elementTop - (viewportHeight / 2) + (elementHeight / 2);
  
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  flashAt(el);
}

function goBack() {
  if (historyStack.length > 0) {
    const y = historyStack.pop();
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

function ensureStyles() {
  if (document.getElementById("ff-style")) return;
  const style = document.createElement("style");
  style.id = "ff-style";
  style.textContent = `
    @keyframes ffFlash {
      0% { background-color: rgba(255,255,0,0.6); }
      100% { background-color: transparent; }
    }
    .ff-flash {
      animation: ffFlash 3.5s ease-out 1;
    }
  `;
  document.head.appendChild(style);
}

function getStickyOffset() {
  // Try common sticky headers (GitHub, GitLab, Bitbucket). Fallback to 0.
  const header = document.querySelector("header, .Header, .sticky, .toolbar, .navbar, .js-header-wrapper");
  const h = header && typeof header.offsetHeight === "number" ? header.offsetHeight : 0;
  return isFinite(h) ? h : 0;
}

function flashAt(el) {
  ensureStyles();
  try {
    el.classList.add("ff-flash");
    setTimeout(() => el.classList.remove("ff-flash"), 3700);
  } catch (e) {
    // ignore
  }
}

function getCodeLineNodes() {
  const selectorList = [
    ".blob-code-inner",           
    ".react-code-line",             
    ".diff-line-code",              
    ".file .line .content",         
    ".file .udiff-line .seg"         
  ].join(",");
  return document.querySelectorAll(selectorList);
}

function isAlreadyMarked(node) {
  return node.hasAttribute("data-ff-marked");
}

function markNode(node) {
  node.setAttribute("data-ff-marked", "true");
}

function isFunctionish(text) {
  if (!text) return false;
  const trimmed = text.replace(/^[-+\s]+/, "");
  const patterns = [
    /\bfunction\s+\w+\s*\(/,         
    /\bclass\s+[A-Z]\w*/,              
    /^[A-Z][A-Za-z0-9_]+\s*\(/,        
    /\bconst\s+\w+\s*=\s*\(/,       
    /\bconst\s+\w+\s*=\s*async\s*\(/,
    /\bconst\s+\w+\s*=\s*\w*\s*=>/, 
    /\bdef\s+\w+\s*\(/,               
    /\bfunc\s+\w+\s*\(/              
  ];
  return patterns.some((re) => re.test(trimmed));
}

function extractDefName(text) {
  const t = text.replace(/^[-+\s]+/, "");
  const defs = [
    /\bfunction\s+(\w+)\s*\(/,
    /\bclass\s+([A-Z]\w*)/,
    /\bconst\s+(\w+)\s*=\s*\(/,
    /\bconst\s+(\w+)\s*=\s*async\s*\(/,
    /\bconst\s+(\w+)\s*=\s*\w*\s*=>/,
    /\bdef\s+(\w+)\s*\(/,
    /\bfunc\s+(\w+)\s*\(/
  ];
  for (const re of defs) {
    const m = t.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

function buildDefinitionIndex() {
  const map = new Map();
  getCodeLineNodes().forEach((line) => {
    const name = extractDefName(line.innerText || "");
    if (name) {
      map.set(name, line);
      markNode(line);
    }
  });
  return map;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markCallSites(defIndex) {
  if (!defIndex || defIndex.size === 0) return;
  const names = Array.from(defIndex.keys());
  if (names.length > 200) return;
  const nameGroup = names.map(escapeRegex).join("|");
  if (!nameGroup) return;

  const callNameRegex = new RegExp(`\\b(${nameGroup})\\b`, "g");

  function createCallSpan(name) {
    const span = document.createElement("span");
    span.setAttribute("data-ff-call", name);
    span.style.background = "rgba(255,255,0,0.3)";
    span.style.cursor = "pointer";
    span.title = "Click to jump to definition";
    const defEl = defIndex.get(name);
    if (defEl) {
      span.addEventListener("click", (e) => {
        e.stopPropagation();
        scrollToElement(defEl);
      });
    }
    return span;
  }

  function getNextNonWhitespaceCharAndNode(startNode, startOffset, lineRoot) {
    // Iterate text from startOffset in startNode, then through subsequent text nodes under lineRoot
    function* iterateTextNodes(fromNode) {
      const walker = document.createTreeWalker(lineRoot, NodeFilter.SHOW_TEXT, null);
      // advance walker to fromNode
      let cur = walker.nextNode();
      while (cur && cur !== fromNode) cur = walker.nextNode();
      if (!cur) return;
      yield cur;
      while ((cur = walker.nextNode())) yield cur;
    }
    let idxInNode = startOffset;
    for (const tn of iterateTextNodes(startNode)) {
      const text = tn.nodeValue || "";
      for (let i = tn === startNode ? idxInNode : 0; i < text.length; i++) {
        const ch = text[i];
        if (!/\s/.test(ch)) {
          return { ch, node: tn, offset: i };
        }
      }
    }
    return null;
  }

  function wrapMatchesInTextNode(node, regex, lineRoot) {
    const text = node.nodeValue || "";
    let match;
    let lastIndex = 0;
    let wrapped = false;
    const parent = node.parentNode;
    if (!parent) return false;
    const frag = document.createDocumentFragment();
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      // Verify the next non-whitespace char after the matched name (possibly in following nodes) is '('
      const nextInfo = getNextNonWhitespaceCharAndNode(node, end, lineRoot);
      if (!nextInfo || nextInfo.ch !== '(') {
        // Not a call site; append as plain text segment
        continue;
      }
      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }
      const fnName = match[1];
      const span = createCallSpan(fnName);
      span.appendChild(document.createTextNode(match[0]));
      frag.appendChild(span);
      lastIndex = end;
      wrapped = true;
    }
    if (!wrapped) return false;
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    parent.replaceChild(frag, node);
    return true;
  }

  getCodeLineNodes().forEach((line) => {
    const text = line.innerText || "";
    if (!text) return;
    if (isFunctionish(text)) return;
    if (line.getAttribute("data-ff-calls-marked") === "true") return;

    if (!callNameRegex.test(text)) return;
    callNameRegex.lastIndex = 0;

    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    let changed = false;
    for (const tn of textNodes) {
      const perNodeRegex = new RegExp(callNameRegex.source, callNameRegex.flags);
      if (wrapMatchesInTextNode(tn, perNodeRegex, line)) changed = true;
    }

    if (changed) {
      line.setAttribute("data-ff-calls-marked", "true");
    }
  });
}

function markFunctions() {
  if (!enabled) return;
  const defIndex = buildDefinitionIndex();
  markCallSites(defIndex);
}

function addBackButton() {
  if (document.getElementById("ff-back-btn") || !enabled) return;
  const backBtn = document.createElement("button");
  backBtn.id = "ff-back-btn";
  backBtn.innerText = "⬅ Back";
  backBtn.style.position = "fixed";
  backBtn.style.top = "10px";
  backBtn.style.right = "10px";
  backBtn.style.zIndex = "9999";
  backBtn.style.padding = "5px 10px";
  backBtn.style.background = "#333";
  backBtn.style.color = "#fff";
  backBtn.style.border = "none";
  backBtn.style.borderRadius = "5px";
  backBtn.style.cursor = "pointer";
  backBtn.onclick = goBack;
  document.body.appendChild(backBtn);
}

function debounce(fn, wait) {
  let t;
  return function() {
    clearTimeout(t);
    t = setTimeout(fn, wait);
  };
}

const debouncedMark = debounce(markFunctions, 200);

const observer = new MutationObserver(() => {
  debouncedMark();
});

window.addEventListener("load", () => {
  markFunctions();
  addBackButton();
  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    // ignore
  }
  
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      goBack();
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    enabled = message.enabled;
    if (enabled) {
      markFunctions();
      addBackButton();
    } else {
      // Remove all highlights and back button
      document.querySelectorAll("[data-ff-call]").forEach(span => {
        span.style.background = "";
        span.style.cursor = "";
        span.removeAttribute("data-ff-call");
      });
      document.querySelectorAll("[data-ff-marked]").forEach(el => {
        el.removeAttribute("data-ff-marked");
      });
      const backBtn = document.getElementById("ff-back-btn");
      if (backBtn) backBtn.remove();
    }
  }
});
