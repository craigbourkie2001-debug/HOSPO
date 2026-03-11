import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Calendar, Clock, DollarSign, Award } from "lucide-react";
import ShiftCard from "../shifts/ShiftCard";

export default function RecommendedShifts({ user, onApply }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { data: availableShifts } = useQuery({
    queryKey: ['availableShiftsForMatching'],
    queryFn: async () => {
      const available = await base44.entities.Shift.filter({ status: 'available' }, '-created_date', 50);
      const applicationsOpen = await base44.entities.Shift.filter({ status: 'applications_open' }, '-created_date', 50);
      return [...available, ...applicationsOpen];
    },
    initialData: [],
  });

  useEffect(() => {
    if (!user || !availableShifts || availableShifts.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    const analyzeMatches = async () => {
      setIsAnalyzing(true);
      try {
        const userSkills = user.worker_type === 'chef' 
          ? user.chef_skills || []
          : user.worker_type === 'both'
          ? [...(user.barista_skills || []), ...(user.chef_skills || [])]
          : user.barista_skills || [];

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze and rank these shifts for a ${user.worker_type} with ${user.experience_years} years experience.

Worker Profile:
- Skills: ${userSkills.join(', ')}
- Location: ${user.location}
- Available days: ${(user.availability || []).join(', ')}
- Experience: ${user.experience_years} years
- Rating: ${user.rating || 0}/5

Available Shifts (JSON):
${JSON.stringify(availableShifts.slice(0, 20).map(s => ({
  id: s.id,
  venue_name: s.venue_name,
  role_type: s.role_type,
  chef_level: s.chef_level,
  location: s.location,
  date: s.date,
  hourly_rate: s.hourly_rate,
  skills_required: s.skills_required
})), null, 2)}

Return the top 5 best matching shift IDs ranked by compatibility. Consider:
1. Skills match (most important)
2. Location proximity to ${user.location}
3. Role type match
4. Experience level fit
5. Day availability

Return ONLY a JSON array of shift IDs in ranked order, nothing else.`,
          response_json_schema: {
            type: "object",
            properties: {
              recommended_shift_ids: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        const topShiftIds = result.recommended_shift_ids || [];
        const matched = availableShifts
          .filter(s => topShiftIds.includes(s.id))
          .sort((a, b) => topShiftIds.indexOf(a.id) - topShiftIds.indexOf(b.id))
          .slice(0, 5);

        setRecommendations(matched);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
        setRecommendations(availableShifts.slice(0, 3));
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeMatches();
  }, [user, availableShifts]);

  if (!user) return null;

  return (
    <Card className="border rounded-2xl mb-8" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />
          <CardTitle className="font-normal" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Recommended For You
          </CardTitle>
        </div>
        <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
          AI-matched shifts based on your profile
        </p>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 mb-3" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
            <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>Analyzing matches...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((shift, index) => (
              <div key={shift.id} className="relative">
                {index === 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 z-10 rounded-lg font-normal"
                    style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
                  >
                    Best Match
                  </Badge>
                )}
                <ShiftCard shift={shift} onApply={() => onApply(shift)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              No matching shifts found at the moment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}