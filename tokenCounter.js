const axios = require("axios");
const { load } = require("cheerio");
const { encoding_for_model } = require("@dqbd/tiktoken");

async function fetchAndCleanHTML(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, "");
    const $ = load(htmlWithoutComments);

    // Remove unnecessary elements
    $("header, .header, #header, script, style, noscript, footer, .footer, #footer, form, input, textarea, button, .comments, .comment-section, #comments, .comment-list, .reply").remove();

    // Extract relevant content
    const cleanedHTML = $("body")
      .find("h1, h2, h3, p, ul, li")
      .map((_, el) => $(el).text().trim())
      .get()
      .join("\n");

    return cleanedHTML;
  } catch (error) {
    console.error("Error fetching and cleaning HTML:", error.message);
    throw new Error("Failed to fetch and clean HTML from the URL");
  }
}

function countTokens(text, model = "gpt-4o-mini") {
  console.log(text);
  const tokenizer = encoding_for_model(model); // Load tokenizer for the model
  const tokens = tokenizer.encode(text); // Tokenize the text
  const tokenCount = tokens.length;
  tokenizer.free();
  return tokenCount;
}

async function getTokenCountFromURL(url) {
  const cleanedHTML = await fetchAndCleanHTML(url);
  return countTokens(cleanedHTML);
}

module.exports = {
  getTokenCountFromURL,
};

