import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt-BR' | 'en-US';

export interface Translations {
  // Brand & Header
  appName: string;
  appSubtitle: string;
  cloudBadge: string;
  library: string;
  allHighlights: string;
  flashcardsStudy: string;
  contextAuthors: string;
  search: string;
  searchPlaceholder: string;
  tourGuide: string;
  syncCloud: string;
  readingStreak: string;
  settings: string;
  language: string;
  signOut: string;
  
  // Library Header & Metrics
  libraryTitle: string;
  librarySubtitle: string;
  booksCount: string;
  highlightsCount: string;
  flashcardsCount: string;
  resetHistory: string;
  resetConfirm: string;
  newBook: string;
  
  // Filters & Tabs
  allBooks: string;
  booksTab: string;
  studyTab: string;
  paperTab: string;
  
  // View Switchers
  viewGrid: string;
  viewByYear: string;
  viewByGenre: string;
  viewCompact: string;
  
  // Year & Genre Filtering
  filterYear: string;
  allYears: string;
  filterGenre: string;
  allGenres: string;
  filterStatus: string;
  allStatus: string;
  
  // Status Labels
  statusReading: string;
  statusCompleted: string;
  statusWantToRead: string;
  
  // Sort
  sortByRecent: string;
  sortByHighlights: string;
  sortByTitle: string;
  sortByRating: string;
  
  // Empty & Search States
  noResultsTitle: string;
  noResultsSubtitle: string;
  emptyLibraryTitle: string;
  emptyLibrarySubtitle: string;
  addFirstBook: string;
  
  // Year & Genre Section Headings
  readInYear: string;
  booksInYear: string;
  genreCategory: string;
  booksInGenre: string;
  
  // Settings Modal
  settingsTitle: string;
  settingsDesc: string;
  chooseLanguage: string;
  portugueseBR: string;
  englishUS: string;
  syncAccountInfo: string;
  dataIsolationInfo: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    appName: 'App de leitura',
    appSubtitle: 'Estúdio de leitura e anotações',
    cloudBadge: 'Nuvem',
    library: 'Biblioteca',
    allHighlights: 'Todos os grifos',
    flashcardsStudy: 'Flashcards e estudo',
    contextAuthors: 'Contexto e autores',
    search: 'Buscar',
    searchPlaceholder: 'Buscar livro, autor ou citação...',
    tourGuide: 'Guia de funcionalidades',
    syncCloud: 'Sincronização na nuvem e backup',
    readingStreak: 'Dias seguidos de leitura',
    settings: 'Configurações',
    language: 'Idioma',
    signOut: 'Sair da conta',

    libraryTitle: 'Minha biblioteca de leituras e grifos',
    librarySubtitle: 'Escaneie páginas físicas, organize citações por cor, consulte o contexto e sincronize com o Notion.',
    booksCount: 'Livros',
    highlightsCount: 'Citações',
    flashcardsCount: 'Flashcards',
    resetHistory: 'Zerar histórico',
    resetConfirm: 'Deseja realmente apagar todos os livros e dados da sua conta?',
    newBook: 'Novo livro',

    allBooks: 'Todos os livros',
    booksTab: 'Livros',
    studyTab: 'Estudos',
    paperTab: 'Artigos e ensaios',

    viewGrid: 'Grade',
    viewByYear: 'Por ano de leitura',
    viewByGenre: 'Por gênero',
    viewCompact: 'Lista compacta',

    filterYear: 'Ano de leitura',
    allYears: 'Todos os anos',
    filterGenre: 'Gênero literário',
    allGenres: 'Todos os gêneros',
    filterStatus: 'Status de leitura',
    allStatus: 'Todos os status',

    statusReading: 'Lendo atualmente',
    statusCompleted: 'Concluído',
    statusWantToRead: 'Quero ler',

    sortByRecent: 'Recentes',
    sortByHighlights: 'Grifos',
    sortByTitle: 'Título',
    sortByRating: 'Avaliação',

    noResultsTitle: 'Nenhum resultado encontrado',
    noResultsSubtitle: 'Nenhum livro corresponde aos filtros selecionados. Tente alterar a busca.',
    emptyLibraryTitle: 'Biblioteca pronta para iniciar',
    emptyLibrarySubtitle: 'Seu acervo está zerado. Adicione seu primeiro livro para começar a escanear páginas e salvar suas citações do zero.',
    addFirstBook: 'Adicionar meu primeiro livro',

    readInYear: 'Lidos em',
    booksInYear: 'livros neste ano',
    genreCategory: 'Gênero',
    booksInGenre: 'livros cadastrados',

    settingsTitle: 'Configurações do aplicativo',
    settingsDesc: 'Personalize o idioma, visualize seu status de sincronização e opções de exibição.',
    chooseLanguage: 'Idioma da interface',
    portugueseBR: 'Português (Brasil)',
    englishUS: 'English (US)',
    syncAccountInfo: 'Sincronização entre computador e celular',
    dataIsolationInfo: 'Seus dados são salvos na nuvem e isolados por conta de usuário com segurança.',
    close: 'Fechar',
  },
  'en-US': {
    appName: 'Reading App',
    appSubtitle: 'Reading studio & highlights',
    cloudBadge: 'Cloud',
    library: 'Library',
    allHighlights: 'All highlights',
    flashcardsStudy: 'Flashcards & study',
    contextAuthors: 'Context & authors',
    search: 'Search',
    searchPlaceholder: 'Search book, author, or quote...',
    tourGuide: 'Feature guide',
    syncCloud: 'Cloud sync & backup',
    readingStreak: 'Reading streak',
    settings: 'Settings',
    language: 'Language',
    signOut: 'Sign out',

    libraryTitle: 'My reading & highlight library',
    librarySubtitle: 'Scan physical book pages, color-code quotes, enrich context, and sync to Notion.',
    booksCount: 'Books',
    highlightsCount: 'Quotes',
    flashcardsCount: 'Flashcards',
    resetHistory: 'Reset library',
    resetConfirm: 'Are you sure you want to delete all books and notes in your account?',
    newBook: 'New book',

    allBooks: 'All books',
    booksTab: 'Books',
    studyTab: 'Study decks',
    paperTab: 'Papers & essays',

    viewGrid: 'Grid',
    viewByYear: 'By reading year',
    viewByGenre: 'By genre',
    viewCompact: 'Compact list',

    filterYear: 'Reading year',
    allYears: 'All years',
    filterGenre: 'Genre',
    allGenres: 'All genres',
    filterStatus: 'Status',
    allStatus: 'All statuses',

    statusReading: 'Currently reading',
    statusCompleted: 'Completed',
    statusWantToRead: 'Want to read',

    sortByRecent: 'Recent',
    sortByHighlights: 'Highlights',
    sortByTitle: 'Title',
    sortByRating: 'Rating',

    noResultsTitle: 'No results found',
    noResultsSubtitle: 'No books match the selected filters. Try adjusting your search query.',
    emptyLibraryTitle: 'Library ready to start',
    emptyLibrarySubtitle: 'Your collection is empty. Add your first book to start scanning pages and collecting your favorite quotes.',
    addFirstBook: 'Add my first book',

    readInYear: 'Read in',
    booksInYear: 'books this year',
    genreCategory: 'Genre',
    booksInGenre: 'books cataloged',

    settingsTitle: 'App settings',
    settingsDesc: 'Customize language, view synchronization status, and display options.',
    chooseLanguage: 'Interface language',
    portugueseBR: 'Português (Brasil)',
    englishUS: 'English (US)',
    syncAccountInfo: 'Cross-device synchronization (PC & mobile)',
    dataIsolationInfo: 'Your data is securely saved in the cloud and strictly isolated to your user account.',
    close: 'Close',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'pt-BR',
  setLanguage: () => {},
  t: translations['pt-BR'],
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_reading_lang');
    return saved === 'en-US' ? 'en-US' : 'pt-BR';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_reading_lang', lang);
      document.documentElement.lang = lang === 'en-US' ? 'en' : 'pt-BR';
    } catch (e) {
      console.warn('Could not save language preference to localStorage', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language === 'en-US' ? 'en' : 'pt-BR';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};
