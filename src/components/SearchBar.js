import React from 'react';
import { Search } from 'lucide-react';

/**
 * Search bar component for entering YouTube URLs
 */
const SearchBar = ({ url, onUrlChange, onSubmit }) => {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="text"
        value={url}
        onChange={onUrlChange}
        placeholder="Enter YouTube video URL (e.g., https://youtu.be/FQlCWrsUpHo)"
        aria-label="YouTube URL"
      />
      <button type="submit">
        <Search size={18} />
        <span>Analyze</span>
      </button>
    </form>
  );
};

export default SearchBar;
