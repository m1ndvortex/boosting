# Team Workspace System

## Overview
Team Advertisers can create teams and invite members for collaborative service management. Team workspace allows multiple users to work together on services with shared visibility and earnings going to the team leader.

---

## Key Concepts

### Team Structure
- **Team Leader**: Team Advertiser who created the team
- **Team Members**: Users invited to join the team
- **Team Services**: Services created in team workspace context
- **Team Earnings**: All earnings go to team leader's wallet

### Workspace Context
Users can switch between two contexts:
- **Personal Workspace**: Individual services, personal earnings
- **Team Workspace**: Shared services, team leader earnings

---

## Team Creation

### Prerequisites
- User must have `team_advertiser` role (active status)
- User can create one team

### Creation Flow

**Frontend:**
```jsx
function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleCreate = async () => {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: teamName,
        description: description
      })
    });
    
    const team = await response.json();
    // Team created, workspace button now appears
  };
  
  return (
    <form onSubmit={handleCreate}>
      <input 
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Team Name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Team Description"
      />
      <button type="submit">Create Team</button>
    </form>
  );
}
```

**Backend:**
```python
@api_view(['POST'])
@require_role('team_advertiser')
def create_team(request):
    user = request.user
    
    # Check if user already has a team
    existing_team = Team.objects.filter(leader_id=user.id).first()
    if existing_team:
        return Response({'error': 'You already have a team'}, status=400)
    
    # Create team
    team = Team.objects.create(
        name=request.data['name'],
        leader_id=user.id,
        description=request.data.get('description', ''),
        is_active=True
    )
    
    # Add leader as team member
    TeamMember.objects.create(
        team_id=team.id,
        user_id=user.id,
        role='leader',
        status='active'
    )
    
    return Response({
        'id': team.id,
        'name': team.name,
        'description': team.description
    })
```

---

## Team Member Invitation

### Invitation Flow

**Step 1: Team Leader Invites User**
```python
@api_view(['POST'])
def invite_team_member(request, team_id):
    user = request.user
    team = Team.objects.get(id=team_id)
    
    # Verify user is team leader
    if team.leader_id != user.id:
        return Response({'error': 'Only team leader can invite'}, status=403)
    
    invited_user_id = request.data['user_id']
    
    # Check if already a member
    existing = TeamMember.objects.filter(
        team_id=team_id,
        user_id=invited_user_id
    ).first()
    
    if existing:
        return Response({'error': 'User already in team'}, status=400)
    
    # Create invitation
    TeamMember.objects.create(
        team_id=team_id,
        user_id=invited_user_id,
        role='member',
        status='invited',
        invited_by=user.id
    )
    
    # Notify user
    notify_user_team_invitation(invited_user_id, team)
    
    return Response({'message': 'Invitation sent'})
```

**Step 2: User Accepts Invitation**
```python
@api_view(['POST'])
def accept_team_invitation(request, team_member_id):
    user = request.user
    team_member = TeamMember.objects.get(id=team_member_id)
    
    # Verify invitation is for this user
    if team_member.user_id != user.id:
        return Response({'error': 'Not your invitation'}, status=403)
    
    if team_member.status != 'invited':
        return Response({'error': 'Invalid invitation status'}, status=400)
    
    # Accept invitation
    team_member.status = 'active'
    team_member.joined_at = timezone.now()
    team_member.save()
    
    return Response({'message': 'Joined team successfully'})
```

---

## Workspace Context Switching

### Frontend Implementation

**Context State:**
```javascript
// WorkspaceContext.js
import React, { createContext, useState, useContext } from 'react';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState({
    type: 'personal',  // 'personal' or 'team'
    id: null,          // user_id or team_id
    name: null         // team name (if team)
  });
  
  const switchToPersonal = (userId) => {
    setWorkspace({
      type: 'personal',
      id: userId,
      name: null
    });
  };
  
  const switchToTeam = (teamId, teamName) => {
    setWorkspace({
      type: 'team',
      id: teamId,
      name: teamName
    });
  };
  
  return (
    <WorkspaceContext.Provider value={{ workspace, switchToPersonal, switchToTeam }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
```

**Workspace Switcher Component:**
```jsx
function WorkspaceSwitcher() {
  const { workspace, switchToPersonal, switchToTeam } = useWorkspace();
  const user = useUser();
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    // Fetch user's teams
    fetch('/api/teams/my-teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);
  
  if (teams.length === 0) {
    return null; // No team workspace button
  }
  
  return (
    <div className="workspace-switcher">
      <button
        className={workspace.type === 'personal' ? 'active' : ''}
        onClick={() => switchToPersonal(user.id)}
      >
        👤 Personal Workspace
      </button>
      
      {teams.map(team => (
        <button
          key={team.id}
          className={workspace.type === 'team' && workspace.id === team.id ? 'active' : ''}
          onClick={() => switchToTeam(team.id, team.name)}
        >
          🏢 Team: {team.name}
        </button>
      ))}
    </div>
  );
}
```

**Visual Indicator:**
```jsx
function WorkspaceIndicator() {
  const { workspace } = useWorkspace();
  
  if (workspace.type === 'personal') {
    return null;
  }
  
  return (
    <div className="workspace-indicator">
      <div className="banner">
        🏢 Team Workspace: <strong>{workspace.name}</strong>
        <span className="info">All earnings go to team leader</span>
      </div>
    </div>
  );
}
```

---

## Service Management in Team Workspace

### Creating Service in Team Context

**Frontend:**
```javascript
function CreateService() {
  const { workspace } = useWorkspace();
  
  const handleSubmit = async (serviceData) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...serviceData,
        workspace_type: workspace.type,
        workspace_id: workspace.id
      })
    });
    
    return response.json();
  };
  
  return (
    <ServiceForm onSubmit={handleSubmit} />
  );
}
```

**Backend:**
```python
@api_view(['POST'])
@require_role('advertiser')
def create_service(request):
    user = request.user
    data = request.data
    
    workspace_type = data.get('workspace_type', 'personal')
    workspace_id = data.get('workspace_id', user.id)
    
    # Verify permissions
    if workspace_type == 'team':
        # Check if user is team member
        is_member = TeamMember.objects.filter(
            team_id=workspace_id,
            user_id=user.id,
            status='active'
        ).exists()
        
        if not is_member:
            return Response({'error': 'Not a team member'}, status=403)
        
        # Get team leader for earnings
        team = Team.objects.get(id=workspace_id)
        earnings_recipient_id = team.leader_id
    else:
        earnings_recipient_id = user.id
    
    # Create service
    service = Service.objects.create(
        game_id=data['game_id'],
        service_type_id=data['service_type_id'],
        workspace_type=workspace_type,
        workspace_owner_id=workspace_id,
        created_by=user.id,
        title=data['title'],
        description=data['description'],
        price_gold=data.get('price_gold'),
        price_usd=data.get('price_usd'),
        price_toman=data.get('price_toman'),
        status='active'
    )
    
    # Log activity
    ServiceActivityLog.objects.create(
        service_id=service.id,
        user_id=user.id,
        action='created',
        changes={
            'title': data['title'],
            'price_gold': data.get('price_gold'),
            'workspace_type': workspace_type
        },
        ip_address=get_client_ip(request)
    )
    
    return Response(service_to_dict(service))
```

### Fetching Services by Workspace

**Backend:**
```python
@api_view(['GET'])
def get_services(request):
    user = request.user
    workspace_type = request.GET.get('workspace_type', 'personal')
    workspace_id = request.GET.get('workspace_id', user.id)
    
    # Verify access
    if workspace_type == 'team':
        is_member = TeamMember.objects.filter(
            team_id=workspace_id,
            user_id=user.id,
            status='active'
        ).exists()
        
        if not is_member:
            return Response({'error': 'Not authorized'}, status=403)
    
    # Fetch services
    services = Service.objects.filter(
        workspace_type=workspace_type,
        workspace_owner_id=workspace_id
    ).select_related('game', 'service_type', 'created_by')
    
    return Response([service_to_dict(s) for s in services])
```

---

## Activity Logging

### Tracking Team Member Actions

**Log Structure:**
```json
{
  "service_id": 123,
  "user_id": 456,
  "user_name": "JohnDoe#1234",
  "action": "updated_price",
  "changes": {
    "field": "price_gold",
    "old_value": 500,
    "new_value": 600
  },
  "ip_address": "192.168.1.1",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Logging Implementation:**
```python
def log_service_activity(service_id, user, action, changes):
    """Log all service modifications"""
    ServiceActivityLog.objects.create(
        service_id=service_id,
        user_id=user.id,
        action=action,
        changes=changes,
        ip_address=get_client_ip(request)
    )

# Usage in update service
@api_view(['PUT'])
def update_service(request, service_id):
    user = request.user
    service = Service.objects.get(id=service_id)
    
    # Verify permissions...
    
    # Track changes
    changes = {}
    if 'price_gold' in request.data:
        changes['price_gold'] = {
            'old': service.price_gold,
            'new': request.data['price_gold']
        }
        service.price_gold = request.data['price_gold']
    
    if 'title' in request.data:
        changes['title'] = {
            'old': service.title,
            'new': request.data['title']
        }
        service.title = request.data['title']
    
    service.save()
    
    # Log activity
    log_service_activity(service_id, user, 'updated', changes)
    
    return Response(service_to_dict(service))
```

### Activity Log Display

**Frontend Component:**
```jsx
function ServiceActivityLog({ serviceId }) {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    fetch(`/api/services/${serviceId}/activity-log`)
      .then(res => res.json())
      .then(data => setActivities(data));
  }, [serviceId]);
  
  return (
    <div className="activity-log">
      <h3>Activity History</h3>
      
      <div className="timeline">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-header">
              <img 
                src={activity.user.discord_avatar_url} 
                alt={activity.user.discord_username}
                className="avatar"
              />
              <span className="username">{activity.user.discord_username}</span>
              <span className="action">{formatAction(activity.action)}</span>
              <span className="time">{formatTime(activity.created_at)}</span>
            </div>
            
            <div className="activity-details">
              {renderChanges(activity.changes)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAction(action) {
  const actions = {
    'created': 'created this service',
    'updated_price': 'updated the price',
    'updated_description': 'updated the description',
    'activated': 'activated the service',
    'deactivated': 'deactivated the service'
  };
  return actions[action] || action;
}

function renderChanges(changes) {
  return Object.entries(changes).map(([field, change]) => (
    <div key={field} className="change">
      <strong>{field}:</strong> {change.old} → {change.new}
    </div>
  ));
}
```

---

## Earnings Distribution

### Team Service Sale

When a team service is purchased:

```python
@api_view(['POST'])
def create_order(request):
    service = Service.objects.get(id=request.data['service_id'])
    buyer = request.user
    
    # Determine earnings recipient
    if service.workspace_type == 'team':
        team = Team.objects.get(id=service.workspace_owner_id)
        earnings_recipient_id = team.leader_id
    else:
        earnings_recipient_id = service.created_by
    
    # Create order
    order = Order.objects.create(
        service_id=service.id,
        buyer_id=buyer.id,
        earnings_recipient_id=earnings_recipient_id,
        price_paid=service.price_gold,
        currency_used='gold',
        status='pending'
    )
    
    # Deduct from buyer wallet
    buyer_wallet = Wallet.objects.get(user_id=buyer.id)
    buyer_wallet.balance_gold -= service.price_gold
    buyer_wallet.save()
    
    # Add to earnings recipient wallet (team leader)
    recipient_wallet = Wallet.objects.get(user_id=earnings_recipient_id)
    recipient_wallet.balance_gold += service.price_gold
    recipient_wallet.save()
    
    # Record transaction
    Transaction.objects.create(
        wallet_id=recipient_wallet.id,
        type='earning',
        amount=service.price_gold,
        currency='gold',
        status='completed',
        related_order_id=order.id
    )
    
    return Response(order_to_dict(order))
```

### Team Earnings Dashboard

```jsx
function TeamEarnings({ teamId }) {
  const [earnings, setEarnings] = useState(null);
  
  useEffect(() => {
    fetch(`/api/teams/${teamId}/earnings`)
      .then(res => res.json())
      .then(data => setEarnings(data));
  }, [teamId]);
  
  return (
    <div className="team-earnings">
      <h2>Team Earnings</h2>
      
      <div className="earnings-summary">
        <div className="stat">
          <label>Total Earnings (Gold)</label>
          <value>{earnings?.total_gold}</value>
        </div>
        <div className="stat">
          <label>Total Earnings (USD)</label>
          <value>${earnings?.total_usd}</value>
        </div>
        <div className="stat">
          <label>Total Orders</label>
          <value>{earnings?.total_orders}</value>
        </div>
      </div>
      
      <div className="earnings-by-member">
        <h3>Contributions by Member</h3>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Services Created</th>
              <th>Orders Generated</th>
              <th>Earnings Contributed</th>
            </tr>
          </thead>
          <tbody>
            {earnings?.by_member.map(member => (
              <tr key={member.user_id}>
                <td>{member.discord_username}</td>
                <td>{member.services_created}</td>
                <td>{member.orders_count}</td>
                <td>{member.earnings_gold} G</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Team Management

### Team Settings

```jsx
function TeamSettings({ teamId }) {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  
  const handleRemoveMember = async (memberId) => {
    await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE'
    });
    // Refresh members list
  };
  
  return (
    <div className="team-settings">
      <h2>Team Settings</h2>
      
      <section>
        <h3>Team Information</h3>
        <input value={team?.name} onChange={...} />
        <textarea value={team?.description} onChange={...} />
      </section>
      
      <section>
        <h3>Team Members</h3>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>{member.discord_username}</td>
                <td>{member.role}</td>
                <td>{formatDate(member.joined_at)}</td>
                <td>
                  {member.role !== 'leader' && (
                    <button onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button onClick={openInviteModal}>Invite Member</button>
      </section>
    </div>
  );
}
```

---

## API Endpoints

### Team Management
```
POST   /api/teams                          - Create team
GET    /api/teams/my-teams                 - Get user's teams
GET    /api/teams/:id                      - Get team details
PUT    /api/teams/:id                      - Update team
DELETE /api/teams/:id                      - Delete team
POST   /api/teams/:id/invite               - Invite member
POST   /api/team-members/:id/accept        - Accept invitation
DELETE /api/teams/:id/members/:memberId    - Remove member
GET    /api/teams/:id/earnings             - Get team earnings
```

### Service Management with Workspace
```
GET    /api/services?workspace_type=team&workspace_id=123  - Get team services
POST   /api/services (with workspace context)              - Create service
PUT    /api/services/:id                                   - Update service
GET    /api/services/:id/activity-log                      - Get activity log
```

---

## Summary

### Key Features
- ✅ Team creation by team advertisers
- ✅ Member invitation and management
- ✅ Context switching (Personal ↔ Team)
- ✅ Collaborative service management
- ✅ Activity logging for accountability
- ✅ Team earnings go to leader
- ✅ Contribution tracking per member

### Technical Implementation
- Workspace context stored in frontend state
- Backend validates team membership on every request
- Services have `workspace_type` and `workspace_owner_id`
- Activity logs track all changes with user attribution
- Earnings automatically routed to team leader's wallet
