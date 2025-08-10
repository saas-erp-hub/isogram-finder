# Isogram Finder

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open-brightgreen?style=for-the-badge)](https://isogram-finder.vercel.app)

Did you know that in the 1980s, the German Language Society held a competition to find the longest German word in which no letter is repeated? The winning entry was "Heizölrückstoßabdämpfung," a completely made-up word spanning 24 unique letters with no real meaning. This fascinating quest for the perfect isogram—a word with no repeating characters—highlights the playful and creative side of language. This tool allows you to embark on your own hunt for these unique words!

### Important Note on Generated Content

Please note: This tool algorithmically combines words from the text files you provide. The results are automatically generated and not editorially reviewed. It is therefore possible that random word combinations may unintentionally appear offensive, insulting, or inappropriate. Use at your own risk.

## About This Project

This project provides a simple and intuitive interface to identify isograms. You can upload a text file, and the tool will display all the isograms found within it.

## Screenshots

Here is the main user interface, where you can load your wordlist and configure the search.

![Main application interface showing the wordlist editor and configuration panel.](https://raw.githubusercontent.com/saas-erp-hub/isogram-finder/main/public/images/screenshot-overview.png)

After running a search, the results are displayed on the right, sorted by score or length.

![Results view showing a list of found isogram combinations with their scores and lengths.](https://raw.githubusercontent.com/saas-erp-hub/isogram-finder/main/public/images/screenshot-results.png)

## Features

*   **Advanced Isogram Search:** Finds combinations of isograms that together form a longer isogram.
*   **Multiple Search Modes:** Offers different algorithms to find results, from brute-force to smart heuristics.
*   **Sophisticated Scoring:** Ranks results not just by length, but by a score that considers word length and linguistic patterns.
*   **File Management:** Supports uploading and saving wordlists directly from the browser.
*   **Web-based & Performant:** Runs entirely in your browser, using a Web Worker to keep the UI responsive during intensive searches.

## How It Works

The application reads a text file provided by the user, cleans the list to keep only valid isograms, and then uses a backtracking algorithm to find combinations of these words that don't share any letters.

### Search Modes

You can choose between three different search algorithms:

*   **Classic:** The most thorough mode. It attempts to combine every word with every other valid word in the list. This guarantees finding the best possible results but can be very slow with large wordlists.
*   **Split:** A performance-optimized mode. It uses only a user-defined number of the longest words from your list as starting points for the search. This is much faster and is based on the assumption that the longest combinations will likely start with the longest words.
*   **High-Low:** A creative mode that searches for combinations by mixing the longest words with the shortest words (minimum 4 characters) from your list. This can uncover interesting results that other modes might miss.

## Setup and Usage

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/saas-erp-hub/isogram-finder.git
    cd isogram-finder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the project:**
    ```bash
    npm start
    ```
    The project will open in your browser at `http://localhost:3000` (or a similar port).

## Using Your Own Wordlists

While the application provides default wordlists, you can easily use your own text. Simply paste any text (e.g., a book, an article, or a custom list) into the wordlist area within the application. Then, click the **"Prepare Wordlist"** button. The tool will automatically process your input, axtract all valid isograms (words with unique letters), and clean them up, making them ready for your search. You can then save this prepared list for future use.

## Project Structure

*   `src/IsogramFinder.tsx`: The main React component for the user interface.
*   `src/search.worker.ts`: The Web Worker containing the core search and scoring logic.
*   `src/App.tsx`: The main application component.
*   `public/index.html`: The main HTML file for the application.
*   `package.json`: Defines project metadata and dependencies.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For questions or feedback, please [open an issue](https://github.com/saas-erp-hub/isogram-finder/issues/new).

## Acknowledgements

*   [Contributor Covenant](https://www.contributor-covenant.org/) for the Code of Conduct.