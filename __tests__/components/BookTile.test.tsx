import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookTile from '../../src/components/molecules/BookTile';
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

describe('BookTile', () => {
    describe('rendering', () => {
        it('renders the book title', () => {
            const book = createMockBook({ name: 'My Awesome Book' });
            const { getByText } = render(<BookTile book={book} />);

            expect(getByText('My Awesome Book')).toBeTruthy();
        });

        it('renders the author name', () => {
            const book = createMockBook({ author: 'Jane Doe' });
            const { getByText } = render(<BookTile book={book} />);

            expect(getByText('Jane Doe')).toBeTruthy();
        });

        it('renders the cover image with correct source', () => {
            const book = createMockBook({
                images: ['https://example.com/my-cover.jpg'],
            });
            const { UNSAFE_getAllByType } = render(<BookTile book={book} />);
            const { Image } = require('react-native');

            const images = UNSAFE_getAllByType(Image);
            expect(images[0].props.source).toEqual({
                uri: 'https://example.com/my-cover.jpg',
            });
        });

        it('does not render duration (unlike BookCard)', () => {
            const book = createMockBook({ duration: '10h 45m' });
            const { queryByText } = render(<BookTile book={book} />);

            // BookTile doesn't show duration
            expect(queryByText('10h 45m')).toBeNull();
        });

        it('does not render "by" prefix before author (unlike BookCard)', () => {
            const book = createMockBook({ author: 'Jane Doe' });
            const { queryByText, getByText } = render(<BookTile book={book} />);

            // Author is shown without "by" prefix
            expect(queryByText('by Jane Doe')).toBeNull();
            expect(getByText('Jane Doe')).toBeTruthy();
        });
    });

    describe('interactions', () => {
        it('calls onPress when pressed', () => {
            const book = createMockBook();
            const onPress = jest.fn();
            const { getByText } = render(<BookTile book={book} onPress={onPress} />);

            fireEvent.press(getByText('Test Book Title'));

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not crash when onPress is not provided', () => {
            const book = createMockBook();
            const { getByText } = render(<BookTile book={book} />);

            // Should not throw
            fireEvent.press(getByText('Test Book Title'));
        });
    });

    describe('styling', () => {
        it('accepts custom style prop', () => {
            const book = createMockBook();
            const customStyle = { marginHorizontal: 10 };
            const { UNSAFE_getAllByType } = render(
                <BookTile book={book} style={customStyle} />
            );
            const { Pressable } = require('react-native');

            const pressables = UNSAFE_getAllByType(Pressable);
            // The first Pressable should have the custom style merged
            expect(pressables[0].props.style).toMatchObject(customStyle);
        });
    });

    describe('edge cases', () => {
        it('renders long book titles', () => {
            const book = createMockBook({
                name: 'This is a Very Long Book Title That Might Be Truncated',
            });
            const { getByText } = render(<BookTile book={book} />);

            // Verify long title is rendered (truncation is handled by RN Paper)
            expect(getByText('This is a Very Long Book Title That Might Be Truncated')).toBeTruthy();
        });

        it('renders long author names', () => {
            const book = createMockBook({
                author: 'A Very Long Author Name That Might Need Truncating',
            });
            const { getByText } = render(<BookTile book={book} />);

            // Verify long author name is rendered (truncation is handled by RN)
            expect(getByText('A Very Long Author Name That Might Need Truncating')).toBeTruthy();
        });

        it('handles special characters in book data', () => {
            const book = createMockBook({
                name: "The Author's Journey",
                author: "Jane O'Brien-Smith",
            });
            const { getByText } = render(<BookTile book={book} />);

            expect(getByText("The Author's Journey")).toBeTruthy();
            expect(getByText("Jane O'Brien-Smith")).toBeTruthy();
        });
    });
});
