import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface SchoolColors {
  primary: string;
  secondary: string;
  accent: string;
  bgGradientStart: string;
  bgGradientEnd: string;
}

interface School {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  colors: SchoolColors;
}

interface ThemeContextType {
  school: School | null;
  colors: SchoolColors;
  isLoading: boolean;
  setSchoolColors: (school: School) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// School colors database - HSL format for Tailwind compatibility
const SCHOOL_COLORS: Record<string, SchoolColors> = {
  'illinois.edu': {
    primary: '10 78% 53%', // UIUC Orange #E84A27
    secondary: '221 63% 22%', // UIUC Navy #13294B  
    accent: '10 100% 64%', // Light Orange #FF6F47
    bgGradientStart: '23 100% 98%', // #FFF8F5
    bgGradientEnd: '14 100% 94%', // #FFE8E0
  },
  'umich.edu': {
    primary: '210 100% 15%', // Michigan Navy #00274C
    secondary: '211 54% 41%', // Michigan Blue #2F65A7
    accent: '48 100% 50%', // Michigan Maize #FFCB05
    bgGradientStart: '220 100% 98%', // #F5F8FF
    bgGradientEnd: '220 100% 96%', // #E8EFFF
  },
  'stanford.edu': {
    primary: '0 77% 31%', // Stanford Cardinal #8C1515
    secondary: '352 45% 48%', // Light Cardinal #B83A4B
    accent: '0 11% 16%', // Stanford Dark Brown #2F2424
    bgGradientStart: '0 100% 99%', // #FFF8F8
    bgGradientEnd: '0 100% 95%', // #FFEAEA
  },
  'berkeley.edu': {
    primary: '223 100% 20%', // Berkeley Blue #003262
    secondary: '45 100% 51%', // Berkeley Gold #FDB515
    accent: '223 100% 40%', // Light Blue
    bgGradientStart: '223 100% 98%',
    bgGradientEnd: '223 100% 96%',
  },
  'ucla.edu': {
    primary: '205 67% 41%', // UCLA Blue #2774AE
    secondary: '207 70% 57%', // Light UCLA Blue #4A9FDB
    accent: '48 100% 50%', // UCLA Gold #FFD100
    bgGradientStart: '207 100% 98%', // #F5FAFF
    bgGradientEnd: '207 100% 95%', // #E5F3FF
  },
  'usc.edu': {
    primary: '0 100% 30%', // USC Cardinal #990000
    secondary: '0 100% 40%', // Light USC Cardinal #CC0000
    accent: '48 100% 50%', // USC Gold #FFCC00
    bgGradientStart: '23 100% 98%', // #FFFAF5
    bgGradientEnd: '27 100% 95%', // #FFF0E5
  },
  'duke.edu': {
    primary: '212 98% 20%', // Duke Royal Blue #012169
    secondary: '213 64% 33%', // Duke Blue #1F4788
    accent: '210 100% 20%', // Duke Navy #003366
    bgGradientStart: '220 100% 98%', // #F5F8FF
    bgGradientEnd: '220 100% 96%', // #E8EEFF
  },
  'mit.edu': {
    primary: '0 70% 35%', // MIT Cardinal #8A0A2B
    secondary: '0 0% 50%', // Gray
    accent: '0 70% 50%', // Light Cardinal
    bgGradientStart: '0 100% 98%',
    bgGradientEnd: '0 100% 96%',
  },
  'harvard.edu': {
    primary: '0 100% 29%', // Harvard Crimson #A51C30
    secondary: '0 0% 13%', // Black
    accent: '0 100% 44%', // Light Crimson
    bgGradientStart: '0 100% 98%',
    bgGradientEnd: '0 100% 96%',
  },
  'default': {
    primary: '10 78% 53%', // Default UIUC Orange
    secondary: '10 100% 64%',
    accent: '221 63% 22%',
    bgGradientStart: '23 100% 98%',
    bgGradientEnd: '14 100% 94%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAppStore();
  const [school, setSchool] = useState<School | null>(null);
  const [colors, setColors] = useState<SchoolColors>(SCHOOL_COLORS['default']);
  const [isLoading, setIsLoading] = useState(true);

  const setSchoolColors = (schoolData: School) => {
    const schoolColors = SCHOOL_COLORS[schoolData.domain] || SCHOOL_COLORS['default'];
    setColors(schoolColors);
    setSchool(schoolData);
    applyColors(schoolColors);
  };

  const applyColors = (schoolColors: SchoolColors) => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    
    root.style.setProperty('--primary', schoolColors.primary);
    root.style.setProperty('--secondary', schoolColors.secondary);
    root.style.setProperty('--accent', schoolColors.accent);
    root.style.setProperty('--bg-gradient-start', schoolColors.bgGradientStart);
    root.style.setProperty('--bg-gradient-end', schoolColors.bgGradientEnd);

    // Also set RGB values for shadows
    const primaryHSL = schoolColors.primary.split(' ');
    root.style.setProperty('--primary-h', primaryHSL[0]);
    root.style.setProperty('--primary-s', primaryHSL[1]);
    root.style.setProperty('--primary-l', primaryHSL[2]);
  };

  useEffect(() => {
    // Initialize theme based on user profile
    if (userProfile?.school) {
      // Try to match by domain first, then by school name
      let schoolDomain = 'default';
      const schoolName = typeof userProfile.school === 'string' 
        ? userProfile.school 
        : userProfile.school.name || userProfile.school;
      
      // Map school names to domains
      const nameToDomainnMap: Record<string, string> = {
        'University of Illinois Urbana-Champaign': 'illinois.edu',
        'University of Illinois': 'illinois.edu',
        'UIUC': 'illinois.edu',
        'University of Michigan': 'umich.edu',
        'Michigan': 'umich.edu',
        'Stanford University': 'stanford.edu',
        'Stanford': 'stanford.edu',
        'University of California Los Angeles': 'ucla.edu',
        'UCLA': 'ucla.edu',
        'University of Southern California': 'usc.edu',
        'USC': 'usc.edu',
        'Duke University': 'duke.edu',
        'Duke': 'duke.edu',
      };
      
      if (typeof userProfile.school === 'object' && userProfile.school.domain) {
        schoolDomain = userProfile.school.domain;
      } else if (nameToDomainnMap[schoolName]) {
        schoolDomain = nameToDomainnMap[schoolName];
      }
      
      const schoolData: School = {
        id: schoolDomain,
        name: schoolName,
        shortName: schoolName,
        domain: schoolDomain,
        colors: SCHOOL_COLORS[schoolDomain] || SCHOOL_COLORS['default'],
      };
      setSchoolColors(schoolData);
    } else {
      // Apply default colors
      applyColors(SCHOOL_COLORS['default']);
    }
    
    setIsLoading(false);
  }, [userProfile?.school]);

  return (
    <ThemeContext.Provider value={{ school, colors, isLoading, setSchoolColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Hook to get available schools
export const useSchools = () => {
  return Object.entries(SCHOOL_COLORS).map(([domain, colors]) => ({
    domain,
    colors,
  }));
};

