import { render, screen } from '@testing-library/react';
import PageCard from './pagecard';

test('renders pagecard with title', () => {
  render(<PageCard title="Test Title">Content</PageCard>);
  expect(screen.getByText(/test title/i)).toBeInTheDocument();
  expect(screen.getByText(/content/i)).toBeInTheDocument();
});