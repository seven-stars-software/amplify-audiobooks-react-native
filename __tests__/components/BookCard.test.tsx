import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookCard from '../../src/components/atoms/BookCard';
import { Book } from '../../src/types/types';

// Mock book data
const createMockBook = (overrides?: Partial<Book>): Book => ({
    wooProductID: '123',
    name: 'Test Book Title',
    images: ['https://example.com/cover.jpg'],
    author: 'Test Author',
    duration: '5h 30m',
    releaseDate: '2024-01-01',
    dateCreated: '2024-01-01',
    isbn: '978-1234567890',
    permalink: 'https://example.com/book',
    featured: false,
    purchased: true,
    newRelease: false,
    onSale: false,
    ...overrides,
});

describe('BookCard', () => {
    describe('rendering', () => {
        it('renders the book title', () => {
            const book = createMockBook({ name: 'My Awesome Book' });
            const { getByText } = render(<BookCard book={book} />);

            expect(getByText('My Awesome Book')).toBeTruthy();
        });

        it('renders the author name with "by" prefix', () => {
            const book = createMockBook({ author: 'Jane Doe' });
            const { getByText } = render(<BookCard book={book} />);

            expect(getByText('by Jane Doe')).toBeTruthy();
        });

        it('renders the book duration', () => {
            const book = createMockBook({ duration: '10h 45m' });
            const { getByText } = render(<BookCard book={book} />);

            expect(getByText('10h 45m')).toBeTruthy();
        });

        it('renders the cover image with correct source', () => {
            const book = createMockBook({
                images: ['https://example.com/my-cover.jpg'],
            });
            const { UNSAFE_getAllByType } = render(<BookCard book={book} />);
            const { Image } = require('react-native');

            const images = UNSAFE_getAllByType(Image);
            expect(images[0].props.source).toEqual({
                uri: 'https://example.com/my-cover.jpg',
            });
        });
    });

    describe('interactions', () => {
        it('calls onPress when pressed', () => {
            const book = createMockBook();
            const onPress = jest.fn();
            const { getByText } = render(<BookCard book={book} onPress={onPress} />);

            fireEvent.press(getByText('Test Book Title'));

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not crash when onPress is not provided', () => {
            const book = createMockBook();
            const { getByText } = render(<BookCard book={book} />);

            // Should not throw
            fireEvent.press(getByText('Test Book Title'));
        });
    });

    describe('edge cases', () => {
        it('renders long book titles', () => {
            const book = createMockBook({
                name: 'This is a Very Long Book Title That Should Be Truncated With Ellipsis',
            });
            const { getByText } = render(<BookCard book={book} />);

            // Verify long title is rendered (truncation is handled by RN Paper)
            expect(getByText('This is a Very Long Book Title That Should Be Truncated With Ellipsis')).toBeTruthy();
        });

        it('handles empty duration gracefully', () => {
            const book = createMockBook({ duration: '' });
            const { getByText } = render(<BookCard book={book} />);

            // Title should still render
            expect(getByText('Test Book Title')).toBeTruthy();
        });

        it('handles special characters in titles', () => {
            const book = createMockBook({
                name: "The Author's Journey: A Tale of 'Adventure' & Success",
            });
            const { getByText } = render(<BookCard book={book} />);

            expect(getByText("The Author's Journey: A Tale of 'Adventure' & Success")).toBeTruthy();
        });
    });
});
