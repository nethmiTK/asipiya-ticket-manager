import React, { useState } from 'react';
import Select from 'react-select';

const SearchBar = ({
  systemFilter,
  companyFilter,
  onSystemFilterChange,
  onCompanyFilterChange,
  systems = [],
  companies = []
}) => {
  // Convert arrays to react-select format
  const systemOptions = systems.map(system => ({
    value: system.id || system,
    label: system.name || system
  }));

  const companyOptions = companies.map(company => ({
    value: company.id || company,
    label: company.name || company
  }));

  return (
    <div className="flex gap-4 mb-4">
      <div className="w-64">
        <Select
          options={systemOptions}
          value={systemFilter}
          onChange={onSystemFilterChange}
          placeholder="Filter by System"
          isClearable
          className="text-sm"
          classNamePrefix="select"
        />
      </div>
      <div className="w-64">
        <Select
          options={companyOptions}
          value={companyFilter}
          onChange={onCompanyFilterChange}
          placeholder="Filter by Company"
          isClearable
          className="text-sm"
          classNamePrefix="select"
        />
      </div>
    </div>
  );
};

export default SearchBar; 