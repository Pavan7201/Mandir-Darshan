import { useState, useContext, useEffect, useRef } from "react";
import "../css/TempleSearch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../AuthContext";

const TempleSearch = ({ setTemples }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [deities, setDeities] = useState([]);
  const [states, setStates] = useState([]);

  const inputRef = useRef(null);
  const suggestionBoxRef = useRef(null);

  const [showCustomPlaceholder, setShowCustomPlaceholder] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [prevPlaceholder, setPrevPlaceholder] = useState(null);
  const placeholders = ['"Temple Name"', '"District"', '"State"'];

  const { fetchTemples } = useContext(AuthContext);

useEffect(() => {
  if (!showCustomPlaceholder) return;

  const totalDuration = 2500;
  const step = totalDuration;

  const interval = setInterval(() => {
    setPlaceholderIndex((prev) => {
      setPrevPlaceholder(placeholders[prev]);
      return (prev + 1) % placeholders.length;
    });
    
    setTimeout(() => {
      setPrevPlaceholder(null);
    }, totalDuration);
  }, step);

  return () => {
    clearInterval(interval);
  };
}, [showCustomPlaceholder]);

useEffect(() => {
  setShowCustomPlaceholder(searchTerm.length === 0);
}, [searchTerm]);
  
  const fetchAndSetTemples = async (term = searchTerm) => {
    setLoading(true);
    try {
      const temples = await fetchTemples({
        searchTerm: term.trim() || undefined,
        category,
        state: selectedState,
      });

      const lowerTerm = term.trim().toLowerCase();
      const filtered = temples.filter((t) => {
        return (
          t.name?.toLowerCase().includes(lowerTerm) ||
          t.location?.district?.toLowerCase().includes(lowerTerm) ||
          t.location?.state?.toLowerCase().includes(lowerTerm)
        );
      });

      setTemples(filtered);
      return filtered;
    } catch (err) {
      console.error("Temple search error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const filterTemples = async (selectedDeity, selectedState) => {
    try {
      const temples = await fetchTemples({});
      const filtered = temples.filter((t) => {
        const tDeity = t.deity?.toLowerCase() || "";
        const tState = t.location?.state?.toLowerCase() || "";

        const deityMatch = selectedDeity
          ? tDeity.startsWith(selectedDeity.toLowerCase())
          : true;

        const stateMatch = selectedState
          ? tState === selectedState.toLowerCase()
          : true;
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
      if (!term) {
        setSuggestions([]);
        return;
      }

      const temples = await fetchTemples({ searchTerm: term.trim() || undefined });
      const nameMatches = [];
      const districtMatches = [];
      const stateMatches = [];
      const seen = new Set();
      const lowerTerm = term.toLowerCase();

      temples.forEach((t) => {
        const key = `${t.name}|${t.location?.district}|${t.location?.state}`;
        if (seen.has(key)) return;

        const name = t.name?.toLowerCase() || "";
        const district = t.location?.district?.toLowerCase() || "";
        const state = t.location?.state?.toLowerCase() || "";

        if (name.startsWith(lowerTerm)) {
          nameMatches.push(t);
          seen.add(key);
        } else if (district.startsWith(lowerTerm)) {
          districtMatches.push(t);
          seen.add(key);
        } else if (state.startsWith(lowerTerm)) {
          stateMatches.push(t);
          seen.add(key);
        }
      });

      setSuggestions([...nameMatches, ...districtMatches, ...stateMatches]);
      setSuggestionsLoaded(true);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      setSuggestions([]);
      setSuggestionsLoaded(true);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setSuggestionsLoaded(false);
      fetchAndSetTemples();
      return;
    }
    if (suppressSuggestions) return;

    const delayDebounce = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, suppressSuggestions]);

  const handleSuggestionClick = (temple) => {
    setSearchTerm(
      temple.name || temple.location?.district || temple.location?.state || ""
    );
    setCategory(temple.deity || "");
    setSelectedState(temple.location?.state || "");
    setSuggestions([]);
    setSuggestionsLoaded(false);
    setSuppressSuggestions(true);
    setShowSuggestions(false);
    fetchAndSetTemples(
      temple.name || temple.location?.district || temple.location?.state
    );
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
        const normalizedDeities = temples
          .map(t => t.deity ? t.deity.split("(")[0].trim() : null)
          .filter(Boolean);

        const uniqueDeities = [...new Set(normalizedDeities)];
        const uniqueStates = [...new Set(
          temples.map((t) => t.location?.state || null).filter(Boolean)
        )];

        setDeities(uniqueDeities);
        setStates(uniqueStates);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    loadFilters();
  }, [fetchTemples]);

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
            setSelectedState("");
            setShowSuggestions(true);
            setSuppressSuggestions(false);
            if (value.trim() === "") {
              setSuggestions([]);
              setSuggestionsLoaded(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchAndSetTemples();
          }}
          className="temple-search-input"
          ref={inputRef}
          onFocus={() => setShowCustomPlaceholder(false)}
          onBlur={() => {
            if (searchTerm.length === 0) setShowCustomPlaceholder(true);
          }}
          autoComplete="off"
        />
        {showCustomPlaceholder && (
  <div className="scroll-placeholder-wrapper" aria-hidden>
    <span className="scroll-placeholder-static">Search by</span>
    {prevPlaceholder && (
      <span
        className="scroll-placeholder-animated exit"
        key={"prev-" + prevPlaceholder}
      >
        {prevPlaceholder}
      </span>
    )}
    <span
      className="scroll-placeholder-animated enter"
      key={placeholderIndex}
    >
      {placeholders[placeholderIndex]}
    </span>
  </div>
)}

        <button
          className="temple-search-icon-button"
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
                {t.location ? `, ${t.location.district}, ${t.location.state}` : ""}
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
          filterTemples(selected, selectedState);
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
        value={selectedState}
        onChange={(e) => {
          const selected = e.target.value;
          setSelectedState(selected);
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
