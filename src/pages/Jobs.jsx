import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Briefcase, Coffee, ChefHat, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "../components/jobs/JobCard";
import ApplyJobModal from "../components/jobs/ApplyJobModal";
import PullToRefresh from "../components/mobile/PullToRefresh";
import MobileHeader from "../components/mobile/MobileHeader";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
    initialData: [],
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmployment = employmentFilter === "all" || job.employment_type === employmentFilter;
    
    return matchesSearch && matchesEmployment;
  });

  const fullTimeCount = jobs.filter(j => j.employment_type === 'full_time').length;
  const partTimeCount = jobs.filter(j => j.employment_type === 'part_time').length;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <MobileHeader title="Jobs" icon={Briefcase} />
      <div className="min-h-screen p-6 md:p-12 md:pt-12 pt-24" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            Contracted Jobs
          </h1>
          <p className="text-lg font-light tracking-wide" style={{ color: 'var(--clay)' }}>
            Full-time and part-time positions across Irish hospitality
          </p>
        </div>

        {/* Employment Type Tabs */}
        <Tabs value={employmentFilter} onValueChange={setEmploymentFilter} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid p-1.5 rounded-2xl h-auto" style={{ backgroundColor: 'var(--sand)' }}>
            <TabsTrigger 
              value="all" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all"
              style={{ color: 'var(--earth)' }}
            >
              All Jobs ({jobs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="full_time" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all flex items-center gap-2"
              style={{ color: 'var(--earth)' }}
            >
              <Briefcase className="w-4 h-4" />
              Full-Time ({fullTimeCount})
            </TabsTrigger>
            <TabsTrigger 
              value="part_time" 
              className="rounded-xl py-3 px-6 font-normal tracking-wide data-[state=active]:bg-white transition-all flex items-center gap-2"
              style={{ color: 'var(--earth)' }}
            >
              <Clock className="w-4 h-4" />
              Part-Time ({partTimeCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            <Input
              placeholder="Search by job title, venue, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 rounded-2xl border text-base"
              style={{ 
                borderColor: 'var(--sand)',
                backgroundColor: 'var(--warm-white)',
                color: 'var(--earth)'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {filteredJobs.length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>OPEN POSITIONS</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {fullTimeCount}
            </div>
            <div className="text-xs tracking-wider opacity-90">FULL-TIME</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {partTimeCount}
            </div>
            <div className="text-xs tracking-wider opacity-90">PART-TIME</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl hover-lift"
            style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}
          >
            <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              {[...new Set(jobs.map(j => j.venue_id))].length}
            </div>
            <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>VENUES HIRING</div>
          </motion.div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sand)' }} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ backgroundColor: 'var(--warm-white)', border: '1px solid var(--sand)' }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <Search className="w-10 h-10" style={{ color: 'var(--clay)', strokeWidth: 1.5 }} />
            </div>
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              No jobs found
            </h3>
            <p className="font-light" style={{ color: 'var(--clay)' }}>
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard job={job} onApply={setSelectedJob} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

          {selectedJob && (
            <ApplyJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}