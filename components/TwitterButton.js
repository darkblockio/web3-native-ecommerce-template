import React from 'react';
import styles from "../styles/Home.module.css";

function TwitterButton({ tweetText }) {
    const base = 'https://twitter.com/intent/tweet';
    const text = encodeURIComponent(tweetText); // Use props to set the tweet text
    const url = `${base}?text=${text}`;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer">
            <button
            className={`${styles.twitterButton}`}
            >
                Tweet Now
            </button>
        </a>
    );
}

export default TwitterButton;
