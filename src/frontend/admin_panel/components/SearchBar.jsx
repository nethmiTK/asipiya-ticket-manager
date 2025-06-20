import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

const SearchBar = ({
  onSystemFilterChange,
  onCompanyFilterChange,
  selectedSystem,
  selectedCompany
}) => {
  const [systemOptions, setSystemOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch systems
        const systemsResponse = await axios.get('http://localhost:5000/system_registration');
        const systems = systemsResponse.data
          .filter(system => system.Status === 1) // Only active systems
          .map(system => ({
            value: system.SystemName,
            label: system.SystemName
          }));
        setSystemOptions(systems);

        // Fetch companies
        const companiesResponse = await axios.get('http://localhost:5000/api/companies');
        const companies = companiesResponse.data.map(company => ({
          value: company.CompanyName,
          label: company.CompanyName
        }));
        setCompanyOptions(companies);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching options:', error);
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '0.375rem',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 2
    })
  };

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-64 h-10 bg-gray-100 animate-pulse rounded"></div>
        <div className="w-full sm:w-64 h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="w-full sm:w-64">
        <Select
          options={systemOptions}
          value={selectedSystem}
          onChange={onSystemFilterChange}
          placeholder="Filter by System"
          isClearable
          className="text-sm"
          classNamePrefix="select"
          styles={customStyles}
        />
      </div>
      <div className="w-full sm:w-64">
        <Select
          options={companyOptions}
          value={selectedCompany}
          onChange={onCompanyFilterChange}
          placeholder="Filter by Company"
          isClearable
          className="text-sm"
          classNamePrefix="select"
          styles={customStyles}
        />
      </div>
    </div>
  );
};

export default SearchBar; 