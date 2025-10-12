import type { Schema, Struct } from '@strapi/strapi';

export interface SharedBadge extends Struct.ComponentSchema {
  collectionName: 'components_shared_badges';
  info: {
    description: 'Short label for hero / trip qualities';
    displayName: 'Badge';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedExperienceHighlight extends Struct.ComponentSchema {
  collectionName: 'components_shared_experience_highlights';
  info: {
    description: 'Short trip highlight badge';
    displayName: 'Experience Highlight';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

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

export interface TripDay extends Struct.ComponentSchema {
  collectionName: 'components_trip_day';
  info: {
    description: 'A single day within an itinerary';
    displayName: 'day';
  };
  attributes: {
    label: Schema.Attribute.String;
    points: Schema.Attribute.Text;
    summary: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.badge': SharedBadge;
      'shared.experience-highlight': SharedExperienceHighlight;
      'shared.nav-link': SharedNavLink;
      'shared.team-member': SharedTeamMember;
      'trip.day': TripDay;
    }
  }
}
