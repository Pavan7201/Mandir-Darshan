import React, { useState } from "react";
import "../css/TempleSearch.css";

const TempleSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleFocus = (name) => setActiveDropdown(name);
  const handleBlur = () => setActiveDropdown(null);

  const handleSearch = () => {
    console.log("Search triggered with:", {
      searchTerm,
      category,
      state,
      sortBy,
    });
    // Need to Update search/filter logic once i get an api to fetch the data
  };

  return (
    <div className="temple-search-container">
      <input
        type="text"
        placeholder="Search temples..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="temple-search-input"
      />

      <div
        className={`custom-select-wrapper ${
          activeDropdown === "category" ? "open" : ""
        }`}
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onFocus={() => handleFocus("category")}
          onBlur={handleBlur}
          className="temple-search-select"
        >
          <option value="">All Categories</option>
          <option value="shiva">Shiva</option>
          <option value="vishnu">Vishnu</option>
          <option value="ganesha">Ganesha</option>
          <option value="devi">Devi</option>
        </select>
      </div>

      <div
        className={`custom-select-wrapper ${
          activeDropdown === "state" ? "open" : ""
        }`}
      >
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          onFocus={() => handleFocus("state")}
          onBlur={handleBlur}
          className="temple-search-select"
        >
          <option value="">All States</option>
          <option value="andhra-pradesh">Andhra Pradesh</option>
          <option value="karnataka">Karnataka</option>
          <option value="tamil-nadu">Tamil Nadu</option>
          <option value="uttar-pradesh">Uttar Pradesh</option>
          <option value="maharashtra">Maharashtra</option>
        </select>
      </div>

      <div
        className={`custom-select-wrapper ${
          activeDropdown === "sort" ? "open" : ""
        }`}
      >
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          onFocus={() => handleFocus("sort")}
          onBlur={handleBlur}
          className="temple-search-select"
        >
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="popularity">Popularity</option>
          <option value="location">Location</option>
        </select>
      </div>

      <button className="temple-search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
};

export default TempleSearch;
