import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSocialReactions } from '@/hooks/useSocialReactions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SocialActivity } from '@/types/social';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  activity_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface EnhancedSocialFeedProps {
  activities: SocialActivity[];
  loading?: boolean;
  className?: string;
}

export function EnhancedSocialFeed({ activities, loading, className }: EnhancedSocialFeedProps) {
  const { user } = useAuth();
  const {
    activityReactions,
    addReaction,
    getReactionIcon,
    getReactionColor,
    loadReactionsForActivities
  } = useSocialReactions();

  const [comments, setComments] = useState<{ [activityId: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [activityId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [activityId: string]: boolean }>({});

  useEffect(() => {
    if (activities.length > 0) {
      const activityIds = activities.map(a => a.id);
      loadReactionsForActivities(activityIds);
      loadCommentsForActivities(activityIds);
    }
  }, [activities]);

  const loadCommentsForActivities = async (activityIds: string[]) => {
    try {
      const { data } = await supabase
        .from('social_comments')
        .select(`
          *,
          user_profile:user_social_profiles!social_comments_user_id_fkey(display_name, avatar_url)
        `)
        .in('activity_id', activityIds)
        .order('created_at', { ascending: true });

      if (data) {
        const grouped = data.reduce((acc, comment) => {
          if (!acc[comment.activity_id]) {
            acc[comment.activity_id] = [];
          }
          acc[comment.activity_id].push(comment as any);
          return acc;
        }, {} as { [activityId: string]: Comment[] });

        setComments(grouped);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addComment = async (activityId: string) => {
    if (!user || !newComments[activityId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('social_comments')
        .insert({
          user_id: user.id,
          activity_id: activityId,
          content: newComments[activityId].trim()
        });

      if (error) throw error;

      // Refresh comments for this activity
      await loadCommentsForActivities([activityId]);
      
      // Clear the input
      setNewComments(prev => ({
        ...prev,
        [activityId]: ''
      }));
      
      toast.success('Comentário adicionado!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const deleteComment = async (commentId: string, activityId: string) => {
    try {
      const { error } = await supabase
        .from('social_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Refresh comments
      await loadCommentsForActivities([activityId]);
      toast.success('Comentário removido');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erro ao remover comentário');
    }
  };

  const reactionTypes = ['like', 'celebrate', 'support', 'wow'] as const;

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {activities.map(activity => {
          const activityReaction = activityReactions[activity.id];
          const activityComments = comments[activity.id] || [];
          const isExpanded = expandedComments[activity.id];

          return (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {activity.title[0]?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{activity.title}</h4>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Reactions */}
                <div className="flex items-center gap-2 mb-4">
                  {reactionTypes.map(type => {
                    const count = activityReaction?.counts[type] || 0;
                    const hasReacted = activityReaction?.userReactions.includes(type) || false;
                    
                    return (
                      <Button
                        key={type}
                        variant={hasReacted ? "default" : "outline"}
                        size="sm"
                        onClick={() => addReaction(activity.id, type)}
                        className={`flex items-center gap-1 ${hasReacted ? getReactionColor(type) : ''}`}
                      >
                        <span>{getReactionIcon(type)}</span>
                        {count > 0 && <span className="text-xs">{count}</span>}
                      </Button>
                    );
                  })}
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedComments(prev => ({
                        ...prev,
                        [activity.id]: !prev[activity.id]
                      }))}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {activityComments.length} comentários
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3">
                      {/* Existing Comments */}
                      {activityComments.map(comment => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user_profile?.avatar_url} />
                            <AvatarFallback>
                              {comment.user_profile?.display_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {comment.user_profile?.display_name || 'Usuário'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                                {comment.user_id === user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteComment(comment.id, activity.id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      {user && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Adicione um comentário..."
                            value={newComments[activity.id] || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [activity.id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addComment(activity.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => addComment(activity.id)}
                            disabled={!newComments[activity.id]?.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activities.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">Nenhuma atividade no feed</h3>
              <p className="text-muted-foreground">
                Complete quizzes e estude flashcards para ver atividades aparecerem aqui!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
