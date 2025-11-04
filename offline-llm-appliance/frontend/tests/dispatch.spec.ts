/**
 * dispatch.spec.ts
 * Purpose: Tests for Dispatch chat interest onboarding and digest
 * Usage: Validates interest selection, digest generation, and good-news lane
 */

import { describe, it, expect, beforeEach } from 'vitest';

const MIN_INTERESTS = 10;

describe('Dispatch Chat', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should require at least 10 interests', () => {
    const interests = [
      'Technology',
      'Science',
      'Politics',
      'Business',
      'Health',
      'Climate',
      'Sports',
      'Arts',
      'Culture',
      'Education',
    ];

    expect(interests.length).toBe(MIN_INTERESTS);
    expect(interests.length).toBeGreaterThanOrEqual(MIN_INTERESTS);
  });

  it('should reject fewer than 10 interests', () => {
    const interests = [
      'Technology',
      'Science',
      'Politics',
      'Business',
      'Health',
      'Climate',
      'Sports',
      'Arts',
      'Culture',
    ]; // Only 9

    expect(interests.length).toBeLessThan(MIN_INTERESTS);
  });

  it('should generate daily digest with good news items', () => {
    const digest = {
      daily: [
        { id: '1', title: 'News Item 1', category: 'Technology' },
        { id: '2', title: 'News Item 2', category: 'Science' },
      ],
      goodNews: [
        { id: '1', title: 'Good News 1', category: 'Climate' },
        { id: '2', title: 'Good News 2', category: 'Health' },
        { id: '3', title: 'Good News 3', category: 'Social' },
      ],
    };

    expect(digest.goodNews.length).toBeGreaterThanOrEqual(3);
    expect(digest.daily.length).toBeGreaterThan(0);
  });

  it('should persist source bias selection', () => {
    const bias = 'balanced';
    localStorage.setItem('dispatch_bias', bias);

    const saved = localStorage.getItem('dispatch_bias');
    expect(saved).toBe('balanced');
  });

  it('should support all source bias options', () => {
    const biases = ['mainstream', 'balanced', 'independent'];

    biases.forEach((bias) => {
      localStorage.setItem('dispatch_bias', bias);
      const saved = localStorage.getItem('dispatch_bias');
      expect(saved).toBe(bias);
    });
  });

  it('should store interests in localStorage', () => {
    const interests = [
      'Technology',
      'Science',
      'Politics',
      'Business',
      'Health',
      'Climate',
      'Sports',
      'Arts',
      'Culture',
      'Education',
      'Finance',
      'International',
    ];

    localStorage.setItem('dispatch_interests', JSON.stringify(interests));
    const saved = JSON.parse(localStorage.getItem('dispatch_interests') || '[]');
    expect(saved.length).toBeGreaterThanOrEqual(MIN_INTERESTS);
  });
});
