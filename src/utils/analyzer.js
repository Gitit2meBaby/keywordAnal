// Keyword Analysis Logic

const MIN_MONTHLY_SEARCHES = 10; // Lowered to catch more keywords
const COMPETITION_PREFERENCE = ["low", "medium"]; // Still prefer these for specific sections

const calculateScore = (keyword) => {
  let score = 0;

  // Search volume scoring
  if (keyword.searches >= 1000) score += 5;
  else if (keyword.searches >= 500) score += 4;
  else if (keyword.searches >= 100) score += 3;
  else if (keyword.searches >= 50) score += 2;
  else score += 1;

  // Competition scoring (inverted - lower is better)
  if (keyword.competition === "low") score += 3;
  else if (keyword.competition === "medium") score += 2;
  else if (keyword.competition === "high") score += 1;

  return score;
};

// Get word count from keyword (count spaces + 1)
const getWordCount = (keyword) => {
  return keyword.trim().split(/\s+/).length;
};

// Filter keywords based on mustInclude, exclude, and keyword length criteria
const applyFilters = (keywords, filters) => {
  let filtered = keywords;

  // Apply "must include" filter
  if (filters.mustInclude && filters.mustInclude.trim() !== "") {
    const mustIncludeTerm = filters.mustInclude.toLowerCase().trim();
    filtered = filtered.filter((k) =>
      k.text.toLowerCase().includes(mustIncludeTerm)
    );
  }

  // Apply "exclude" filter
  if (filters.exclude && filters.exclude.trim() !== "") {
    const excludeTerms = filters.exclude
      .toLowerCase()
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term !== "");

    filtered = filtered.filter((k) => {
      const keywordLower = k.text.toLowerCase();
      return !excludeTerms.some((term) => keywordLower.includes(term));
    });
  }

  // Apply "keyword length" filter
  if (filters.keywordLength && filters.keywordLength !== "any") {
    const targetLength = parseInt(filters.keywordLength);

    filtered = filtered.filter((k) => {
      const wordCount = getWordCount(k.text);

      // For "6+" option, include all keywords with 6 or more words
      if (targetLength === 6) {
        return wordCount >= 6;
      }

      // For specific lengths, match exactly
      return wordCount === targetLength;
    });
  }

  return filtered;
};

export const analyzeKeywords = (keywords, filters = {}) => {
  // Filter for new opportunities (not in account)
  let newKeywords = keywords.filter((k) => !k.inAccount);

  // Apply user filters
  newKeywords = applyFilters(newKeywords, filters);

  // Score each keyword
  const scoredKeywords = newKeywords.map((keyword) => ({
    ...keyword,
    score: calculateScore(keyword),
  }));

  // Sort by score
  scoredKeywords.sort((a, b) => b.score - a.score);

  // Get top recommendations - top 25 by score, regardless of filters
  const topKeywords = scoredKeywords.slice(0, 25);

  // Difficult keywords (high competition but high volume - market leaders)
  const difficultKeywords = newKeywords
    .filter((k) => k.competition === "high" && k.searches >= 1000)
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 5);

  // Quick wins (low competition, high volume)
  const quickWins = newKeywords
    .filter((k) => k.competition === "low" && k.searches >= 500)
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 10);

  // High volume keywords
  const highVolume = newKeywords
    .filter((k) => k.searches >= 5000)
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 15);

  // Long-tail keywords
  const longTail = newKeywords
    .filter(
      (k) =>
        k.text.split(" ").length >= 3 &&
        k.searches >= 100 &&
        k.competition === "low"
    )
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 15);

  // Competition breakdown
  const competitionBreakdown = {
    low: newKeywords.filter((k) => k.competition === "low").length,
    medium: newKeywords.filter((k) => k.competition === "medium").length,
    high: newKeywords.filter((k) => k.competition === "high").length,
    unknown: newKeywords.filter((k) => k.competition === "unknown").length,
  };

  // Statistics
  const inAccountCount = keywords.filter((k) => k.inAccount).length;
  const lowCompKeywords = newKeywords.filter(
    (k) => k.competition === "low" && k.searches >= MIN_MONTHLY_SEARCHES
  );

  const avgLowBid =
    lowCompKeywords
      .filter((k) => k.topBidLow && k.topBidHigh)
      .reduce((sum, k) => sum + (k.topBidLow + k.topBidHigh) / 2, 0) /
    lowCompKeywords.filter((k) => k.topBidLow && k.topBidHigh).length;

  return {
    totalKeywords: keywords.length,
    inAccountCount,
    newOpportunities: newKeywords.length,
    topKeywords,
    difficultKeywords,
    quickWins,
    highVolume,
    longTail,
    competitionBreakdown,
    avgLowBid: isNaN(avgLowBid) ? 0 : avgLowBid,
    currency: keywords[0]?.currency || "AUD",
    filters: {
      mustInclude: filters.mustInclude || "",
      exclude: filters.exclude || "",
      keywordLength: filters.keywordLength || "any",
    },
  };
};
