# Isogram Finder

Did you know that in the 1980s, the German Language Society held a competition to find the longest German word in which no letter is repeated? The winning entry was "Heizölrückstoßabdämpfung," a completely made-up word spanning 24 unique letters with no real meaning. This fascinating quest for the perfect isogram—a word with no repeating characters—highlights the playful and creative side of language. This tool allows you to embark on your own hunt for these unique words!

## About This Project

This project provides a simple and intuitive interface to identify isograms. You can upload a text file, and the tool will display all the isograms found within it.

## Features

*   **Isogram Detection:** Identifies words that do not have repeating letters.
*   **File Upload:** Supports uploading text files (`.txt`) to search for isograms.
*   **Clear Results:** Displays the found isograms in a clean and readable list.
*   **Web-based:** Runs directly in the browser, no installation required.

## How It Works

The application reads a text file provided by the user, splits the content into words, and then checks each word to see if it's an isogram. A word is identified as an isogram if it contains no repeating letters. The results are then displayed to the user.

## Screenshots

*(Please add screenshots of your application here. You can create a `public/images` folder for them, similar to the reference project.)*

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

## Example Wordlist

This repository includes `alice.txt`, a file containing all isograms found in the classic story "Alice's Adventures in Wonderland." You can use this file to test the "Load Wordlist From File" feature and see the isogram finder in action right away.

## Project Structure

*   `src/IsogramFinder.tsx`: Contains the core logic for finding and displaying isograms.
*   `src/App.tsx`: The main application component.
*   `public/index.html`: The main HTML file for the application.
*   `package.json`: Defines project metadata and dependencies.

## Future Improvements

*   Support for different languages and character sets.
*   Option to ignore case sensitivity.
*   Displaying statistics about the found isograms (e.g., longest isogram, number of isograms found).
*   Export options for the list of isograms.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contact

For questions or feedback, please contact bytebuilder@users.noreply.github.com.

## Acknowledgements

*   [Contributor Covenant](https://www.contributor-covenant.org/) for the Code of Conduct.