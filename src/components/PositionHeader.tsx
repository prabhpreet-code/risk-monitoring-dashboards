import React, { useState } from "react";
import { FaCube, FaRegCopy, FaExternalLinkAlt } from "react-icons/fa";

const PositionHeader = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };



  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-full shadow-md border border-orange-400 space-y-4 md:space-y-0 md:space-x-4 w-full bg-white">
      <div className="flex flex-col bg-white text-center md:text-left">
        {/* Search Bar */}
        <div className="flex w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-[800px] flex rounded-lg text-lg focus:outline-none bg-transparent"
            placeholder="Search by address"
          />
        </div>
      </div>
      <div className="flex items-center justify-center md:justify-end space-x-6 text-gray-600">
        <FaCube className="w-5 h-5 cursor-pointer hover:text-gray-800" />
        <FaRegCopy className="w-5 h-5 cursor-pointer hover:text-gray-800" />
        <FaExternalLinkAlt className="w-5 h-5 cursor-pointer hover:text-gray-800" />
      </div>
    </div>
  );
};

export default PositionHeader;
