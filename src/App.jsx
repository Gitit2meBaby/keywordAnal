import { useState } from 'react';
import { parseKeywordCSV } from './utils/csvParser';
import { analyzeKeywords } from './utils/analyzer';
import { generateMarkdownReport } from './utils/reportGenerator';
import HowTo from './HowTo';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Parse CSV
      const keywords = await parseKeywordCSV(file);
      
      if (keywords.length === 0) {
        throw new Error('No keywords found in CSV. Please check the file format.');
      }

      // Analyze keywords
      const results = analyzeKeywords(keywords);
      setAnalysis(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyToClipboard = () => {
    const markdown = generateMarkdownReport(analysis, file.name);
    navigator.clipboard.writeText(markdown)
      .then(() => alert('Report copied to clipboard!'))
      .catch(() => alert('Failed to copy to clipboard'));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const markdown = generateMarkdownReport(analysis, file.name);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.csv', '')}-analysis-${new Date().toISOString().slice(0, 10)}.md`;
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
            <h1>📊 Google Ads Keyword Analyzer</h1>
            <p>Upload your Google Ads Keyword Planner CSV export to analyze keyword opportunities</p>
          </div>
          <HowTo />
        </div>
      </header>

      <main className="main">
        {/* Upload Section */}
        <section className="upload-section">
          <div className="file-input-wrapper">
            <label htmlFor="csv-upload" className="file-label">
              {file ? `Selected: ${file.name}` : 'Choose CSV File'}
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Keywords'}
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
                <button onClick={handleDownload} className="action-button download">
                  💾 Download Report
                </button>
                <button onClick={handleCopyToClipboard} className="action-button copy">
                  📋 Copy to Clipboard
                </button>
                <button onClick={handlePrint} className="action-button print">
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="summary-card">
              <h3>📊 Executive Summary</h3>
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
                  <div className="stat-value">{analysis.competitionBreakdown.low}</div>
                  <div className="stat-label">Low Competition</div>
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            {analysis.topKeywords.length > 0 && (
              <div className="results-card">
                <h3>🎯 Top Recommendations</h3>
                <p className="card-description">Keywords not in your account, ranked by potential value</p>
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
                      {analysis.topKeywords.slice(0, 10).map((keyword, index) => (
                        <tr key={index}>
                          <td className="keyword-text">{keyword.text}</td>
                          <td>{keyword.searches.toLocaleString()}</td>
                          <td>
                            <span className={`competition-badge ${keyword.competition}`}>
                              {keyword.competition}
                            </span>
                          </td>
                          <td>
                            {keyword.topBidLow && keyword.topBidHigh
                              ? `${keyword.currency} ${keyword.topBidLow.toFixed(2)} - ${keyword.topBidHigh.toFixed(2)}`
                              : 'N/A'}
                          </td>
                          <td>
                            <span className="score-badge">{keyword.score}/8</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {analysis.quickWins.length > 0 && (
              <div className="results-card">
                <h3>🚀 Quick Wins</h3>
                <p className="card-description">Low competition, high volume keywords</p>
                <div className="keywords-list">
                  {analysis.quickWins.slice(0, 5).map((keyword, index) => (
                    <div key={index} className="keyword-item">
                      <div className="keyword-name">{keyword.text}</div>
                      <div className="keyword-meta">
                        {keyword.searches.toLocaleString()} searches/mo • Competition: {keyword.competitionIndex}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competition Breakdown */}
            <div className="results-card">
              <h3>📊 Competition Breakdown</h3>
              <div className="competition-chart">
                <div className="competition-bar">
                  <div
                    className="bar-segment low"
                    style={{
                      width: `${(analysis.competitionBreakdown.low / analysis.newOpportunities) * 100}%`
                    }}
                  >
                    <span>{analysis.competitionBreakdown.low}</span>
                  </div>
                  <div
                    className="bar-segment medium"
                    style={{
                      width: `${(analysis.competitionBreakdown.medium / analysis.newOpportunities) * 100}%`
                    }}
                  >
                    <span>{analysis.competitionBreakdown.medium}</span>
                  </div>
                  <div
                    className="bar-segment high"
                    style={{
                      width: `${(analysis.competitionBreakdown.high / analysis.newOpportunities) * 100}%`
                    }}
                  >
                    <span>{analysis.competitionBreakdown.high}</span>
                  </div>
                </div>
                <div className="competition-labels">
                  <div className="label">
                    <span className="color-dot low"></span>
                    Low ({((analysis.competitionBreakdown.low / analysis.newOpportunities) * 100).toFixed(1)}%)
                  </div>
                  <div className="label">
                    <span className="color-dot medium"></span>
                    Medium ({((analysis.competitionBreakdown.medium / analysis.newOpportunities) * 100).toFixed(1)}%)
                  </div>
                  <div className="label">
                    <span className="color-dot high"></span>
                    High ({((analysis.competitionBreakdown.high / analysis.newOpportunities) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Recommendation */}
            {analysis.avgLowBid > 0 && (
              <div className="results-card">
                <h3>💰 Budget Recommendation</h3>
                <div className="budget-info">
                  <p>
                    <strong>Average CPC (Low Competition):</strong> {analysis.currency} {analysis.avgLowBid.toFixed(2)}
                  </p>
                  <p>
                    <strong>Recommended Daily Budget:</strong> {analysis.currency} {(analysis.avgLowBid * 50).toFixed(2)} (50 clicks/day)
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Google Ads Keyword Analyzer • Built for analyzing keyword opportunities</p>
      </footer>
    </div>
  );
}

export default App;