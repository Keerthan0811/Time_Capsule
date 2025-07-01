import { render, screen, fireEvent } from '@testing-library/react';
import Login from './login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('shows register form on button click', () => {
  render(<Login />);
  fireEvent.click(screen.getByText(/register/i));
  expect(screen.getByText(/register/i)).toBeInTheDocument();
});