'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface Comment {
  id: string;
  approval_id: string;
  user_email: string;
  comment: string;
  created_at: Date;
  name: string;
}

interface CommentsCardProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function CommentsCard({ comments, onAddComment, onDeleteComment }: CommentsCardProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment("");
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
              const previousTime = previousComment ? new Date(previousComment.created_at).getTime() : 0;
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
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                    {user && user.email === comment.user_email && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="absolute right-0 top-0 hidden group-hover:block p-1"
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
      <CardFooter>
        <div className="w-full space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <Button onClick={handlePostComment} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
