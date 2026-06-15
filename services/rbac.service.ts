export type Role = 'SUPERADMIN' | 'EMPLOYER' | 'CANDIDATE';

export interface Permission {
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
  resource: 'JOB' | 'CANDIDATE' | 'INTERVIEW' | 'TENANT' | 'ALL';
}

export class RBACService {
  /**
   * Internal Policy Engine.
   * Defines what actions each role is allowed to perform.
   */
  private static policies: Record<Role, Permission[]> = {
    SUPERADMIN: [
      { action: 'MANAGE', resource: 'ALL' }
    ],
    EMPLOYER: [
      { action: 'MANAGE', resource: 'JOB' },
      { action: 'MANAGE', resource: 'INTERVIEW' },
      { action: 'READ', resource: 'CANDIDATE' },
    ],
    CANDIDATE: [
      { action: 'READ', resource: 'JOB' },
      { action: 'MANAGE', resource: 'CANDIDATE' }, // Own profile
      { action: 'READ', resource: 'INTERVIEW' },
    ]
  };

  /**
   * Evaluates if a given role has the required permission context.
   */
  static isAllowed(role: Role, action: Permission['action'], resource: Permission['resource']): boolean {
    const rolePolicies = this.policies[role] || [];
    
    // Superadmin override
    if (rolePolicies.some(p => p.action === 'MANAGE' && p.resource === 'ALL')) {
        return true;
    }

    return rolePolicies.some(
      (p) => (p.action === action || p.action === 'MANAGE') && p.resource === resource
    );
  }
}
