// Global variable to store the dictionary
let dictionary = [];
let reverse_mode = false;

// Function to compute the sequence alignment between two words
function sequenceAlignment(word1, word2) {
    // Default penalties
    const gap_penalty = 2;
    const vowel_vowel_mismatch = 1;
    const consonant_consonant_mismatch = 1;
    const vowel_consonant_mismatch = 3;

    return levenshteinDistance(
        word1,
        word2,
        gap_penalty,
        vowel_vowel_mismatch,
        consonant_consonant_mismatch,
        vowel_consonant_mismatch
    );
}

function levenshteinDistance(
    word1,
    word2,
    gap_penalty,
    vowel_vowel_mismatch,
    consonant_consonant_mismatch,
    vowel_consonant_mismatch
) {
    const m = word1.length;
    const n = word2.length;

    // Initialize the DP table
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Fill the base cases for gaps
    for (let i = 1; i <= m; i++) dp[i][0] = i * gap_penalty;
    for (let j = 1; j <= n; j++) dp[0][j] = j * gap_penalty;

    // Fill the DP table with appropriate gap and mismatch penalties
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let cost = 0;

            if (word1[i - 1] === word2[j - 1]) {
                cost = 0; // Match
            } else {
                // Determine mismatch cost
                const isVowel1 = isVowel(word1[i - 1]);
                const isVowel2 = isVowel(word2[j - 1]);
                if (isVowel1 && isVowel2) {
                    cost = vowel_vowel_mismatch;
                } else if (!isVowel1 && !isVowel2) {
                    cost = consonant_consonant_mismatch;
                } else {
                    cost = vowel_consonant_mismatch;
                }
            }

            // DP recurrence relation with penalties for match, insert, and delete
            dp[i][j] = Math.min(
                dp[i - 1][j - 1] + cost, // Match/mismatch
                dp[i - 1][j] + gap_penalty, // Deletion
                dp[i][j - 1] + gap_penalty // Insertion
            );
        }
    }

    return dp[m][n];
}

// Helper function to check if a character is a vowel
function isVowel(c) {
    return 'aeiou'.includes(c.toLowerCase());
}

// Function to return an array of the 10 closest words to the input word
function closestWords(word, dictionary) {
    // Find the closest words
    const distances = [];

    for (const w of dictionary) {
        if (w.trim().length === 0) continue; // Skip empty lines
        const dist = sequenceAlignment(word, w);
        distances.push({ dist, word: w });
    }

    // Sort the distances
    distances.sort((a, b) => a.dist - b.dist);

    // Return the 10 closest words
    const numResults = Math.min(10, distances.length);
    const closest = distances.slice(0, numResults).map((entry) => entry.word);

    return closest;
}

// Function to load the dictionary data from a file using fetch API
async function loadDictionary() {
    try {
        const response = await fetch('dictionary.txt');
        if (!response.ok) {
            throw new Error(
                'Network response was not ok ' + response.statusText
            );
        }
        const text = await response.text();
        const dictionary = text.split(/\r?\n/);
        return dictionary;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Easter egg: Form Submissions
document.getElementById('spellCheckerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Add the rotation animation class to the body
    const word = document.getElementById('inputWord').value.trim().toLowerCase();
    if (word === 'do a barrel roll') {
        document.body.classList.add('rotate-animation');
    
        // Remove the rotation animation class after 2 seconds
        setTimeout(() => {
            document.body.classList.remove('rotate-animation');
        }, 2000);
    }
    if (word === 'reverse') {
        reverse_mode = !reverse_mode;
        let results = closestWords(word, dictionary);

        // get the title element 
        let title = document.getElementById('title');
        title.textContent = title.textContent.split('').reverse().join('');

        // get the subtitle element
        let subtitle = document.getElementById('subtitle');
        subtitle.textContent = subtitle.textContent.split('').reverse().join('');

        // get the placeholder text for the input field
        let inputField = document.getElementById('inputWord');
        inputField.placeholder = inputField.placeholder.split('').reverse().join('');

        // get the createdBy element
        let createdBy = document.getElementById('createdBy');
        createdBy.textContent = createdBy.textContent.split('').reverse().join('');

        // get the results-title element
        let resultsTitle = document.querySelector('.results-title h3');
        resultsTitle.textContent = resultsTitle.textContent.split('').reverse().join('');


        window.displayResults(results.reverse());
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const inputField = document.getElementById('inputWord');
    const resultsContainer = document.getElementById('results');
    let word = '';

    // Load the dictionary once when the page loads
    dictionary = await loadDictionary();

    if (!dictionary) {
        alert('Failed to load dictionary.');
        return;
    }

    inputField.addEventListener('input', () => {
        word = inputField.value.trim();
        const similarWords = getSimilarWords(word);
        displayResults(similarWords);

        // Check if we're on mobile
        if (window.innerWidth <= 768) {
            if (word.length > 0) {
                document.body.classList.add('user-is-typing');
            } else {
                document.body.classList.remove('user-is-typing');
            }
        }
    });
    
    function getSimilarWords(word) {
        if (word === '') {
            return [];
        }
        if (word.length > 40) {
            return [];
        }
        return closestWords(word, dictionary);
    }
    
    window.displayResults = displayResults;
    function displayResults(results) {
        const resultsContainer = document.getElementById('results');
        const subtitle = document.getElementById('subtitle');
        
        // If results are empty, remove 'active' class and clear content
        if (results.length === 0) {
            resultsContainer.classList.remove('active');
            document.querySelector('.subtitle').classList.add('visible');
            resultsContainer.innerHTML = '';
            return;
        } else {
            document.querySelector('.subtitle').classList.remove('visible');
            resultsContainer.classList.add('active');
        }

        // Clear previous results
        resultsContainer.innerHTML = '';

        // Create the results-title div with h3 tag
        const resultsTitle = document.createElement('div');
        resultsTitle.classList.add('results-title');
        const title = document.createElement('h3');
        if (reverse_mode) {
            title.textContent = 'dsroW ralimiS:';
        } else {
            title.textContent = 'Similar Words:';
        }
        resultsTitle.appendChild(title);

        // Append the results-title div to the results container
        resultsContainer.appendChild(resultsTitle);

        // Create the two-column container
        const columnContainer = document.createElement('div');
        columnContainer.classList.add('column-container');

        // Create two columns
        const column1 = document.createElement('div');
        const column2 = document.createElement('div');
        column1.classList.add('column');
        column2.classList.add('column');

        // if reverse mode is enabled, loop through each result and reverse it
        if (reverse_mode) {
            results = results.map(result => result.split('').reverse().join(''));
        }

        // Distribute results between the two columns
        results.forEach((result, index) => {
            const item = document.createElement('div');
            item.classList.add('result-item');
            item.textContent = result;

            // Check if the result-item is equal to the input word
            if (result === word) {
                const checkbox = document.createElement('i');
                checkbox.classList.add('fas', 'fa-check');
                item.appendChild(checkbox);
            }

            // Append to one of the two columns
            if (index % 2 === 0) {
                column1.appendChild(item);
            } else {
                column2.appendChild(item);
            }
        });

        columnContainer.appendChild(column1);
        columnContainer.appendChild(column2);
        resultsContainer.appendChild(columnContainer);
}

document.addEventListener('click', function(event) {
    // If the click is outside the resultsContainer and inputField, hide the results
    if (!resultsContainer.contains(event.target) && !inputField.contains(event.target)) {
        resultsContainer.classList.remove('active');
        resultsContainer.innerHTML = '';
    }

    // If the input bar is clicked, show the results
    if (inputField.contains(event.target)) {
        word = inputField.value.trim();
        const similarWords = getSimilarWords(word);
        displayResults(similarWords);
    }
});
    
});
