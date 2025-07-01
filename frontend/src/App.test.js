import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login/register page', () => {
  render(<App />);
  expect(screen.getByText(/login\/register/i)).toBeInTheDocument();
});
