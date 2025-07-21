import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the IsogramFinder component
jest.mock('./IsogramFinder', () => () => (
  <div data-testid="isogram-finder-mock">Isogram Finder Mock</div>
));

test('renders the main app container with the mocked IsogramFinder', () => {
  render(<App />);
  
  // Check if the main App div is present
  const appElement = screen.getByRole('main');
  expect(appElement).toBeInTheDocument();

  // Check if the mocked component is rendered
  const mockElement = screen.getByTestId('isogram-finder-mock');
  expect(mockElement).toBeInTheDocument();
  expect(mockElement).toHaveTextContent('Isogram Finder Mock');
});
