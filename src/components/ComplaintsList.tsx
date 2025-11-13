import { useEffect, useState } from 'react';
import { Calendar, User, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Complaint {
  id: string;
  citizen_name: string;
  problem_description: string;
  image_url: string;
  location_details: string;
  status: string;
  verification_status: string;
  created_at: string;
  wards: {
    ward_number: string;
    ward_name_en: string;
    ward_name_hi: string;
    ward_name_kn: string;
  };
  problem_categories: {
    name_en: string;
    name_hi: string;
    name_kn: string;
  };
}

interface ComplaintsListProps {
  wardId: string | null;
  refresh?: number;
}

export function ComplaintsList({ wardId, refresh }: ComplaintsListProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    loadComplaints();
  }, [wardId, refresh]);

  async function loadComplaints() {
    setLoading(true);
    let query = supabase
      .from('complaints')
      .select(`
        *,
        wards (ward_number, ward_name_en, ward_name_hi, ward_name_kn),
        problem_categories (name_en, name_hi, name_kn)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (wardId) {
      query = query.eq('ward_id', wardId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading complaints:', error);
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case 'legitimate': return 'bg-green-100 text-green-800';
      case 'suspicious': return 'bg-orange-100 text-orange-800';
      case 'spam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN');
  };

  const getCategoryName = (category: any) => {
    if (!category) return '';
    if (language === 'hi') return category.name_hi;
    if (language === 'kn') return category.name_kn;
    return category.name_en;
  };

  const getWardName = (ward: any) => {
    if (!ward) return '';
    if (language === 'hi') return ward.ward_name_hi;
    if (language === 'kn') return ward.ward_name_kn;
    return ward.ward_name_en;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>{t.noComplaints}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{t.recentComplaints}</h2>
      {complaints.map((complaint) => (
        <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <img
              src={complaint.image_url}
              alt="Problem"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {getCategoryName(complaint.problem_categories)}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {complaint.location_details} - {getWardName(complaint.wards)} ({complaint.wards.ward_number})
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {t[complaint.status as keyof typeof t] || complaint.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(complaint.verification_status)}`}>
                    {t[complaint.verification_status as keyof typeof t] || complaint.verification_status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700">{complaint.problem_description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {complaint.citizen_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(complaint.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
