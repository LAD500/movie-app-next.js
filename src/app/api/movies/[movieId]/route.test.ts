import { GET } from '@/app/api/movies/[movieId]/route';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { NextRequest } from 'next/server';
import { UNUSED_MOVIE_DETAIL_KEYS } from '@/lib/tmdbUtils';

const validMovieId = '21193';
const invalidMovieId = 'abc';

const configResponse = {
  images: {
    secure_base_url: 'https://image.tmdb.org/t/p/',
    poster_sizes: ['w185', 'w342', 'w500'],
  },
};

const movieDetailResponse = {
  id: 21193,
  title: 'Carmen',
  poster_path: '/example.jpg',
};

describe('GET /api/movies/[movieId]', () => {
  it('returns 200 and valid movie details with enriched poster_url', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/:movieId', () =>
        HttpResponse.json(movieDetailResponse)
      ),
      http.get('https://api.themoviedb.org/3/configuration', () =>
        HttpResponse.json(configResponse)
      )
    );

    const req = new NextRequest(new URL('http://localhost/api/movies/21193'));
    const res = await GET(req, { params: Promise.resolve({ movieId: validMovieId }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty('poster_url');
    expect(json.poster_url).toHaveProperty('default');
    expect(json.poster_url.default).toBe('https://image.tmdb.org/t/p/w185/example.jpg');
    expect(json.poster_url.sm).toBe('https://image.tmdb.org/t/p/w342/example.jpg');
    expect(json.poster_url.lg).toBe('https://image.tmdb.org/t/p/w500/example.jpg');
  });

  it('returns 200 and with stripped keys', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/:movieId', () =>
        HttpResponse.json(movieDetailResponse)
      ),
      http.get('https://api.themoviedb.org/3/configuration', () =>
        HttpResponse.json(configResponse)
      )
    );

    const req = new NextRequest(new URL('http://localhost/api/movies/21193'));
    const res = await GET(req, { params: Promise.resolve({ movieId: validMovieId }) });
    const json = await res.json();

    expect(res.status).toBe(200);

    // Assert all the unwanted keys are stripped
    for (const key of UNUSED_MOVIE_DETAIL_KEYS) {
      expect(json).not.toHaveProperty(key);
    }
  });

  it('returns 400 if movieId is missing', async () => {
    const req = new NextRequest(new URL('http://localhost/api/movies/'));
    const res = await GET(req, { params: Promise.resolve({} as unknown as { movieId: string }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: 'movieId param missing' });
  });

  it('returns 400 if movieId is invalid', async () => {
    const req = new NextRequest(new URL('http://localhost/api/movies/invalid'));
    const res = await GET(req, { params: Promise.resolve({ movieId: invalidMovieId }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid movieId' });
  });

  it('returns 500 if movie details fetch fails', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/:movieId', () =>
        HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      ),
      http.get('https://api.themoviedb.org/3/configuration', () =>
        HttpResponse.json(configResponse)
      )
    );

    const req = new NextRequest(new URL('http://localhost/api/movies/21193'));
    const res = await GET(req, { params: Promise.resolve({ movieId: validMovieId }) });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: 'unable to get movie' });
  });

  it('returns 500 if configuration fetch fails', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/:movieId', () =>
        HttpResponse.json(movieDetailResponse)
      ),
      http.get('https://api.themoviedb.org/3/configuration', () =>
        HttpResponse.json({ error: 'Config Error' }, { status: 500 })
      )
    );

    const req = new NextRequest(new URL('http://localhost/api/movies/21193'));
    const res = await GET(req, { params: Promise.resolve({ movieId: validMovieId }) });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: 'unable to get movie' });
  });
});
