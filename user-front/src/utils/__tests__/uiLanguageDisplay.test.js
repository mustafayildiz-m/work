import {
  getQaLanguageLabels,
  getQaLanguageSecondaryName,
} from '../uiLanguageDisplay';

const tJa = (key) => {
  const map = {
    'books.languages.Ukraynaca': 'ウクライナ語',
    'books.languages.Bulgarca': 'ブルガリア語',
    'books.languages.Japonca': '日本語',
  };
  return map[key] || key;
};

describe('uiLanguageDisplay secondary labels', () => {
  it('should not show Turkish DB name as secondary when nativeName was backfilled from name', () => {
    const lang = {
      name: 'Ukraynaca',
      nativeName: 'Ukraynaca',
      englishName: 'Ukrainian',
      iso639_3: 'ukr',
    };

    const { primary, showSecondary, secondary } = getQaLanguageLabels(lang, tJa);

    expect(primary).toBe('ウクライナ語');
    expect(showSecondary).toBe(true);
    expect(secondary).toBe('Ukrainian');
    expect(secondary).not.toBe('Ukraynaca');
  });

  it('should hide secondary entirely when only Turkish labels exist', () => {
    const lang = {
      name: 'Bulgarca',
      nativeName: 'Bulgarca',
      englishName: 'Bulgarca',
      iso639_3: 'bul',
    };

    expect(getQaLanguageSecondaryName(lang, 'ブルガリア語')).toBe('');
  });
});
