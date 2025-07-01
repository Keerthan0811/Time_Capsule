import { render, screen } from '@testing-library/react';
import Create from './create';

test('renders create capsule form', () => {
  render(<Create />);
  expect(screen.getByLabelText(/text message/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/unlock date/i)).toBeInTheDocument();
});