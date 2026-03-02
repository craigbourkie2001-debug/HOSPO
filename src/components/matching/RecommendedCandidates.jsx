import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Briefcase, Mail, Phone, Award, User } from "lucide-react";

export default function RecommendedCandidates({ shift }) {
  const [recommendations, setRecommendations] = useState([]);
  const [matchInsights, setMatchInsights] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { data: allUsers } = useQuery({
    queryKey: ['potentialCandidates'],
    queryFn: () => base44.entities.User.list('-rating', 100),
    initialData: [],
  });

  useEffect(() => {
    if (!shift || !allUsers || allUsers.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    const analyzeMatches = async () => {
      setIsAnalyzing(true);
      try {
        const isChefShift = shift.role_type === 'chef';
        const candidates = allUsers
          .filter(u => {
            if (!u.availability || u.availability.length === 0) return false;
            if (isChefShift && u.worker_type !== 'chef' && u.worker_type !== 'both') return false;
            if (!isChefShift && u.worker_type !== 'barista' && u.worker_type !== 'both') return false;
            return true;
          })
          .slice(0, 30);

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze and rank these candidates for a ${shift.role_type} shift.

Shift Requirements:
- Role: ${shift.role_type}${shift.chef_level ? ` (${shift.chef_level})` : ''}
- Location: ${shift.location}
- Required skills: ${(shift.skills_required || []).join(', ')}
- Date: ${shift.date}
- Pay: €${shift.hourly_rate}/hr

Candidates (JSON):
${JSON.stringify(candidates.map(u => ({
  email: u.email,
  name: u.full_name,
  worker_type: u.worker_type,
  location: u.location,
  experience_years: u.experience_years,
  barista_skills: u.barista_skills,
  chef_skills: u.chef_skills,
  rating: u.rating,
  shifts_completed: u.shifts_completed,
  availability: u.availability,
  preferred_shift_times: u.preferred_shift_times,
  desired_hourly_rate_min: u.desired_hourly_rate_min,
  desired_hourly_rate_max: u.desired_hourly_rate_max
})), null, 2)}

Return the top 5 best matching candidates with detailed analysis. For each candidate provide:
1. Match score (0-100)
2. Key strengths (2-3 bullet points)
3. Why they're a good fit (1-2 sentences)
4. Any potential concerns

Rank by:
1. Skills match (40% weight) - exact matches are critical
2. Experience level (20% weight)
3. Rating & past performance (20% weight)
4. Location match (10% weight)
5. Availability & pay expectations (10% weight)`,
          response_json_schema: {
            type: "object",
            properties: {
              candidates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    match_score: { type: "number" },
                    strengths: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reason: { type: "string" },
                    concerns: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const rankedCandidates = result.candidates || [];
        const insights = {};
        rankedCandidates.forEach(c => {
          insights[c.email] = {
            match_score: c.match_score,
            strengths: c.strengths,
            reason: c.reason,
            concerns: c.concerns
          };
        });

        const matched = allUsers
          .filter(u => rankedCandidates.some(c => c.email === u.email))
          .sort((a, b) => {
            const aIndex = rankedCandidates.findIndex(c => c.email === a.email);
            const bIndex = rankedCandidates.findIndex(c => c.email === b.email);
            return aIndex - bIndex;
          })
          .slice(0, 5);

        setRecommendations(matched);
        setMatchInsights(insights);
      } catch (error) {
        console.error('Failed to generate candidate recommendations:', error);
        const fallback = allUsers
          .filter(u => u.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setRecommendations(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeMatches();
  }, [shift, allUsers]);

  if (!shift) return null;

  const isChefShift = shift.role_type === 'chef';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
        <h3 className="text-xl font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
          AI-Recommended Candidates
        </h3>
      </div>

      {isAnalyzing ? (
        <Card className="border rounded-xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 mb-3" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
            <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>Analyzing candidates...</p>
          </CardContent>
        </Card>
      ) : recommendations.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((candidate, index) => {
            const candidateSkills = isChefShift ? (candidate.chef_skills || []) : (candidate.barista_skills || []);
            const matchingSkills = candidateSkills.filter(s => shift.skills_required?.includes(s));
            const insights = matchInsights[candidate.email] || {};
            
            return (
              <Card 
                key={candidate.email} 
                className="border rounded-xl hover-lift transition-all relative"
                style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}
              >
                {index === 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 z-10 rounded-lg font-normal"
                    style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                  >
                    Top Match
                  </Badge>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    {candidate.profile_picture_url ? (
                      <img 
                        src={candidate.profile_picture_url} 
                        alt={candidate.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-light text-white"
                        style={{ backgroundColor: 'var(--terracotta)' }}
                      >
                        {(candidate.legal_first_name || candidate.full_name)?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>
                        {(candidate.legal_first_name && candidate.legal_last_name)
                          ? `${candidate.legal_first_name} ${candidate.legal_last_name}`
                          : candidate.full_name || candidate.email?.split('@')[0]}
                      </h4>
                      <div className="flex items-center gap-3 text-sm flex-wrap" style={{ color: 'var(--clay)' }}>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {candidate.experience_years || 0} yrs
                        </span>
                        {candidate.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" style={{ color: 'var(--terracotta)' }} />
                            {candidate.rating.toFixed(1)}
                          </span>
                        )}
                        {insights.match_score && (
                          <Badge 
                            className="text-xs font-normal"
                            style={{ 
                              backgroundColor: insights.match_score >= 80 ? 'var(--sage)' : 
                                              insights.match_score >= 60 ? 'var(--olive)' : 'var(--clay)',
                              color: 'white'
                            }}
                          >
                            {insights.match_score}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {insights.reason && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--sand)' }}>
                        <div className="text-xs tracking-wider mb-1" style={{ color: 'var(--clay)' }}>
                          WHY RECOMMENDED
                        </div>
                        <p className="text-sm font-light" style={{ color: 'var(--earth)' }}>
                          {insights.reason}
                        </p>
                      </div>
                    )}

                    {insights.strengths && insights.strengths.length > 0 && (
                      <div>
                        <div className="text-xs tracking-wider mb-2" style={{ color: 'var(--clay)' }}>
                          KEY STRENGTHS
                        </div>
                        <ul className="space-y-1">
                          {insights.strengths.map((strength, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--earth)' }}>
                              <span style={{ color: 'var(--sage)' }}>✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs" style={{ color: 'var(--clay)' }}>
                      <div className="flex items-center gap-1 mb-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="w-3 h-3" />
                          {candidate.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {candidate.location}
                      </div>
                    </div>

                    {candidateSkills.length > 0 && (
                      <div>
                        <div className="text-xs tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--clay)' }}>
                          <Award className="w-3 h-3" />
                          SKILLS ({matchingSkills.length}/{shift.skills_required?.length || 0} match required)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {candidateSkills.slice(0, 8).map((skill, idx) => (
                            <Badge
                              key={idx}
                              className="text-xs font-normal"
                              style={shift.skills_required?.includes(skill) ? {
                                backgroundColor: 'var(--sage)',
                                color: 'white',
                                border: 'none'
                              } : {
                                backgroundColor: 'transparent',
                                border: '1px solid var(--sand)',
                                color: 'var(--clay)'
                              }}
                            >
                              {skill.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insights.concerns && (
                      <div className="text-xs p-2 rounded" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                        ⚠️ {insights.concerns}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-normal"
                      onClick={() => window.location.href = `mailto:${candidate.email}?subject=Shift Opportunity - ${shift.venue_name}`}
                      style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Candidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border rounded-xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--cream)' }}>
          <CardContent className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              No matching candidates found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}