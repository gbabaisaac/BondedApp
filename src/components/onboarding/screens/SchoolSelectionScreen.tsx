import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './SchoolSelectionScreen.module.css';

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
];

interface SchoolSelectionScreenProps {
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  selectedSchool: { id: string; name: string } | null;
  onSchoolSelect: (school: { id: string; name: string }) => void;
}

export const SchoolSelectionScreen: React.FC<SchoolSelectionScreenProps> = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  selectedSchool,
  onSchoolSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredSchools = useMemo(() => {
    if (!searchTerm) return SCHOOLS;
    return SCHOOLS.filter(school =>
      school.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Group schools alphabetically
  const groupedSchools = useMemo(() => {
    return filteredSchools.reduce((acc, school) => {
      const firstLetter = school.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(school);
      return acc;
    }, {} as Record<string, string[]>);
  }, [filteredSchools]);

  const handleSchoolClick = (schoolName: string) => {
    onSchoolSelect({
      id: schoolName.toLowerCase().replace(/\s+/g, '-'),
      name: schoolName,
    });
  };

  const handleCustomSchoolSubmit = () => {
    if (customSchool.trim()) {
      onSchoolSelect({
        id: customSchool.toLowerCase().replace(/\s+/g, '-'),
        name: customSchool,
      });
      setShowCustomInput(false);
    }
  };

  const canProceed = selectedSchool !== null;

  return (
    <div 
      className={styles.container}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ScreenHeader 
        onBack={onBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <div 
        className={styles.content}
        style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          bottom: '120px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          padding: '24px 20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ContentHeader
            stepLabel="YOUR SCHOOL"
            title="Where do you go?"
            description="Connect with students at your campus"
          />

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for your school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selected School */}
          {selectedSchool && (
            <motion.div
              className={styles.selectedSchool}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check size={16} />
              <span>Selected: {selectedSchool.name}</span>
            </motion.div>
          )}

          {/* Custom School Input */}
          {!showCustomInput && (
            <button
              className={styles.customButton}
              onClick={() => setShowCustomInput(true)}
            >
              Don't see your school? Add it manually
            </button>
          )}

          {showCustomInput && (
            <motion.div
              className={styles.customInputContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <input
                type="text"
                className={styles.customInput}
                placeholder="Enter your school name..."
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSchoolSubmit()}
              />
              <div className={styles.customActions}>
                <button
                  className={styles.customCancel}
                  onClick={() => setShowCustomInput(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.customSubmit}
                  onClick={handleCustomSchoolSubmit}
                  disabled={!customSchool.trim()}
                >
                  Add School
                </button>
              </div>
            </motion.div>
          )}

          {/* School List */}
          <div className={styles.schoolList}>
            {Object.keys(groupedSchools).sort().map((letter, index) => (
              <motion.div
                key={letter}
                className={styles.schoolGroup}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className={styles.groupHeader}>{letter}</div>
                {groupedSchools[letter].map((school) => (
                  <button
                    key={school}
                    className={`${styles.schoolItem} ${
                      selectedSchool?.name === school ? styles.schoolItemSelected : ''
                    }`}
                    onClick={() => handleSchoolClick(school)}
                  >
                    <span className={styles.schoolName}>{school}</span>
                    {selectedSchool?.name === school && (
                      <Check className={styles.checkIcon} size={20} />
                    )}
                  </button>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};


