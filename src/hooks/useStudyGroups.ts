import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  is_public: boolean;
  max_members: number;
  group_type: 'study' | 'competition' | 'collaboration';
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  creator_name?: string;
}

interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    total_xp: number;
    current_level: number;
  };
}

export const useStudyGroups = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ [groupId: string]: GroupMembership[] }>({});
  const [loading, setLoading] = useState(true);

  const loadStudyGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load groups where user is a member
      const { data: memberGroups } = await supabase
        .from('study_group_memberships')
        .select('*, study_groups(*)')
        .eq('user_id', user.id);

      const myGroupsData = memberGroups?.map(mg => ({
        ...mg.study_groups,
        is_member: true,
        creator_name: 'Creator' // Will get from separate query if needed
      })) || [];

      setMyGroups(myGroupsData as StudyGroup[]);

      // Load public groups
      const { data: publicGroupsData } = await supabase
        .from('study_groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      const enrichedPublicGroups = publicGroupsData?.map(group => ({
        ...group,
        member_count: 0, // Will be calculated separately if needed
        creator_name: 'Creator',
        is_member: myGroupsData.some(mg => mg.id === group.id)
      })) || [];

      setPublicGroups(enrichedPublicGroups as StudyGroup[]);

    } catch (error) {
      console.error('Error loading study groups:', error);
      toast.error('Erro ao carregar grupos de estudo');
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async (groupData: {
    name: string;
    description?: string;
    is_public: boolean;
    max_members: number;
    group_type: 'study' | 'competition' | 'collaboration';
  }) => {
    if (!user) return null;

    try {
      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert({
          ...groupData,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator as admin
      await supabase
        .from('study_group_memberships')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        });

      toast.success('Grupo criado com sucesso!');
      loadStudyGroups();
      return newGroup;
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Erro ao criar grupo');
      return null;
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_group_memberships')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Entrou no grupo!');
      loadStudyGroups();
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Erro ao entrar no grupo');
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_group_memberships')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Saiu do grupo');
      loadStudyGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Erro ao sair do grupo');
      return false;
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const { data } = await supabase
        .from('study_group_memberships')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false });

      if (data) {
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: data as GroupMembership[]
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error loading group members:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadStudyGroups();
    }
  }, [user]);

  return {
    myGroups,
    publicGroups,
    groupMembers,
    loading,
    createStudyGroup,
    joinGroup,
    leaveGroup,
    loadGroupMembers,
    refreshGroups: loadStudyGroups
  };
};