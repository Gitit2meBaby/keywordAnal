// CSV Parser for Google Ads Keyword Planner exports
import Papa from "papaparse";

export const parseKeywordCSV = (file) => {
  return new Promise((resolve, reject) => {
    // Try reading as UTF-16LE first (Google Ads export format)
    const reader16 = new FileReader();

    reader16.onload = (e) => {
      try {
        let text = e.target.result;

        console.log("=== CSV Parser Debug ===");
        console.log("Attempted encoding: UTF-16LE");
        console.log("File size:", text.length, "characters");
        console.log("First 200 characters:", text.substring(0, 200));

        // Google Ads exports have 2 metadata lines, then headers on line 3
        const lines = text.split("\n");
        console.log("Total lines:", lines.length);
        console.log("Line 0 (title):", lines[0]);
        console.log("Line 1 (date):", lines[1]);
        console.log("Line 2 (headers):", lines[2]?.substring(0, 100));

        // Check line 2 (the header line) for delimiters
        const headerLine = lines[2] || "";
        const tabCount = (headerLine.match(/\t/g) || []).length;
        const commaCount = (headerLine.match(/,/g) || []).length;

        console.log("Tab count in header line:", tabCount);
        console.log("Comma count in header line:", commaCount);

        // If no tabs found in header, try UTF-8 instead
        if (tabCount === 0 && commaCount === 0) {
          console.log("❌ No delimiters found with UTF-16LE, trying UTF-8...");
          tryUTF8(file, resolve, reject);
          return;
        }

        // Determine delimiter
        const delimiter = tabCount > commaCount ? "\t" : ",";
        console.log("✓ Using delimiter:", delimiter === "\t" ? "TAB" : "COMMA");

        parseCSVText(text, delimiter, resolve, reject);
      } catch (error) {
        console.error("❌ UTF-16LE read error, trying UTF-8:", error);
        tryUTF8(file, resolve, reject);
      }
    };

    reader16.onerror = () => {
      console.log("❌ UTF-16LE failed, trying UTF-8");
      tryUTF8(file, resolve, reject);
    };

    // Try UTF-16LE first (most common for Google Ads)
    reader16.readAsText(file, "UTF-16LE");
  });
};

// Helper function to try UTF-8
function tryUTF8(file, resolve, reject) {
  const reader8 = new FileReader();

  reader8.onload = (e) => {
    try {
      let text = e.target.result;

      console.log("=== Trying UTF-8 ===");
      console.log("File size:", text.length, "characters");
      console.log("First 200 characters:", text.substring(0, 200));

      // Check line 2 (the header line) for delimiters
      const lines = text.split("\n");
      const headerLine = lines[2] || "";
      const tabCount = (headerLine.match(/\t/g) || []).length;
      const commaCount = (headerLine.match(/,/g) || []).length;

      console.log("Tab count in header line:", tabCount);
      console.log("Comma count in header line:", commaCount);

      // Determine delimiter
      const delimiter = tabCount > commaCount ? "\t" : ",";
      console.log("✓ Using delimiter:", delimiter === "\t" ? "TAB" : "COMMA");

      parseCSVText(text, delimiter, resolve, reject);
    } catch (error) {
      console.error("❌ UTF-8 parse error:", error);
      reject(
        new Error("Failed to read file in any encoding: " + error.message)
      );
    }
  };

  reader8.onerror = () => {
    reject(new Error("Failed to read file"));
  };

  reader8.readAsText(file, "UTF-8");
}

// Helper function to parse CSV text
function parseCSVText(text, delimiter, resolve, reject) {
  // Remove first 2 lines (metadata) before parsing
  const lines = text.split("\n");
  const csvContent = lines.slice(2).join("\n"); // Skip first 2 metadata lines

  console.log("Parsing CSV content starting from line 3...");

  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    delimiter: delimiter,
    transformHeader: (header) => header.trim(),
    complete: (results) => {
      try {
        console.log("Parse complete. Total rows:", results.data.length);
        console.log("Headers detected:", results.meta.fields);

        if (results.data.length > 0) {
          console.log("First row sample:", results.data[0]);
          console.log("Second row sample:", results.data[1]);
          console.log("Third row sample:", results.data[2]);
        }

        // Check if we have the Keyword column
        if (!results.meta.fields.includes("Keyword")) {
          console.error('❌ "Keyword" column not found!');
          console.log("Available columns:", results.meta.fields);
          reject(
            new Error(
              'Invalid CSV format: "Keyword" column not found. Make sure this is a Google Ads Keyword Planner export.'
            )
          );
          return;
        }

        console.log("✓ Found Keyword column!");

        // Filter out empty rows and parse keywords
        const keywords = results.data
          .filter((row) => {
            // Skip if no Keyword field
            if (!row.Keyword || row.Keyword.trim() === "") {
              return false;
            }

            // Skip if it's a header row (shouldn't happen but just in case)
            if (row.Keyword === "Keyword") {
              return false;
            }

            return true;
          })
          .map((row, index) => {
            const parseSearches = (val) => {
              if (!val) return 0;
              return parseInt(String(val).replace(/,/g, "")) || 0;
            };

            const keyword = {
              text: row.Keyword || "",
              searches: parseSearches(row["Avg. monthly searches"]),
              inAccount:
                row["In account?"] === "Y" || row["In account?"] === "Yes",
              competition: (row.Competition || "").toLowerCase(),
              competitionIndex: parseInt(
                row["Competition (indexed value)"] || 0
              ),
              currency: row.Currency || "AUD",
              topBidLow: parseFloat(row["Top of page bid (low range)"] || 0),
              topBidHigh: parseFloat(row["Top of page bid (high range)"] || 0),
            };

            if (index < 3) {
              console.log(`✓ Parsed keyword ${index}:`, keyword);
            }

            return keyword;
          });

        console.log("Total keywords after filtering:", keywords.length);

        if (keywords.length === 0) {
          console.error("❌ No keywords found after filtering");
          reject(
            new Error(
              "No valid keywords found in CSV. The file may not be in the correct Google Ads format. Check console for details."
            )
          );
        } else {
          console.log("✅ Successfully parsed", keywords.length, "keywords");
          resolve(keywords);
        }
      } catch (error) {
        console.error("❌ Parse error:", error);
        reject(new Error("Failed to parse CSV: " + error.message));
      }
    },
    error: (error) => {
      console.error("❌ Papa Parse error:", error);
      reject(new Error("CSV parsing error: " + error.message));
    },
  });
}
