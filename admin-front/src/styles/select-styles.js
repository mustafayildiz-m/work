// Tema algılama fonksiyonu
export const getTheme = () => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

// Dark mode için React Select stilleri
export const selectStylesDark = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgb(55 65 81)', // gray-700
    borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(75 85 99)', // blue-500 : gray-600
    color: 'rgb(243 244 246)', // gray-100
    boxShadow: state.isFocused ? '0 0 0 1px rgb(59 130 246)' : 'none',
    '&:hover': {
      borderColor: 'rgb(75 85 99)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(55 65 81)', // gray-700
    border: '1px solid rgb(75 85 99)', // gray-600
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'rgb(59 130 246)' // blue-500
      : state.isFocused 
        ? 'rgb(75 85 99)' // gray-600
        : 'rgb(55 65 81)', // gray-700
    color: state.isSelected 
      ? 'white' 
      : 'rgb(243 244 246)', // gray-100
    '&:hover': {
      backgroundColor: state.isSelected 
        ? 'rgb(59 130 246)' // blue-500
        : 'rgb(75 85 99)', // gray-600
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'rgb(243 244 246)', // gray-100
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgb(156 163 175)', // gray-400
  }),
  input: (provided) => ({
    ...provided,
    color: 'rgb(243 244 246)', // gray-100
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'rgb(156 163 175)', // gray-400
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: 'rgb(156 163 175)', // gray-400
  }),
};

// Light mode için React Select stilleri
export const selectStylesLight = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(209 213 219)', // blue-500 : gray-300
    color: 'rgb(17 24 39)', // gray-900
    boxShadow: state.isFocused ? '0 0 0 1px rgb(59 130 246)' : 'none',
    '&:hover': {
      borderColor: 'rgb(156 163 175)', // gray-400
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    border: '1px solid rgb(209 213 219)', // gray-300
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'rgb(59 130 246)' // blue-500
      : state.isFocused 
        ? 'rgb(243 244 246)' // gray-100
        : 'white',
    color: state.isSelected 
      ? 'white' 
      : 'rgb(17 24 39)', // gray-900
    '&:hover': {
      backgroundColor: state.isSelected 
        ? 'rgb(59 130 246)' // blue-500
        : 'rgb(243 244 246)', // gray-100
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'rgb(17 24 39)', // gray-900
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgb(107 114 128)', // gray-500
  }),
  input: (provided) => ({
    ...provided,
    color: 'rgb(17 24 39)', // gray-900
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'rgb(107 114 128)', // gray-500
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: 'rgb(107 114 128)', // gray-500
  }),
};

// Tema değişikliğine göre dinamik stil döndüren fonksiyon
export const getSelectStyles = (theme = null) => {
  const currentTheme = theme || getTheme();
  return currentTheme === 'dark' ? selectStylesDark : selectStylesLight;
};

// Varsayılan olarak mevcut tema stilini döndüren fonksiyon
export const selectStyles = getSelectStyles();
