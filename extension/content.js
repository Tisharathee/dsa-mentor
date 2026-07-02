// content.js - DOM scraping script for LeetCode and similar platforms

function getProblemTitle() {
  let el = document.querySelector('span[class*="text-title-large"]');
  if (el) return el.innerText.trim();
  
  el = document.querySelector('.css-101swfg');
  if (el) return el.innerText.trim();

  el = document.querySelector('div[class*="title__"]');
  if (el) return el.innerText.trim();

  return document.title;
}

function getProblemDescription() {
  let el = document.querySelector('[data-track-load="description_content"]');
  if (el) return el.innerText.trim();
  
  el = document.querySelector('.elfjS');
  if (el) return el.innerText.trim();
  
  el = document.querySelector('.content__u3e1');
  if (el) return el.innerText.trim();

  el = document.querySelector('div[class*="description-content"]');
  if (el) return el.innerText.trim();

  return "";
}

function getCodeAttempt() {
  const codeLines = Array.from(document.querySelectorAll('.view-line'));
  if (codeLines.length > 0) {
    return codeLines.map(line => {
      // Replace non-breaking spaces with standard spaces to avoid indentation formatting issues
      return line.innerText.replace(/\u00a0/g, ' ');
    }).join('\n');
  }
  
  const textareas = Array.from(document.querySelectorAll('textarea'));
  for (const ta of textareas) {
    if (ta.value && (ta.value.includes('class Solution') || ta.value.includes('def ') || ta.value.includes('#include'))) {
      return ta.value;
    }
  }
  
  return "";
}

// Listener for scrape requests from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_LEETCODE") {
    try {
      const title = getProblemTitle();
      const description = getProblemDescription();
      const code = getCodeAttempt();
      sendResponse({
        success: true,
        title,
        description,
        code
      });
    } catch (e) {
      sendResponse({
        success: false,
        error: e.message
      });
    }
  }
  return true; // Keep the message channel open for async response
});
