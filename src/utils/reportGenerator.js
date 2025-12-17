// Markdown Report Generator

export const generateMarkdownReport = (analysis, fileName) => {
  const date = new Date().toLocaleDateString();

  let markdown = `# Google Ads Keyword Analysis Report\n\n`;
  markdown += `**Generated:** ${date}\n\n`;
  markdown += `**Source File:** ${fileName}\n\n`;
  markdown += `**Total Keywords Analyzed:** ${analysis.totalKeywords}\n\n`;
  markdown += `---\n\n`;

  // Executive Summary
  markdown += `## 📊 Executive Summary\n\n`;
  markdown += `- **Keywords in Account:** ${analysis.inAccountCount}\n`;
  markdown += `- **New Opportunities:** ${analysis.newOpportunities}\n`;
  markdown += `- **Low Competition Keywords:** ${analysis.competitionBreakdown.low}\n`;
  markdown += `- **Medium Competition Keywords:** ${analysis.competitionBreakdown.medium}\n`;
  markdown += `- **High Competition Keywords:** ${analysis.competitionBreakdown.high}\n\n`;

  // Top Recommendations
  markdown += `---\n\n## 🎯 Top Recommendations\n\n`;
  markdown += `*Keywords not currently in your account, ranked by potential value*\n\n`;

  if (analysis.topKeywords.length === 0) {
    markdown += `No keywords match current criteria.\n\n`;
  } else {
    analysis.topKeywords.forEach((k, i) => {
      markdown += `### ${i + 1}. ${k.text}\n\n`;
      markdown += `| Metric | Value |\n`;
      markdown += `|--------|-------|\n`;
      markdown += `| Monthly Searches | ${k.searches.toLocaleString()} |\n`;
      markdown += `| Competition | ${
        k.competition.charAt(0).toUpperCase() + k.competition.slice(1)
      } |\n`;
      markdown += `| Competition Index | ${k.competitionIndex}/100 |\n`;

      if (k.topBidLow && k.topBidHigh) {
        markdown += `| Est. CPC Range | ${k.currency} ${k.topBidLow.toFixed(
          2
        )} - ${k.topBidHigh.toFixed(2)} |\n`;
      }

      markdown += `| Opportunity Score | ${k.score}/8 |\n\n`;
      markdown += `---\n\n`;
    });
  }

  // Quick Win Keywords
  if (analysis.quickWins.length > 0) {
    markdown += `## 🚀 Quick Wins (Low Competition, High Volume)\n\n`;
    markdown += `| Keyword | Searches/mo | Competition Index | Est. CPC |\n`;
    markdown += `|---------|-------------|-------------------|----------|\n`;

    analysis.quickWins.forEach((k) => {
      const cpc =
        k.topBidLow && k.topBidHigh
          ? `${k.currency} ${k.topBidLow.toFixed(2)}-${k.topBidHigh.toFixed(2)}`
          : "N/A";
      markdown += `| ${k.text} | ${k.searches.toLocaleString()} | ${
        k.competitionIndex
      } | ${cpc} |\n`;
    });

    markdown += `\n`;
  }

  // High Volume Keywords
  if (analysis.highVolume.length > 0) {
    markdown += `---\n\n## 📈 High Volume Keywords (5000+ searches/mo)\n\n`;
    markdown += `| Keyword | Searches/mo | Competition | Score |\n`;
    markdown += `|---------|-------------|-------------|-------|\n`;

    analysis.highVolume.forEach((k) => {
      markdown += `| ${k.text} | ${k.searches.toLocaleString()} | ${
        k.competition
      } | ${k.score}/8 |\n`;
    });

    markdown += `\n`;
  }

  // Long-tail opportunities
  if (analysis.longTail.length > 0) {
    markdown += `---\n\n## 🎣 Long-Tail Keywords (3+ words, Low Competition)\n\n`;
    markdown += `*These typically have higher conversion rates*\n\n`;
    markdown += `| Keyword | Searches/mo | Competition Index |\n`;
    markdown += `|---------|-------------|-------------------|\n`;

    analysis.longTail.forEach((k) => {
      markdown += `| ${k.text} | ${k.searches.toLocaleString()} | ${
        k.competitionIndex
      } |\n`;
    });

    markdown += `\n`;
  }

  // Competition Analysis
  markdown += `---\n\n## 📊 Competition Breakdown\n\n`;
  markdown += `### New Keywords (Not in Account)\n\n`;
  markdown += `| Competition Level | Count | Percentage |\n`;
  markdown += `|-------------------|-------|------------|\n`;

  const totalNew = analysis.newOpportunities;
  markdown += `| Low | ${analysis.competitionBreakdown.low} | ${(
    (analysis.competitionBreakdown.low / totalNew) *
    100
  ).toFixed(1)}% |\n`;
  markdown += `| Medium | ${analysis.competitionBreakdown.medium} | ${(
    (analysis.competitionBreakdown.medium / totalNew) *
    100
  ).toFixed(1)}% |\n`;
  markdown += `| High | ${analysis.competitionBreakdown.high} | ${(
    (analysis.competitionBreakdown.high / totalNew) *
    100
  ).toFixed(1)}% |\n\n`;

  // Recommendations
  markdown += `---\n\n## 💡 Strategy Recommendations\n\n`;
  markdown += `### Immediate Actions\n\n`;

  if (analysis.quickWins.length > 0) {
    markdown += `1. **Start with Low Competition Winners**: Add the ${analysis.quickWins.length} low-competition, high-volume keywords first\n`;
  }

  if (analysis.longTail.length > 0) {
    markdown += `2. **Target Long-Tail Keywords**: The ${analysis.longTail.length} long-tail keywords typically convert better\n`;
  }

  markdown += `3. **Monitor Competition**: ${analysis.competitionBreakdown.high} high-competition keywords may require higher budgets\n`;
  markdown += `4. **Test and Iterate**: Start with top 10-20 keywords and expand based on performance\n\n`;

  markdown += `### Budget Allocation\n\n`;

  if (analysis.avgLowBid > 0) {
    markdown += `- Average CPC for low competition keywords: ${
      analysis.currency
    } ${analysis.avgLowBid.toFixed(2)}\n`;
    markdown += `- Recommended starting daily budget: ${analysis.currency} ${(
      analysis.avgLowBid * 50
    ).toFixed(2)} (50 clicks/day)\n\n`;
  }

  markdown += `---\n\n## 📝 Scoring Methodology\n\n`;
  markdown += `Keywords are scored 1-8 based on:\n\n`;
  markdown += `**Search Volume:**\n`;
  markdown += `- 1000+ searches: 5 points\n`;
  markdown += `- 500-999 searches: 4 points\n`;
  markdown += `- 100-499 searches: 3 points\n`;
  markdown += `- 50-99 searches: 2 points\n`;
  markdown += `- <50 searches: 1 point\n\n`;
  markdown += `**Competition (lower is better):**\n`;
  markdown += `- Low competition: 3 points\n`;
  markdown += `- Medium competition: 2 points\n`;
  markdown += `- High competition: 1 point\n\n`;

  markdown += `---\n\n`;
  markdown += `*Report generated by Google Ads Keyword Analyzer*\n`;

  return markdown;
};
