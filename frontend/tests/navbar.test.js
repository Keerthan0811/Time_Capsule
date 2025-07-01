import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './navbar';

test('renders navbar title', () => {
  render(<Navbar isLoggedIn={false} />);
  expect(screen.getByText(/welcome to time capsule/i)).toBeInTheDocument();
});

test('toggles theme', () => {
  const toggleTheme = jest.fn();
  render(<Navbar isLoggedIn={true} theme="light" onToggleTheme={toggleTheme} />);
  fireEvent.click(screen.getByLabelText(/toggle theme/i));
  expect(toggleTheme).toHaveBeenCalled();
});