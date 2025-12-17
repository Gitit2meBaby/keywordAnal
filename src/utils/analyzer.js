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

export const analyzeKeywords = (keywords) => {
  // Filter for new opportunities (not in account)
  const newKeywords = keywords.filter((k) => !k.inAccount);

  // Score each keyword
  const scoredKeywords = newKeywords.map((keyword) => ({
    ...keyword,
    score: calculateScore(keyword),
  }));

  // Sort by score
  scoredKeywords.sort((a, b) => b.score - a.score);

  // Get top recommendations - top 20 by score, regardless of filters
  const topKeywords = scoredKeywords.slice(0, 20);

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
    quickWins,
    highVolume,
    longTail,
    competitionBreakdown,
    avgLowBid: isNaN(avgLowBid) ? 0 : avgLowBid,
    currency: keywords[0]?.currency || "AUD",
  };
};
