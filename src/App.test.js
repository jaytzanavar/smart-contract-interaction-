import { render, screen } from '@testing-library/react';
import App from './App';
import Web3 from 'web3';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
