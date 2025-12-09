// Mock the @env module BEFORE importing APIClient
jest.mock('@env', () => ({
  API_URL: 'https://test-api.com',
}));

import APIClient from '../src/APIClient';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Helper to create mock Response that passes instanceof check
class MockResponse extends Response {
  private _status: number;
  private _url: string;
  private _body: string;

  constructor(body: string, init: { status?: number; url?: string } = {}) {
    super();
    this._status = init.status || 200;
    this._url = init.url || '';
    this._body = body;
  }

  get status() {
    return this._status;
  }

  get url() {
    return this._url;
  }

  async text() {
    return this._body;
  }

  async json() {
    return JSON.parse(this._body);
  }
}

const createMockResponse = (body: string, init?: { status?: number; url?: string }) => {
  return new MockResponse(body, init);
};

describe('APIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log output in tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('sends POST request with credentials', async () => {
      const mockResponse = {
        success: true,
        seal: 'test-seal',
        wpUser: { id: 1, name: 'Test User' },
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockResponse), {
          status: 200,
          url: 'https://test-api.com/auth/login',
        })
      );

      const result = await APIClient.login({
        username: 'testuser',
        password: 'testpassword',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'testpassword' }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('throws error on HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse('Unauthorized', {
          status: 401,
          url: 'https://test.com/auth/login',
        })
      );

      await expect(
        APIClient.login({ username: 'testuser', password: 'wrong' })
      ).rejects.toThrow('HTTP Error. Status 401');
    });

    it('throws error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        APIClient.login({ username: 'testuser', password: 'testpassword' })
      ).rejects.toThrow('Original Error: Network error');
    });

    it('throws error on invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse('Not JSON', {
          status: 200,
          url: 'https://test.com/auth/login',
        })
      );

      await expect(
        APIClient.login({ username: 'testuser', password: 'testpassword' })
      ).rejects.toThrow('Expected JSON. Failed to parse.');
    });
  });

  describe('register', () => {
    it('sends POST request with registration data', async () => {
      const mockResponse = {
        success: true,
        seal: 'new-user-seal',
        wpUser: { id: 2, name: 'New User' },
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockResponse), {
          status: 200,
          url: 'https://test-api.com/auth/register',
        })
      );

      const result = await APIClient.register({
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'newuser',
            email: 'newuser@test.com',
            password: 'password123',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAccount', () => {
    it('sends POST request with userID', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockResponse), {
          status: 200,
          url: 'https://test-api.com/auth/delete-account',
        })
      );

      const result = await APIClient.deleteAccount({ userID: '123' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/delete-account'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID: '123' }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkSeal', () => {
    it('sends POST request with username and seal', async () => {
      const mockResponse = { valid: true };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockResponse), {
          status: 200,
          url: 'https://test-api.com/auth/check-seal',
        })
      );

      const result = await APIClient.checkSeal({
        username: 'testuser',
        seal: 'test-seal',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/check-seal'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', seal: 'test-seal' }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getLibrary', () => {
    it('sends GET request with auth seal in header', async () => {
      const mockBooks = [
        { isbn: '123', title: 'Book 1' },
        { isbn: '456', title: 'Book 2' },
      ];

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockBooks), {
          status: 200,
          url: 'https://test-api.com/library',
        })
      );

      const result = await APIClient.getLibrary('test-seal');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library'),
        expect.objectContaining({
          headers: {
            'X-IronSeal': 'test-seal',
          },
        })
      );

      expect(result).toEqual(mockBooks);
    });
  });

  describe('getHomeBooks', () => {
    it('sends GET request with auth seal and returns home books', async () => {
      const mockHomeBooks = {
        library: [{ isbn: '123', title: 'Book 1' }],
        featured: [{ isbn: '456', title: 'Book 2' }],
        newReleases: [{ isbn: '789', title: 'Book 3' }],
        onSale: [{ isbn: '101', title: 'Book 4' }],
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockHomeBooks), {
          status: 200,
          url: 'https://test-api.com/library/home',
        })
      );

      const result = await APIClient.getHomeBooks('test-seal');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/home'),
        expect.objectContaining({
          headers: {
            'X-IronSeal': 'test-seal',
          },
        })
      );

      expect(result).toEqual(mockHomeBooks);
    });
  });

  describe('getBookTracks', () => {
    it('sends GET request with ISBN and auth seal', async () => {
      const mockTracks = {
        isbn: '123456789',
        tracks: [
          { id: 1, title: 'Track 1', url: 'https://example.com/track1.mp3' },
          { id: 2, title: 'Track 2', url: 'https://example.com/track2.mp3' },
        ],
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockTracks), {
          status: 200,
          url: 'https://test-api.com/library/123456789',
        })
      );

      const result = await APIClient.getBookTracks({
        isbn: '123456789',
        seal: 'test-seal',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/123456789'),
        expect.objectContaining({
          headers: {
            'X-IronSeal': 'test-seal',
          },
        })
      );

      expect(result).toEqual(mockTracks);
    });
  });

  describe('error handling', () => {
    it('includes request URL in fetch error message', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(APIClient.login({ username: 'test', password: 'test' })).rejects.toThrow(
        'Original Error: Connection refused'
      );
    });

    it('includes HTTP status in HTTP error message', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse('Internal Server Error', {
          status: 500,
          url: 'https://test.com/api',
        })
      );

      await expect(APIClient.login({ username: 'test', password: 'test' })).rejects.toThrow(
        'HTTP Error. Status 500'
      );
    });

    it('throws error when JSON parse fails', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse('<html>Not JSON</html>', {
          status: 200,
          url: 'https://test.com/api',
        })
      );

      await expect(APIClient.login({ username: 'test', password: 'test' })).rejects.toThrow(
        'Expected JSON. Failed to parse.'
      );
    });
  });
});
