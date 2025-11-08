import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { GraduationCap, Search } from 'lucide-react';

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

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-4">
          <GraduationCap className="w-12 h-12 text-purple-600 mx-auto mb-2" />
          <h3 className="text-xl mb-1">Select your school</h3>
          <p className="text-sm text-gray-600">This helps us connect you with your campus community</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for your school..."
            className="pl-10"
          />
        </div>

        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredSchools.map((school) => (
            <button
              key={school}
              onClick={() => {
                onChange(school);
                if (school !== 'Other') {
                  setCustomSchool('');
                }
              }}
              className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b last:border-b-0 ${
                value === school ? 'bg-purple-100 text-purple-700' : ''
              }`}
            >
              {school}
            </button>
          ))}
          {filteredSchools.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No schools found. Try searching differently or select "Other".
            </div>
          )}
        </div>

        {value === 'Other' && (
          <div className="mt-4">
            <Label htmlFor="customSchool">Enter your school name</Label>
            <Input
              id="customSchool"
              value={customSchool}
              onChange={(e) => setCustomSchool(e.target.value)}
              placeholder="Enter school name"
            />
          </div>
        )}

        {value && value !== 'Other' && (
          <div className="bg-purple-50 rounded-lg p-3 text-sm">
            <span className="text-gray-600">Selected: </span>
            <span className="text-purple-700">{value}</span>
          </div>
        )}

        {value === 'Other' && customSchool && (
          <div className="bg-purple-50 rounded-lg p-3 text-sm">
            <span className="text-gray-600">Selected: </span>
            <span className="text-purple-700">{customSchool}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { SCHOOLS };
