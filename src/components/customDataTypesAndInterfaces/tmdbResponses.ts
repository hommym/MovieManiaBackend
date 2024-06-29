
export type results = {
  backdrop_path: string;
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  media_type: string;
  adult: boolean;
  original_language: string;
  genre_ids: Array<number>;
  popularity: number;
  release_date: string;
  vote_average: number;
  vote_count: number;
};

export interface BaseResponse {
  pages: number;
  results: Array<results>;
  total_pages: number;
  total_results: number;
}


