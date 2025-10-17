import type { Team, TeamMember, TeamInvitation, ActivityLogEntry } from '../types';

export class TeamService {
  // Create a new team
  static createTeam(teamData: {
    name: string;
    description: string;
    leaderId: string;
  }): Team {
    const team: Team = {
      id: `team_${Date.now()}`,
      name: teamData.name,
      description: teamData.description,
      leaderId: teamData.leaderId,
      members: [
        {
          id: `member_${Date.now()}`,
          teamId: `team_${Date.now()}`,
          userId: teamData.leaderId,
          role: 'leader',
          status: 'active',
          joinedAt: new Date()
        }
      ],
      isActive: true,
      createdAt: new Date()
    };

    // Fix the team ID in the member
    team.members[0].teamId = team.id;

    // Save to localStorage
    const teams = this.getAllTeams();
    teams.push(team);
    localStorage.setItem('teams', JSON.stringify(teams));

    return team;
  }

  // Get all teams
  static getAllTeams(): Team[] {
    const teamsData = localStorage.getItem('teams');
    return teamsData ? JSON.parse(teamsData) : [];
  }

  // Get teams where user is a member
  static getUserTeams(userId: string): Team[] {
    const teams = this.getAllTeams();
    return teams.filter(team =>
      team.members.some(member =>
        member.userId === userId && member.status === 'active'
      )
    );
  }

  // Get team by ID
  static getTeam(teamId: string): Team | null {
    const teams = this.getAllTeams();
    return teams.find(team => team.id === teamId) || null;
  }

  // Update team information
  static updateTeam(teamId: string, updates: Partial<Team>): Team | null {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) return null;

    teams[teamIndex] = { ...teams[teamIndex], ...updates };
    localStorage.setItem('teams', JSON.stringify(teams));
    
    return teams[teamIndex];
  }

  // Invite user to team
  static inviteUser(teamId: string, userId: string, invitedBy: string): TeamInvitation {
    const invitation: TeamInvitation = {
      id: `invitation_${Date.now()}`,
      teamId,
      invitedUserId: userId,
      invitedBy,
      status: 'pending',
      createdAt: new Date()
    };

    // Save invitation
    const invitations = this.getAllInvitations();
    invitations.push(invitation);
    localStorage.setItem('teamInvitations', JSON.stringify(invitations));

    return invitation;
  }

  // Get all invitations
  static getAllInvitations(): TeamInvitation[] {
    const invitationsData = localStorage.getItem('teamInvitations');
    return invitationsData ? JSON.parse(invitationsData) : [];
  }

  // Get pending invitations for a team
  static getTeamInvitations(teamId: string): TeamInvitation[] {
    const invitations = this.getAllInvitations();
    return invitations.filter(inv => inv.teamId === teamId && inv.status === 'pending');
  }

  // Accept invitation
  static acceptInvitation(invitationId: string): boolean {
    const invitations = this.getAllInvitations();
    const invitation = invitations.find(inv => inv.id === invitationId);
    
    if (!invitation || invitation.status !== 'pending') return false;

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    localStorage.setItem('teamInvitations', JSON.stringify(invitations));

    // Add user to team
    const teams = this.getAllTeams();
    const team = teams.find(t => t.id === invitation.teamId);
    
    if (team) {
      const newMember: TeamMember = {
        id: `member_${Date.now()}`,
        teamId: invitation.teamId,
        userId: invitation.invitedUserId,
        role: 'member',
        status: 'active',
        joinedAt: new Date()
      };

      team.members.push(newMember);
      localStorage.setItem('teams', JSON.stringify(teams));
    }

    return true;
  }

  // Remove member from team
  static removeMember(teamId: string, userId: string): boolean {
    const teams = this.getAllTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return false;

    const memberIndex = team.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) return false;

    // Don't allow removing the team leader
    if (team.members[memberIndex].role === 'leader') return false;

    team.members[memberIndex].status = 'removed';
    localStorage.setItem('teams', JSON.stringify(teams));

    return true;
  }

  // Log activity for team workspace
  static logActivity(activity: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: ActivityLogEntry = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date()
    };

    const activities = this.getActivities();
    activities.push(logEntry);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }

    localStorage.setItem('teamActivities', JSON.stringify(activities));
  }

  // Get activities for a service
  static getServiceActivities(serviceId: string): ActivityLogEntry[] {
    const activities = this.getActivities();
    return activities
      .filter(activity => activity.serviceId === serviceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get all activities
  static getActivities(): ActivityLogEntry[] {
    const activitiesData = localStorage.getItem('teamActivities');
    return activitiesData ? JSON.parse(activitiesData) : [];
  }

  // Check if user is team leader
  static isTeamLeader(teamId: string, userId: string): boolean {
    const team = this.getTeam(teamId);
    return team?.leaderId === userId || false;
  }

  // Check if user is team member
  static isTeamMember(teamId: string, userId: string): boolean {
    const team = this.getTeam(teamId);
    return team?.members.some(member => 
      member.userId === userId && member.status === 'active'
    ) || false;
  }
}