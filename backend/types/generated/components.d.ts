import type { Schema, Struct } from '@strapi/strapi';

export interface SharedTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    displayName: 'Team Member';
    icon: 'alien';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.team-member': SharedTeamMember;
    }
  }
}
