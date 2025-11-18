import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { GraduationCap, Search, Check } from 'lucide-react';

const SCHOOLS = [
  // Ivy League
  'Harvard University',
  'Yale University',
  'Princeton University',
  'Columbia University',
  'University of Pennsylvania',
  'Brown University',
  'Dartmouth College',
  'Cornell University',
  
  // Top Public Universities
  'University of California, Berkeley',
  'University of California, Los Angeles (UCLA)',
  'University of Michigan',
  'University of Virginia',
  'University of North Carolina at Chapel Hill',
  'University of California, San Diego',
  'University of California, Irvine',
  'University of California, Santa Barbara',
  'University of California, Davis',
  'University of Florida',
  'Georgia Institute of Technology',
  'University of Texas at Austin',
  'University of Wisconsin-Madison',
  'University of Illinois Urbana-Champaign',
  'University of Washington',
  
  // Private Universities
  'Stanford University',
  'Massachusetts Institute of Technology (MIT)',
  'Duke University',
  'Northwestern University',
  'Johns Hopkins University',
  'Vanderbilt University',
  'Rice University',
  'Washington University in St. Louis',
  'Emory University',
  'Georgetown University',
  'University of Southern California',
  'Carnegie Mellon University',
  'University of Notre Dame',
  'Tufts University',
  'New York University',
  'Boston University',
  'Case Western Reserve University',
  
  // Liberal Arts Colleges
  'Williams College',
  'Amherst College',
  'Swarthmore College',
  'Wellesley College',
  'Pomona College',
  'Bowdoin College',
  'Claremont McKenna College',
  'Middlebury College',
  'Carleton College',
  'Davidson College',
  
  // State Universities
  'Ohio State University',
  'Penn State University',
  'Michigan State University',
  'Indiana University',
  'University of Arizona',
  'Arizona State University',
  'University of Colorado Boulder',
  'University of Maryland',
  'Rutgers University',
  'University of Minnesota',
  'University of Iowa',
  'Purdue University',
  'University of Pittsburgh',
  'Virginia Tech',
  'Texas A&M University',
  'University of Georgia',
  'Florida State University',
  'University of South Carolina',
  'University of Alabama',
  'Auburn University',
  'University of Tennessee',
  'University of Kentucky',
  'Louisiana State University',
  'University of Oklahoma',
  'University of Kansas',
  'University of Nebraska',
  'University of Oregon',
  'University of Utah',
  'San Diego State University',
  
  // Test/Other
  'TestUniversity',
  'Other'
];

interface SchoolSelectorProps {
  value: string;
  onChange: (school: string) => void;
}

export function SchoolSelector({ value, onChange }: SchoolSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customSchool, setCustomSchool] = useState('');

  const filteredSchools = SCHOOLS.filter(school =>
    school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group schools alphabetically
  const groupedSchools = filteredSchools.reduce((acc, school) => {
    const firstLetter = school.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(school);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="w-full">
      {/* Title */}
      <h2 
        className="text-[26px] font-semibold mb-1"
        style={{ color: '#F9FAFF' }}
      >
        Select your school
      </h2>
      
      {/* Subtitle */}
      <p 
        className="text-[15px] font-medium mb-5"
        style={{ color: '#A7AABB' }}
      >
        This helps us connect you with your campus community
      </p>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
          style={{ color: '#757A89' }}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for your school..."
          className="w-full pl-12 pr-4 h-[48px] rounded-[12px] border"
          style={{
            backgroundColor: '#171B24',
            color: '#F9FAFF',
            fontSize: '15px',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0A84FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Selected School Indicator */}
      {value && value !== 'Other' && (
        <p 
          className="text-sm font-medium mb-4"
          style={{ color: '#0A84FF' }}
        >
          Connected to: {value}
        </p>
      )}

      {/* School List - iOS Style */}
      <div 
        className="rounded-[12px] overflow-hidden"
        style={{
          backgroundColor: '#11141C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxHeight: 'calc(100vh - 400px)',
          overflowY: 'auto'
        }}
      >
        {Object.entries(groupedSchools).map(([letter, schools]) => (
          <div key={letter}>
            <div 
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#757A89'
              }}
            >
              {letter}
            </div>
            {schools.map((school) => (
              <button
                key={school}
                onClick={() => {
                  onChange(school);
                  if (school !== 'Other') {
                    setCustomSchool('');
                  }
                }}
                className="w-full text-left px-4 h-[56px] flex items-center justify-between border-b last:border-b-0 transition-all active:opacity-70"
                style={{
                  backgroundColor: value === school 
                    ? 'rgba(10, 132, 255, 0.1)' 
                    : 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  color: value === school ? '#0A84FF' : '#F9FAFF',
                  fontSize: '15px'
                }}
              >
                <span className="font-medium">{school}</span>
                {value === school && (
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#0A84FF' }} />
                )}
              </button>
            ))}
          </div>
        ))}
        {filteredSchools.length === 0 && (
          <div className="px-4 py-8 text-center" style={{ color: '#757A89' }}>
            No schools found. Try searching differently or select "Other".
          </div>
        )}
      </div>

      {value === 'Other' && (
        <div className="mt-4">
          <Input
            id="customSchool"
            value={customSchool}
            onChange={(e) => {
              setCustomSchool(e.target.value);
              if (e.target.value) {
                onChange('Other');
              }
            }}
            placeholder="Enter school name"
            className="w-full h-[48px] rounded-[12px] border px-4"
            style={{
              backgroundColor: '#171B24',
              color: '#F9FAFF',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              fontSize: '15px'
            }}
          />
        </div>
      )}

      {value === 'Other' && customSchool && (
        <p 
          className="text-sm font-medium mt-4"
          style={{ color: '#0A84FF' }}
        >
          Connected to: {customSchool}
        </p>
      )}
    </div>
  );
}

export { SCHOOLS };
