import { render, screen } from '@testing-library/react';
import Search from './Search';

test('renders SimSage link', () => {
    render(<Search />);
    const linkElement = screen.getByText(/simsage/i);
    expect(linkElement).toBeInTheDocument();
});
