import React, { useState } from 'react';
import { Search } from 'lucide-react';
 
function SearchBar({ onSearch, placeholder = "Search...", className = "" }) {
  const [query, setQuery] = useState('');
 
  const handleOnChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };
 
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400" />
      </span>
      <input
        type="text"
        value={query}
        onChange={handleOnChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-full
          text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 transition duration-200"
      />
    </div>
  );
}
 
export default SearchBar;
 
 