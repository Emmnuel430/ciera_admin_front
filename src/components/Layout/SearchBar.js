import React, { useState, useEffect } from "react";

const SearchBar = ({ placeholder = "Recherche...", onSearch, delay = 300 }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(inputValue); // Appelle la fonction de recherche après un délai
    }, delay);

    return () => {
      clearTimeout(handler); // Nettoie le précédent timer si l'utilisateur continue à taper
    };
  }, [inputValue, onSearch, delay]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <form className="d-flex my-4">
      <input
        type="search"
        className="form-control border"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
      />
    </form>
  );
};

export default SearchBar;
