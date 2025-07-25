import { render, screen } from '@testing-library/react';
import { MovieListItem } from './MovieListItem';
import { createMovieSlug } from '@/lib/slug';

const BASE_PROPS = {
  movie: {
    id: 123,
    title: 'Test Movie',
    original_title: 'Test Movie',
    release_date: '2020-01-01',
    overview: 'A cool movie.',
    vote_average: 8.1,
    vote_count: 1234,
    poster_url: { default: 'http://image.jpg', sm: null, md: null },
  },
  search: 'action',
  page: 2,
};

describe('MovieListItem', () => {
  it('renders title, original title, poster, overview', () => {
    render(<MovieListItem {...BASE_PROPS} />);

    expect(screen.getByRole('heading', { name: /test movie/i })).toBeInTheDocument();
    expect(screen.getByAltText('Poster for Test Movie')).toBeInTheDocument();
    expect(screen.getByText('A cool movie.')).toBeInTheDocument();
  });

  it('renders correct href (slug, search, page) in the link', () => {
    render(<MovieListItem {...BASE_PROPS} />);
    const link = screen.getByRole('link', { name: /test movie/i });

    expect(link).toHaveAttribute('href', expect.stringContaining('/movies/123-test-movie'));
    expect(link).toHaveAttribute('href', expect.stringContaining('search=action'));
    expect(link).toHaveAttribute('href', expect.stringContaining('page=2'));
  });

  it('omits page param if not present', () => {
    render(<MovieListItem {...BASE_PROPS} page={undefined} />);
    const link = screen.getByRole('link', { name: /test movie/i });

    expect(link).toHaveAttribute('href', expect.stringContaining('search=action'));
    expect(link).not.toHaveAttribute('href', expect.stringContaining('page='));
  });

  it('renders original title if different', () => {
    const props = {
      ...BASE_PROPS,
      movie: { ...BASE_PROPS.movie, original_title: 'Das Boot' },
    };

    render(<MovieListItem {...props} />);

    expect(screen.getByText('Das Boot')).toBeInTheDocument();
  });

  it('does NOT render original title if same as title', () => {
    render(<MovieListItem {...BASE_PROPS} />);

    const subtitles = screen.queryAllByText('Test Movie');
    expect(subtitles.some((e) => e.tagName.toLowerCase() === 'p')).toBe(false);
  });

  it('renders formatted release date using formatDate', () => {
    render(<MovieListItem {...BASE_PROPS} />);

    expect(screen.getByText(/01 Jan 2020/)).toBeInTheDocument();
  });

  it('renders formatted score using formatVoteFromSearch', () => {
    render(<MovieListItem {...BASE_PROPS} />);

    expect(screen.getByText(/81%/)).toBeInTheDocument();
  });

  it('renders "no votes" if vote_count is 0', () => {
    const props = {
      ...BASE_PROPS,
      movie: { ...BASE_PROPS.movie, vote_count: 0 },
    };

    render(<MovieListItem {...props} />);

    expect(screen.getByText(/no votes/i)).toBeInTheDocument();
  });

  it('renders "unknown" date if release_date is empty', () => {
    const props = {
      ...BASE_PROPS,
      movie: { ...BASE_PROPS.movie, release_date: '' },
    };

    render(<MovieListItem {...props} />);

    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });

  it('does not render overview if missing', () => {
    const props = {
      ...BASE_PROPS,
      movie: { ...BASE_PROPS.movie, overview: '' },
    };

    render(<MovieListItem {...props} />);

    expect(screen.queryByText('A cool movie.')).not.toBeInTheDocument();
  });

  it('renders heading with correct id from slug', () => {
    render(<MovieListItem {...BASE_PROPS} />);
    const slug = createMovieSlug(BASE_PROPS.movie.id, BASE_PROPS.movie.original_title);
    const heading = screen.getByRole('heading', { name: /test movie/i });
    expect(heading).toHaveAttribute('id', slug);
  });

  it('slug in heading id matches slug in link href', () => {
    render(<MovieListItem {...BASE_PROPS} />);
    const heading = screen.getByRole('heading', { name: /test movie/i });
    const link = screen.getByRole('link', { name: /test movie/i });
    // Extract slug from href
    const href = link.getAttribute('href') || '';
    const id = heading.getAttribute('id');
    expect(href).toContain(`/movies/${id}`);
  });
});
