import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Briefcase, Mail, Phone, Award, User } from "lucide-react";

export default function RecommendedCandidates({ shift }) {
  const [recommendations, setRecommendations] = useState([]);
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
  shifts_completed: u.shifts_completed
})), null, 2)}

Return the top 5 best matching candidate emails ranked by fit. Consider:
1. Skills match with requirements (most important)
2. Experience level (more is better)
3. Location proximity
4. Worker rating
5. Track record (shifts completed)

Return ONLY a JSON array of candidate emails in ranked order, nothing else.`,
          response_json_schema: {
            type: "object",
            properties: {
              recommended_emails: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        const topEmails = result.recommended_emails || [];
        const matched = allUsers
          .filter(u => topEmails.includes(u.email))
          .sort((a, b) => topEmails.indexOf(a.email) - topEmails.indexOf(b.email))
          .slice(0, 5);

        setRecommendations(matched);
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
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-light text-white"
                      style={{ backgroundColor: 'var(--terracotta)' }}
                    >
                      {candidate.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-normal text-lg" style={{ color: 'var(--earth)' }}>
                        {candidate.full_name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--clay)' }}>
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
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                          SKILLS MATCH ({matchingSkills.length}/{shift.skills_required?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {candidateSkills.slice(0, 6).map((skill, idx) => (
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