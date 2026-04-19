export interface Passage {
  id: number;
  title: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
  'most', 'us', 'is', 'was', 'are', 'been', 'being', 'has', 'had', 'does', 'did', 'would', 'could', 'should', 'may', 'might', 'can',
  'must', 'shall', 'very', 'too', 'just', 'still', 'also', 'again', 'great', 'right', 'little', 'last', 'long', 'hand', 'tell', 'ask', 'found', 'made'
];

export const generateTypingTestText = (): string => {
  const wordCount = 100;
  let text = '';
  for (let i = 0; i < wordCount; i++) {
    const word = commonWords[Math.floor(Math.random() * commonWords.length)];
    text += word + ' ';
  }
  return text.trim();
};

const defaultBookPassage: Passage = {
  id: 0,
  title: 'Book Passage',
  text: 'The local book passage could not be loaded. Please refresh and try again.',
  difficulty: 'medium',
};

const books = [
  {
    title: 'The Count of Monte Cristo',
    path: '/books/count-of-monte-cristo.txt',
  },
  {
    title: 'The Three Musketeers',
    path: '/books/three-musketeers.txt',
  },
];

const getRandomItem = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const cleanBookText = (text: string): string => {
  const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK';
  const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK';
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);
  const withoutHeader = startIndex >= 0 ? text.slice(text.indexOf('\n', startIndex) + 1) : text;
  const bookText = endIndex >= 0 ? withoutHeader.slice(0, endIndex) : withoutHeader;

  return bookText
    .replace(/\r/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
};

const isMeaningfulParagraph = (paragraph: string): boolean => {
  const words = paragraph.split(/\s+/);
  const letters = paragraph.replace(/[^a-z]/gi, '');
  const uppercaseLetters = paragraph.replace(/[^A-Z]/g, '');
  const uppercaseRatio = letters.length > 0 ? uppercaseLetters.length / letters.length : 0;

  return (
    paragraph.length >= 180 &&
    paragraph.length <= 650 &&
    words.length >= 35 &&
    words.length <= 120 &&
    /[.!?]$/.test(paragraph) &&
    uppercaseRatio < 0.35 &&
    !/^chapter\b/i.test(paragraph) &&
    !/^book\b/i.test(paragraph) &&
    !/^volume\b/i.test(paragraph) &&
    !/\bcontents\b/i.test(paragraph) &&
    !/\bproject gutenberg\b/i.test(paragraph) &&
    !/\bproduced by\b/i.test(paragraph)
  );
};

const getMeaningfulPassages = (text: string): string[] => {
  return cleanBookText(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(isMeaningfulParagraph);
};

export const fetchBookPassage = async (): Promise<Passage> => {
  const book = getRandomItem(books);

  try {
    const response = await fetch(book.path);
    if (!response.ok) {
      throw new Error(`Book request failed with status ${response.status}`);
    }

    const text = await response.text();
    const passages = getMeaningfulPassages(text);
    if (passages.length === 0) {
      throw new Error('No readable passages found in book text');
    }

    return {
      id: Math.random(),
      title: book.title,
      text: getRandomItem(passages),
      difficulty: 'medium',
    };
  } catch (error) {
    console.error('Failed to fetch book passage:', error);
    return defaultBookPassage;
  }
};
