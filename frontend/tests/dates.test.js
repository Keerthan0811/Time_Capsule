import { render, screen } from '@testing-library/react';
import Dates from './dates';

test('shows loading initially', () => {
  render(<Dates />);
  expect(screen.getByText(/loading unlock dates/i)).toBeInTheDocument();
});