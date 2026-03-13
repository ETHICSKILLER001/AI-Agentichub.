import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: string[];
}

const SearchBar = ({ onSearch, suggestions }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search agents..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;