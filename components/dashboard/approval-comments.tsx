'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Trash2, Sparkles, X, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generatePrompt } from '@/utils/analysis/analysis';
import { AnalysisResponse, Comment } from '@/types/approval';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';

interface CommentsCardProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function CommentsCard({
  comments,
  onAddComment,
  onDeleteComment,
}: CommentsCardProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const params = useParams();

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment('');
  };

  const cacheResponse = (response: AnalysisResponse) => {
    const id = typeof params.id === 'string' ? params.id : params.id[0];
    if (!response || !id) return;
    const cacheKey = `analysis-${id}`;
    const cacheData = {
      cached_comments: comments,
      cached_comments_count: comments.length,
      analysis: response,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  const clearCacheForId = (id: string) => {
    const cacheKey = `analysis-${id}`;
    localStorage.removeItem(cacheKey);
  };

  const getCachedResponse = () => {
    const id = typeof params.id === 'string' ? params.id : params.id[0];
    if (!id) return false;
    const cacheKey = `analysis-${id}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { cached_comments, cached_comments_count, analysis, timestamp } =
        JSON.parse(cachedData);

      if (
        !cached_comments ||
        !cached_comments_count ||
        !analysis ||
        comments.length !== cached_comments_count
      ) {
        clearCacheForId(id);
        return false;
      }

      comments.forEach((comment) => {
        const cachedComment = cached_comments.find(
          (c: Comment) => c.id === comment.id
        );
        if (cachedComment && cachedComment.comment !== comment.comment) {
          return false;
        }
      });

      setAnalysis(analysis);
      setAnalysisLoading(false);
      return true;
    }
    return false;
  };

  const handleGetAnalysis = () => {
    setAnalysis(null);
    setAnalysisLoading(true);

    const cachedResponseFound = getCachedResponse();
    if (cachedResponseFound) return;

    const prompt = generatePrompt(comments);

    fetch('/api/approvals/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comments: prompt }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error('Error fetching analysis:', data.error);
          toast.error('Something went wrong while fetching analysis!');
          return;
        }
        setAnalysis(data.json);
        cacheResponse(data.json);
      })
      .catch((error) => {
        console.error('Error fetching analysis:', error);
        toast.error('Something went wrong while fetching analysis!');
      })
      .finally(() => {
        setAnalysisLoading(false);
      });
  };

  const handleCloseAnalysis = () => {
    setAnalysis(null);
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          {comments.length > 0 ? (
            comments.map((comment, index) => {
              const previousComment = index > 0 ? comments[index - 1] : null;
              const currentTime = new Date(comment.created_at).getTime();
              const previousTime = previousComment
                ? new Date(previousComment.created_at).getTime()
                : 0;
              const showHeader =
                !previousComment ||
                previousComment.user_email !== comment.user_email ||
                currentTime - previousTime > 2 * 60 * 1000;

              return (
                <div key={comment.id} className="relative">
                  {showHeader && (
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{comment.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="relative group">
                    <p className="text-sm text-gray-700 hover:bg-gray-50">
                      {comment.comment}
                    </p>
                    {user && user.email === comment.user_email && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="absolute right-0 top-0 hidden text-red-500 group-hover:block"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 flex items-center justify-center">
              No comments yet.
            </p>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {analysis && (
          <div className="w-full mb-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 relative text-sm">
            <button
              onClick={handleCloseAnalysis}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close analysis"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="font-medium mb-1">Mood Analysis:</p>

            <p className="mb-1 font-semibold">Agreeing:</p>
            <ul>
              {analysis.agree_summary.points.map((point, index) => (
                <li key={index} className="ml-4 list-disc">
                  {point}
                </li>
              ))}
            </ul>

            <p className="mt-3 mb-1 font-semibold">Disagreeing:</p>
            <ul>
              {analysis.disagree_summary.points.map((point, index) => (
                <li key={index} className="ml-4 list-disc">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="w-full space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <div className="flex gap-1">
            {comments.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="flex items-center justify-center"
                      variant="outline"
                      onClick={handleGetAnalysis}
                      aria-label="Get mood analysis"
                      disabled={analysisLoading || !!analysis}
                    >
                      {analysisLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get mood analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button onClick={handlePostComment} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
