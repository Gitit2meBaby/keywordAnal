import { useState } from 'react';
import './HowTo.css';

function HowTo() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal} className="howto-button">
        ❓ How to Use
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <h2>📋 How to Use This Tool</h2>

            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign in to Google Ads</h3>
                  <p>Go to <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">ads.google.com</a> and sign in with your Google account.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Open Keyword Planner</h3>
                  <p>Click on <strong>Tools & Settings</strong> (wrench icon) in the top right, then select <strong>Keyword Planner</strong> under "Planning".</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Keyword Ideas</h3>
                  <p>Click <strong>"Discover new keywords"</strong> or <strong>"Get search volume and forecasts"</strong>.</p>
                  <p>Enter your keywords or website URL and click <strong>"Get results"</strong>.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Download the CSV</h3>
                  <p>On the results page, click the <strong>Download</strong> button (download icon) in the top right.</p>
                  <p>Select <strong>"Download keyword ideas"</strong> or <strong>"Download as CSV"</strong>.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Upload Here</h3>
                  <p>Click the <strong>"Choose CSV File"</strong> button above and select the file you just downloaded.</p>
                  <p>Then click <strong>"Analyze Keywords"</strong> to see your results!</p>
                </div>
              </div>
            </div>

            <div className="tips-section">
              <h3>💡 Tips</h3>
              <ul>
                <li>You can upload the CSV directly - no need to convert or edit it first!</li>
                <li>The file should be named something like "Keyword Stats 2025-XX-XX.csv"</li>
                <li>All processing happens in your browser - your data stays private</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="close-button">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HowTo;