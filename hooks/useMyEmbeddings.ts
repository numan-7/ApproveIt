'use client';

import { useState, useEffect } from 'react';

interface Embedding {
  query: string;
  type: string;
}

export function useMyEmbeddings() {
  const [loading, setLoading] = useState(false);

  const fetchEmbeddings = async (body: Embedding) => {
    try {
      setLoading(true);
      const res = await fetch('/api/approvals/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        console.error('Error fetching my embeddings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching my embeddings:', error);
      throw new Error('Error fetching my embeddings');
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchEmbeddings };
}
