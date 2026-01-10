import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface UseCase {
  title: string;
  description: string;
  role: string;
  icon: React.ReactNode;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  WHITEBOARD = 'WHITEBOARD',
  FEATURES = 'FEATURES',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  USE_CASES = 'USE_CASES',
  // Product Pages
  PRICING = 'PRICING',
  API_ACCESS = 'API_ACCESS',
  INTEGRATIONS = 'INTEGRATIONS',
  // Company Pages
  ABOUT_US = 'ABOUT_US',
  BLOG = 'BLOG',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS'
}