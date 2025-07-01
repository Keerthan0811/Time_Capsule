import { render, screen } from '@testing-library/react';
import Unlock from './unlock';

test('shows loading initially', () => {
  render(<Unlock />);
  expect(screen.getByText(/loading unlocked capsules/i)).toBeInTheDocument();
});