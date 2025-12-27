import { useState } from "react";
import { parseKeywordCSV } from "./utils/csvParser";
import { analyzeKeywords } from "./utils/analyzer";
import { generateMarkdownReport } from "./utils/reportGenerator";

import HowTo from "./HowTo";

import "./App.css";

import faviconIcon from "./favicon.ico";
function App() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [mustInclude, setMustInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [keywordLength, setKeywordLength] = useState("any");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
    } else if (selectedFile) {
      setError("Please select a CSV file");
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Parse CSV
      const keywords = await parseKeywordCSV(file);

      if (keywords.length === 0) {
        throw new Error(
          "No keywords found in CSV. Please check the file format."
        );
      }

      // Analyze keywords with filters
      const results = analyzeKeywords(keywords, {
        mustInclude: mustInclude.trim(),
        exclude: exclude.trim(),
        keywordLength: keywordLength,
      });
      setAnalysis(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyToClipboard = () => {
    const markdown = generateMarkdownReport(analysis, file.name);
    navigator.clipboard
      .writeText(markdown)
      .then(() => alert("Report copied to clipboard!"))
      .catch(() => alert("Failed to copy to clipboard"));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const markdown = generateMarkdownReport(analysis, file.name);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(".csv", "")}-analysis-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="flexHolder">
              <img src={faviconIcon} alt="butthole icon" />{" "}
              <h1>Keyword Anal - Google Ads</h1>
            </div>
            <p>
              Upload your Google Ads Keyword Planner CSV export to analyse
              keyword opportunities
            </p>
          </div>
          <HowTo />
        </div>
      </header>

      <main className="main">
        {/* Upload Section */}
        <section className="upload-section">
          <div
            className={`file-input-wrapper ${isDragging ? "dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="csv-upload" className="file-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <strong>
                  {file ? "Upload a new file" : "Choose CSV file"}
                </strong>
                <span> or drag and drop here</span>
              </div>
            </label>
          </div>

          {file && (
            <div className="current-file">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}

          {/* Filter Controls */}
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="must-include" className="filter-label">
                Must Include
                <span className="tooltip-wrapper">
                  <span className="tooltip-icon">?</span>
                  <span className="tooltip-text">
                    Enter a word or phrase that must appear in the keywords. For
                    example, "plumber" will only show keywords containing
                    "plumber".
                  </span>
                </span>
              </label>
              <input
                id="must-include"
                type="text"
                className="filter-input"
                placeholder="e.g. word, template"
                value={mustInclude}
                onChange={(e) => setMustInclude(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="exclude" className="filter-label">
                Exclude
                <span className="tooltip-wrapper">
                  <span className="tooltip-icon">?</span>
                  <span className="tooltip-text">
                    Enter words to exclude, separated by commas. Keywords
                    containing any of these words will be hidden. For example,
                    "free, cheap" will hide all keywords with "free" or "cheap".
                  </span>
                </span>
              </label>
              <input
                id="exclude"
                type="text"
                className="filter-input"
                placeholder="e.g. free, cheap, diy"
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="keyword-length" className="filter-label">
                Keyword Length
                <span className="tooltip-wrapper">
                  <span className="tooltip-icon">?</span>
                  <span className="tooltip-text">
                    Filter keywords by the number of words. For example,
                    selecting "3" will only show keywords with exactly 3 words
                    like "emergency plumber sydney".
                  </span>
                </span>
              </label>
              <select
                id="keyword-length"
                className="filter-select"
                value={keywordLength}
                onChange={(e) => setKeywordLength(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="1">1 word</option>
                <option value="2">2 words</option>
                <option value="3">3 words</option>
                <option value="4">4 words</option>
                <option value="5">5 words</option>
                <option value="6">6+ words</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="analyze-button"
          >
            {isAnalyzing ? "Analysing..." : "Analyse Keywords"}
          </button>
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <section className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <div className="action-buttons">
                <button
                  onClick={handleDownload}
                  className="action-button download"
                >
                  Download Report
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="action-button copy"
                >
                  Copy to Clipboard
                </button>
                <button onClick={handlePrint} className="action-button print">
                  Print
                </button>
              </div>
            </div>

            {/* Filter Notice */}
            {(analysis.filters.mustInclude ||
              analysis.filters.exclude ||
              analysis.filters.keywordLength !== "any") && (
              <div className="filter-notice">
                <strong>Active Filters:</strong>
                {analysis.filters.mustInclude && (
                  <span className="filter-badge">
                    Must include: "{analysis.filters.mustInclude}"
                  </span>
                )}
                {analysis.filters.exclude && (
                  <span className="filter-badge">
                    Excluding: "{analysis.filters.exclude}"
                  </span>
                )}
                {analysis.filters.keywordLength !== "any" && (
                  <span className="filter-badge">
                    Length:{" "}
                    {analysis.filters.keywordLength === "6"
                      ? "6+ words"
                      : `${analysis.filters.keywordLength} word${
                          analysis.filters.keywordLength === "1" ? "" : "s"
                        }`}
                  </span>
                )}
              </div>
            )}

            {/* Executive Summary */}
            <div className="summary-card">
              <h3>Executive Summary</h3>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-value">{analysis.totalKeywords}</div>
                  <div className="stat-label">Total Keywords</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{analysis.inAccountCount}</div>
                  <div className="stat-label">Already in Account</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{analysis.newOpportunities}</div>
                  <div className="stat-label">New Opportunities</div>
                </div>
                <div className="stat">
                  <div className="stat-value">
                    {analysis.competitionBreakdown.low}
                  </div>
                  <div className="stat-label">Low Competition</div>
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            {analysis.topKeywords.length > 0 && (
              <div className="results-card">
                <h3>Top Recommendations</h3>
                <p className="card-description">
                  Keywords not in your account, ranked by potential value
                </p>
                <div className="keywords-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Keyword</th>
                        <th>Searches/mo</th>
                        <th>Competition</th>
                        <th>CPC Range</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.topKeywords.map((keyword, index) => (
                        <tr key={index}>
                          <td className="keyword-text">{keyword.text}</td>
                          <td>{keyword.searches.toLocaleString()}</td>
                          <td>
                            <span
                              className={`competition-badge ${keyword.competition}`}
                            >
                              {keyword.competition}
                            </span>
                          </td>
                          <td>
                            {keyword.topBidLow && keyword.topBidHigh
                              ? `${
                                  keyword.currency
                                } ${keyword.topBidLow.toFixed(
                                  2
                                )} - ${keyword.topBidHigh.toFixed(2)}`
                              : "N/A"}
                          </td>
                          <td>
                            <span className="score-badge">
                              {keyword.score}/8
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {analysis.topKeywords.length === 0 && (
              <div className="results-card">
                <h3>Top Recommendations</h3>
                <p className="card-description">
                  No keywords match your current filters. Try adjusting your
                  "Must Include", "Exclude", or "Keyword Length" criteria.
                </p>
              </div>
            )}

            {/* Quick Wins */}
            {analysis.quickWins.length > 0 && (
              <div className="results-card">
                <h3>Quick Wins</h3>
                <p className="card-description">
                  Low competition, high volume keywords
                </p>
                <div className="keywords-list">
                  {analysis.quickWins.slice(0, 5).map((keyword, index) => (
                    <div key={index} className="keyword-item">
                      <div className="keyword-name">{keyword.text}</div>
                      <div className="keyword-meta">
                        {keyword.searches.toLocaleString()} searches/mo
                        Competition: {keyword.competitionIndex}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficult Keywords */}
            {analysis.difficultKeywords &&
              analysis.difficultKeywords.length > 0 && (
                <div className="results-card">
                  <h3>âš¡ Difficult Keywords</h3>
                  <p className="card-description">
                    High competition, high volume keywords - market leaders
                    worth pursuing
                  </p>
                  <div className="keywords-list">
                    {analysis.difficultKeywords.map((keyword, index) => (
                      <div key={index} className="keyword-item">
                        <div className="keyword-name">{keyword.text}</div>
                        <div className="keyword-meta">
                          {keyword.searches.toLocaleString()} searches/mo
                          Competition: {keyword.competitionIndex}/100
                          {keyword.topBidLow && keyword.topBidHigh && (
                            <>
                              {" "}
                              Est. CPC: {keyword.currency}{" "}
                              {keyword.topBidLow.toFixed(2)}-
                              {keyword.topBidHigh.toFixed(2)}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Competition Breakdown */}
            {analysis.newOpportunities > 0 && (
              <div className="results-card">
                <h3>Competition Breakdown</h3>
                <div className="competition-chart">
                  <div className="competition-bar">
                    <div
                      className="bar-segment low"
                      style={{
                        width: `${
                          (analysis.competitionBreakdown.low /
                            analysis.newOpportunities) *
                          100
                        }%`,
                      }}
                    >
                      <span>{analysis.competitionBreakdown.low}</span>
                    </div>
                    <div
                      className="bar-segment medium"
                      style={{
                        width: `${
                          (analysis.competitionBreakdown.medium /
                            analysis.newOpportunities) *
                          100
                        }%`,
                      }}
                    >
                      <span>{analysis.competitionBreakdown.medium}</span>
                    </div>
                    <div
                      className="bar-segment high"
                      style={{
                        width: `${
                          (analysis.competitionBreakdown.high /
                            analysis.newOpportunities) *
                          100
                        }%`,
                      }}
                    >
                      <span>{analysis.competitionBreakdown.high}</span>
                    </div>
                  </div>
                  <div className="competition-labels">
                    <div className="label">
                      <span className="color-dot low"></span>
                      Low (
                      {(
                        (analysis.competitionBreakdown.low /
                          analysis.newOpportunities) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                    <div className="label">
                      <span className="color-dot medium"></span>
                      Medium (
                      {(
                        (analysis.competitionBreakdown.medium /
                          analysis.newOpportunities) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                    <div className="label">
                      <span className="color-dot high"></span>
                      High (
                      {(
                        (analysis.competitionBreakdown.high /
                          analysis.newOpportunities) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Recommendation */}
            {analysis.avgLowBid > 0 && (
              <div className="results-card">
                <h3>Budget Recommendation</h3>
                <div className="budget-info">
                  <p>
                    <strong>Average CPC (Low Competition):</strong>{" "}
                    {analysis.currency} {analysis.avgLowBid.toFixed(2)}
                  </p>
                  <p>
                    <strong>Recommended Daily Budget:</strong>{" "}
                    {analysis.currency} {(analysis.avgLowBid * 50).toFixed(2)}{" "}
                    (50 clicks/day)
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Google Ads Keyword Anal - Built for analysing keyword opportunities
        </p>
      </footer>
    </div>
  );
}

export default App;
