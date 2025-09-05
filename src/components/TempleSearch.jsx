import { useState, useContext, useEffect, useRef } from "react";
import "../css/TempleSearch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../AuthContext";

const TempleSearch = ({ setTemples }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [deities, setDeities] = useState([]);
  const [states, setStates] = useState([]);

  const inputRef = useRef(null);
  const [showCustomPlaceholder, setShowCustomPlaceholder] = useState(true);

  const suggestionBoxRef = useRef(null);
  const { fetchTemples } = useContext(AuthContext);

  const fetchAndSetTemples = async (term = searchTerm) => {
    setLoading(true);
    try {
      const temples = await fetchTemples({
        searchTerm: term.trim() || undefined,
        category,
        state,
        sortBy: sortBy === "" ? "id" : sortBy,
      });
      setTemples(temples);
      return temples;
    } catch (err) {
      console.error("Temple search error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const filterTemples = async (selectedDeity, selectedState) => {
  try {
    const temples = await fetchTemples({ searchTerm: undefined });

    const filtered = temples.filter((t) => {
      const tState = t.location ? t.location.split(",").slice(-1)[0].trim() : "";
      const deityMatch = selectedDeity ? t.deity?.startsWith(selectedDeity) : true;
      const stateMatch = selectedState ? tState === selectedState : true;
      return deityMatch && stateMatch;
    });

    setTemples(filtered);
  } catch (err) {
    console.error("Error filtering temples:", err);
    setTemples([]);
  }
};

  const fetchSuggestions = async (term) => {
    try {
      const temples = await fetchTemples({
        searchTerm: term.trim() || undefined,
      });
      const uniqueSuggestions = [];
      const seen = new Set();
      temples.forEach((t) => {
        const startsWithMatch =
          t.name?.toLowerCase().startsWith(term.toLowerCase()) ||
          t.location?.toLowerCase().startsWith(term.toLowerCase());
        if (startsWithMatch && !seen.has(t.name + t.location)) {
          uniqueSuggestions.push(t);
          seen.add(t.name + t.location);
        }
      });
      setSuggestions(uniqueSuggestions.slice(0, 6));
      setSuggestionsLoaded(true);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      setSuggestions([]);
      setSuggestionsLoaded(true);
    }
  };

  useEffect(() => {
    if (suppressSuggestions) {
      setSuppressSuggestions(false);
      return;
    }
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setSuggestionsLoaded(false);
      fetchAndSetTemples(); 
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSuggestionClick = (temple) => {
    setSearchTerm(temple.name || "");
    setCategory(temple.deity || "");
    if (temple.location) {
      const parts = temple.location.split(",");
      setState(parts[parts.length - 1].trim());
    }
    setSuggestions([]);
    setSuggestionsLoaded(false);
    setSuppressSuggestions(true);
    setShowSuggestions(false);
    fetchAndSetTemples(temple.name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  const loadFilters = async () => {
    try {
      const temples = await fetchTemples({});
      const deityMap = {};
      temples.forEach((t) => {
        if (!t.deity) return;
        const words = t.deity.split(" ");
        const key = words.slice(0, 2).join(" "); 
        if (!deityMap[key]) deityMap[key] = [];
        deityMap[key].push(t.deity);
      });
      const uniqueDeities = Object.keys(deityMap);

      const uniqueStates = [
        ...new Set(
          temples
            .map((t) => {
              if (t.location) {
                const parts = t.location.split(",");
                return parts[parts.length - 1].trim();
              }
              return null;
            })
            .filter(Boolean)
        ),
      ];

      setDeities(uniqueDeities);
      setStates(uniqueStates);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };
  loadFilters();
}, [fetchTemples]);

useEffect(() => {
    setShowCustomPlaceholder(searchTerm.length === 0);
  }, [searchTerm]);

  const handleFocus = () => setShowCustomPlaceholder(false);
  const handleBlur = () => {
    if (searchTerm.length === 0) setShowCustomPlaceholder(true);
  };

  return (
    <section
      className="temple-search-container animate-on-scroll"
      ref={suggestionBoxRef}
    >
      <div className="temple-search-input-wrapper">
        <input
          type="text"
          placeholder=""
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            setCategory("");
            setState("");
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchAndSetTemples();
          }}
          className="temple-search-input"
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
        />
        {showCustomPlaceholder && (
          <span className="scroll-placeholder">
            Search Temples by Temple Name or State.
          </span>
        )}
        <button className="temple-search-icon-button"
          onClick={() => fetchAndSetTemples()}
          aria-label="Search"
          type="button"
        >
          
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>

      {showSuggestions && searchTerm.trim() && (
        <ul className="temple-suggestions-list">
          {suggestions.length > 0 ? (
            suggestions.map((t, i) => (
              <li
                key={i}
                className="temple-suggestion-item"
                onClick={() => handleSuggestionClick(t)}
              >
                {t.name}
                {t.location ? `, ${t.location}` : ""}
              </li>
            ))
          ) : (
            suggestionsLoaded && (
              <li className="temple-suggestion-item no-result">
                No temples found
              </li>
            )
          )}
        </ul>
      )}

      <select
  value={category}
  onChange={(e) => {
    const selected = e.target.value;
    setCategory(selected);
    filterTemples(selected, state);
  }}
  className="temple-search-select"
>
  <option value="">All Deity</option>
  {deities.map((d, i) => (
    <option key={i} value={d}>
      {d}
    </option>
  ))}
</select>

<select
  value={state}
  onChange={(e) => {
    const selected = e.target.value;
    setState(selected);
    filterTemples(category, selected);
  }}
  className="temple-search-select"
>
  <option value="">All States</option>
  {states.map((s, i) => (
    <option key={i} value={s}>
      {s}
    </option>
  ))}
</select>
    </section>
  );
};

export default TempleSearch;
