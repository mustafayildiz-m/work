import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionItem from '../components/QuestionItem';

const mockItem = {
  id: 42,
  translations: [
    {
      languageId: 1,
      question: 'What is the meaning of Tawhid?',
      answer:
        'Tawhid refers to the oneness of Allah in Islamic theology. It is the fundamental concept that forms the basis of Islamic monotheism and declares that Allah is One.',
    },
  ],
  category: {
    translations: [{ languageId: 1, name: 'Aqeedah' }],
  },
};

describe('QuestionItem', () => {
  it('should render the question title from translations', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={false} languageId={1} />,
    );
    expect(screen.getByText('What is the meaning of Tawhid?')).toBeInTheDocument();
  });

  it('should expand and show full answer on click', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={false} languageId={1} />,
    );

    expect(screen.getByTestId('question-item-42-toggle')).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByTestId('question-item-42-toggle'));

    expect(screen.getByTestId('question-item-42-toggle')).toHaveAttribute('aria-expanded', 'true');
    const answer = screen.getByTestId('question-item-42-answer');
    expect(answer.textContent).toContain('Tawhid refers to the oneness of Allah');
  });

  it('should collapse answer on second click', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={false} languageId={1} />,
    );

    const toggle = screen.getByTestId('question-item-42-toggle');
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(screen.getByTestId('question-item-42-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render category tag when expanded', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={false} languageId={1} />,
    );

    fireEvent.click(screen.getByTestId('question-item-42-toggle'));

    expect(screen.getByTestId('question-item-42-category')).toHaveTextContent('Aqeedah');
  });

  it('should show question index number', () => {
    render(
      <QuestionItem item={mockItem} index={4} isRTL={false} languageId={1} />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should set dir=rtl when isRTL is true', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={true} languageId={1} />,
    );
    const item = screen.getByTestId('question-item-42');
    expect(item).toHaveAttribute('dir', 'rtl');
  });

  it('should set dir=ltr when isRTL is false', () => {
    render(
      <QuestionItem item={mockItem} index={0} isRTL={false} languageId={1} />,
    );
    const item = screen.getByTestId('question-item-42');
    expect(item).toHaveAttribute('dir', 'ltr');
  });

  it('should not render answer block if answer is missing', () => {
    const itemWithoutAnswer = {
      ...mockItem,
      translations: [{ languageId: 1, question: 'Question only?' }],
    };
    render(
      <QuestionItem item={itemWithoutAnswer} index={0} isRTL={false} languageId={1} />,
    );

    fireEvent.click(screen.getByTestId('question-item-42-toggle'));
    expect(screen.queryByTestId('question-item-42-answer')).not.toBeInTheDocument();
  });

  it('should not render category object as React child', () => {
    const itemWithCategoryObject = {
      ...mockItem,
      category: { id: 1, translations: [] },
    };
    render(
      <QuestionItem
        item={itemWithCategoryObject}
        index={0}
        isRTL={false}
        languageId={1}
      />,
    );

    fireEvent.click(screen.getByTestId('question-item-42-toggle'));
    expect(screen.queryByTestId('question-item-42-category')).not.toBeInTheDocument();
  });
});
