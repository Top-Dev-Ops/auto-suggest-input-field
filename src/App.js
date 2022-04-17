import React, { useEffect, useState, useCallback, useRef } from 'react';

function debounce(callback, wait) {
  let timerId;
  return function (...args) {
    const context = this;
    if(timerId) clearTimeout(timerId)
    timerId = setTimeout(() => {
      timerId = null
      callback.apply(context,  args)
    }, wait);
  };
}

function App() {

  const [characters, setCharacters] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const input = useRef();

  const onChange = (e) => {
    setShowResult(false);
    setSearchTerm(e.target.value);
  }

  const debounceChange = useCallback(debounce(onChange, 300), []);

  const onClick = (characterName) => {
    setSuggestions(null);
    setSearchTerm('');
    input.current.value = characterName;
    setSuggestion(
      suggestions.find(temp => temp.name === characterName)
    );
  }

  const onSearch = () => setShowResult(true);

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://gateway.marvel.com/v1/public/characters?apikey=${process.env.REACT_APP_PUBLIC_KEY}`)
        .then(response => response.json())
        .then(data => {
          setCharacters(data.data.results);
        });
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setSuggestions(null);
    } else if (!!characters) {
      setSuggestions(
        characters.filter(character => character.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  }, [searchTerm, characters]);

  return (
    <>
      <h3>Search</h3>
      <div className="row">
        <div>
          <input
            type="text"
            placeholder="Search terms"
            onChange={debounceChange}
            ref={input}
          />
          <ul className="suggestions">
            {!!suggestions && suggestions.map(temp => (
              <li key={temp.id} onClick={() => onClick(temp.name)}>
                {temp.name}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className={suggestions || suggestion ? null : 'disabled'}
          onClick={onSearch}
        >
          SEARCH
        </button>
      </div>
      {showResult && (
        <div>
          <div className="contents">
            <label className="font-weight-bold flex-1">ID:</label>
            <span className="flex-1">{suggestion.id}</span>
          </div>
          <div className="contents">
            <label className="font-weight-bold flex-1">Name:</label>
            <span className="flex-1">{suggestion.name}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
